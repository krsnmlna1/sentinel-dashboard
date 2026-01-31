const axios = require('axios');

async function testEndpoints() {
    console.log("🔍 Testing Sentinel Dashboard APIs...");
    const baseUrl = "http://localhost:3000";

    // 1. Test DAO Treasury
    try {
        console.log("\nTesting GET /api/dao/treasury...");
        const res = await axios.get(`${baseUrl}/api/dao/treasury`, { timeout: 10000 });
        console.log("✅ DAO Status:", res.status);
        console.log("   Address:", res.data.address);
        console.log("   Total Value:", res.data.totalValue);
        console.log("   Tokens Found:", res.data.tokens?.length);
    } catch (error) {
        console.error("❌ DAO API Failed:", error.message);
        if(error.response) console.error("   Data:", error.response.data);
    }

    // 2. Test Roast (Mock)
    try {
        console.log("\nTesting POST /api/audit/roast...");
        const res = await axios.post(`${baseUrl}/api/audit/roast`, {
            address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" // Vitalik
        }, { timeout: 30000 }); // Longer timeout for AI
        
        console.log("✅ Roast Status:", res.status);
        console.log("   Title:", res.data.title);
        console.log("   Score:", res.data.score);
    } catch (error) {
        console.error("❌ Roast API Failed:", error.message);
        if(error.response) console.error("   Data:", error.response.data);
    }
}

testEndpoints();
