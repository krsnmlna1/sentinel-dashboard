const axios = require('axios');

async function run() {
    console.log("🕵️ Fetching Top Candidates...");
    try {
        const response = await axios.get('https://api.llama.fi/protocols');
        const allProtocols = response.data;
        const candidates = allProtocols.filter(p => p.tvl > 1000000 && p.change_7d < -10);

        // Simple scoring (replicated from index.js)
        const scored = candidates.map(p => {
             let score = 0;
             if (p.tvl > 10000000) score += 40; else if (p.tvl > 5000000) score += 20;
             if (p.change_7d < -30) score += 30; else if (p.change_7d < -15) score += 15;
             if (p.chain === "Ethereum" || p.chain === "Arbitrum") score += 10;
             return { ...p, score };
        });

        const top = scored.sort((a, b) => b.score - a.score).slice(0, 5);

        console.log("\n--- TOP 5 TARGETS ---");
        for (const p of top) {
            console.log(`\n[${p.score}] ${p.name} (${p.slug})`);
            
            // Fetch Detail
            try {
                const detailRes = await axios.get(`https://api.llama.fi/protocol/${p.slug}`);
                const detail = detailRes.data;
                console.log(`   Address Field: ${detail.address}`);
                if (detail.address && detail.address.includes(':')) {
                     console.log(`   ✅ Parsed: Chain=${detail.address.split(':')[0]} | Addr=${detail.address.split(':')[1]}`);
                } else if (detail.address && detail.address.startsWith('0x')) {
                     console.log(`   ✅ Parsed: Chain=Ethereum (Default) | Addr=${detail.address}`);
                } else {
                     console.log(`   ❌ No Valid EVM Address`);
                }
            } catch (e) {
                console.log(`   ⚠️ Failed to fetch detail: ${e.message}`);
            }
        }

    } catch (e) {
        console.error(e);
    }
}

run();
