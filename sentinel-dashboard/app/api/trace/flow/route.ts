import { NextRequest, NextResponse } from "next/server";
import type { FlowResult, FlowPath, FlowNode } from "@/lib/types/flow";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { from, to, chain = "ethereum", maxHops = 3 } = await request.json();

    // Validation
    if (!from || !to) {
      return NextResponse.json(
        { error: "Both 'from' and 'to' addresses are required" },
        { status: 400 }
      );
    }

    if (from.toLowerCase() === to.toLowerCase()) {
      return NextResponse.json(
        { error: "Source and destination cannot be the same" },
        { status: 400 }
      );
    }

    const hops = Math.min(Math.max(maxHops, 1), 5); // Clamp 1-5

    console.log(`💸 [Flow Trace] Tracing ${from} → ${to} (max ${hops} hops)`);

    // Get chain ID
    const chainId = getChainId(chain);
    const apiKey = process.env.ETHERSCAN_API_KEY;

    // BFS to find paths
    const paths = await findFlowPaths(from, to, chainId, apiKey, hops);

    // Calculate total amount
    const totalAmount = paths.reduce((sum, path) => {
      const pathTotal = path.amounts.reduce((a, b) => a + b, 0);
      return sum + pathTotal;
    }, 0);

    const executionTime = Date.now() - startTime;

    console.log(`✅ [Flow Trace] Found ${paths.length} paths in ${executionTime}ms`);

    return NextResponse.json({
      success: true,
      from,
      to,
      chain,
      paths,
      totalAmount,
      found: paths.length > 0,
      searchDepth: hops,
      executionTime,
    } as FlowResult);

  } catch (error: any) {
    console.error("❌ [Flow Trace] Error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to trace flow"
      },
      { status: 500 }
    );
  }
}

// Helper: Get Chain ID
function getChainId(chainName: string): number {
  const c = chainName.toLowerCase();
  switch (c) {
    case "arbitrum": return 42161;
    case "base": return 8453;
    case "optimism": return 10;
    case "polygon": return 137;
    case "bsc": return 56;
    case "ethereum":
    default: return 1;
  }
}

// Helper: BFS to find flow paths
async function findFlowPaths(
  from: string,
  to: string,
  chainId: number,
  apiKey: string | undefined,
  maxHops: number
): Promise<FlowPath[]> {
  const paths: FlowPath[] = [];
  const visited = new Set<string>();
  
  // Queue: [currentAddress, path, depth]
  interface QueueItem {
    address: string;
    path: FlowNode[];
    depth: number;
  }

  const queue: QueueItem[] = [{
    address: from.toLowerCase(),
    path: [],
    depth: 0
  }];

  visited.add(from.toLowerCase());
  const targetLower = to.toLowerCase();

  while (queue.length > 0 && paths.length < 10) { // Limit to 10 paths max
    const { address, path, depth } = queue.shift()!;

    if (depth >= maxHops) continue;

    // Fetch outgoing transactions
    const txs = await fetchTransactions(address, chainId, apiKey);

    for (const tx of txs) {
      const txTo = tx.to?.toLowerCase();
      if (!txTo) continue;

      const amount = parseFloat(tx.value || "0") / 1e18; // Convert to ETH
      if (amount === 0) continue; // Skip zero-value transactions

      const node: FlowNode = {
        address: txTo,
        amount,
        timestamp: parseInt(tx.timeStamp),
        txHash: tx.hash
      };

      const newPath = [...path, node];

      // Found target!
      if (txTo === targetLower) {
        paths.push(buildFlowPath(from, newPath));
        continue;
      }

      // Continue search if not visited and within depth
      if (!visited.has(txTo) && depth + 1 < maxHops) {
        visited.add(txTo);
        queue.push({
          address: txTo,
          path: newPath,
          depth: depth + 1
        });
      }
    }
  }

  return paths;
}

// Helper: Fetch transactions for an address
async function fetchTransactions(
  address: string,
  chainId: number,
  apiKey: string | undefined
): Promise<any[]> {
  let url = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc`;
  
  if (apiKey) {
    url += `&apikey=${apiKey}`;
  }

  const response = await fetch(url);
  const data = await response.json();

  return Array.isArray(data.result) ? data.result : [];
}

// Helper: Build FlowPath from nodes
function buildFlowPath(from: string, nodes: FlowNode[]): FlowPath {
  const wallets = [from, ...nodes.map(n => n.address)];
  const amounts = nodes.map(n => n.amount);
  const timestamps = nodes.map(n => n.timestamp);
  const txHashes = nodes.map(n => n.txHash);

  return {
    hops: nodes.length,
    wallets,
    amounts,
    timestamps,
    txHashes
  };
}
