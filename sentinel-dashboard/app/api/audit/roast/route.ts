import { NextResponse } from 'next/server';


// Config
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Helper: Wei to ETH
const toEth = (wei: string) => (parseFloat(wei) / 1e18).toFixed(5);

export async function POST(req: Request) {
    try {
        if (!GROQ_API_KEY) {
            return NextResponse.json({ error: "Configuration Error: GROQ_API_KEY missing" }, { status: 500 });
        }

        const body = await req.json();
        const { address } = body;

        if (!address) {
            return NextResponse.json({ error: "Where is the wallet address?" }, { status: 400 });
        }

        console.log(`🔥 Preparing the roast for: ${address}`);

        // 1. Get Balance & Last 50 Transactions
        const [txRes, balRes] = await Promise.all([
            fetch(`https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc&apikey=${ETHERSCAN_API_KEY}`),
            fetch(`https://api.etherscan.io/v2/api?chainid=1&module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`)
        ]);

        const txData = await txRes.json();
        const balData = await balRes.json();

        if (txData.status !== "1" || !txData.result) {
             console.warn("Etherscan fetch failed or empty.");
             if(txData.message === "No transactions found") {
                return NextResponse.json({
                    title: "The Ghost Town",
                    roast: "This wallet is emptier than my soul. 0 transactions.",
                    score: 10,
                    stats: {
                        balance: "0.0000",
                        txCount: 0,
                        walletAge: 0,
                        incomingTx: 0,
                        outgoingTx: 0,
                        contractInteractions: 0
                    }
                });
             }
        }

        const txList = Array.isArray(txData.result) ? txData.result : [];
        const balanceWei = balData.result || "0";
        const balanceEth = toEth(balanceWei);

        // 2. Process Data
        let totalGasSpent = 0;
        let totalSent = 0;
        let totalReceived = 0;
        let incomingTx = 0;
        let outgoingTx = 0;
        let contractInteractions = 0;
        
        let firstTs = Date.now();
        
        const txSummary = txList.map((tx: any) => {
            const isOut = tx.from.toLowerCase() === address.toLowerCase();
            const valEth = parseFloat(toEth(tx.value));
            const gasEth = parseFloat(toEth((tx.gasUsed * tx.gasPrice).toString()));
            
            totalGasSpent += gasEth;
            if (isOut) { totalSent += valEth; outgoingTx++; }
            else { totalReceived += valEth; incomingTx++; }

            if (tx.input && tx.input !== '0x') contractInteractions++;

            const ts = Number(tx.timeStamp) * 1000;
            if (ts < firstTs) firstTs = ts;

            return `- [${new Date(ts).toLocaleDateString()}] ${isOut ? 'SENT' : 'RECEIVED'} ${valEth} ETH (Gas: ${gasEth} ETH)`;
        }).join('\n');

        const netWorthFlow = totalReceived - totalSent;
        const walletAgeDays = Math.floor((Date.now() - firstTs) / (1000 * 60 * 60 * 24));

        // 3. Prepare Data for Worker
        const walletData = {
            balance: balanceEth,
            txCount: txList.length,
            walletAge: walletAgeDays,
            totalGasSpent: totalGasSpent.toFixed(4),
            netWorthFlow: netWorthFlow.toFixed(4),
            txSummary: txSummary,
            
            // Raw stats for frontend display later
            stats: {
                balance: balanceEth,
                txCount: txList.length,
                walletAge: walletAgeDays,
                incomingTx,
                outgoingTx,
                contractInteractions,
                firstSeen: new Date(firstTs).toLocaleDateString()
            }
        };

        // 4. Send to Cloudflare Worker
        console.log("🔥 Code retrieved! Sending to Sentinel Worker for Roasting...");
        
        const workerUrl = 'https://sentinel-api.krsnmlna1.workers.dev/api/audit';
        
        const workerResponse = await fetch(workerUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contractAddress: address, // Using address as contractAddress for keying
                auditType: 'roast',
                walletData: walletData
            })
        });

        const workerData = await workerResponse.json();

        if (!workerData.success) {
             throw new Error(workerData.error || "Worker failed to accept job");
        }

        const { jobId } = workerData;
        
        return NextResponse.json({
            success: true,
            jobId,
            type: 'wallet',
            address,
            chain: 'ethereum',
            stats: walletData.stats 
        });

    } catch (error: any) {
        console.error("Roast Error:", error);
        return NextResponse.json({ error: "Failed to roast: " + error.message }, { status: 500 });
    }
}

