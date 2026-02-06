const axios = require('axios');

async function debugProtocol(slug) {
    console.log(`\n🔎 Inspecting: ${slug}`);
    try {
        const res = await axios.get(`https://api.llama.fi/protocol/${slug}`);
        const data = res.data;
        
        console.log("Direct Address:", data.address);
        console.log("Chains:", data.chains);
        
        // Log keys that might contain addresses
        if (data.coins) console.log("Coins:", JSON.stringify(data.coins).substring(0, 200) + "...");
        if (data.gecko_id) console.log("Gecko ID:", data.gecko_id);
        
    } catch (e) {
        console.log("Error:", e.message);
    }
}

async function run() {
    await debugProtocol('scroll-bridge');
    await debugProtocol('morpheusai');
}

run();
