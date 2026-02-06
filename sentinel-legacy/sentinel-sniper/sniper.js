require('dotenv').config();
const { ethers } = require("ethers");
const chalk = require('chalk');

const WSS_URL = process.env.ALCHEMY_WSS;
const UNISWAP_FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

// Required ABI
const FACTORY_ABI = ["event PairCreated(address indexed token0, address indexed token1, address pair, uint)"];
const ERC20_ABI = ["function symbol() view returns (string)", "function decimals() view returns (uint8)"];
const PAIR_ABI = ["function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"];

async function getTokenInfo(tokenAddress, provider) {
    try {
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        return await contract.symbol();
    } catch (e) { return "UNKNOWN"; }
}

async function simulateBuy(pairAddress, targetToken, symbol, provider) {
    const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);

    try {
        console.log(chalk.yellow(`⏳ Peeking at Liquidity Pool for ${symbol}...`));
        
        // Fetch token reserves in the Uniswap pool
        const reserves = await pairContract.getReserves();
        
        // Simple Assumption: New Liquidity Added
        // (In the real world, check which is token0/token1, but for simulation we take raw data)
        const reserve0 = parseFloat(ethers.utils.formatEther(reserves.reserve0));
        const reserve1 = parseFloat(ethers.utils.formatEther(reserves.reserve1));

        console.log(chalk.gray(`   Pool Reserve: ${reserve0.toFixed(2)} / ${reserve1.toFixed(2)}`));

        // SIMULATE BUY
        const modalETH = 0.1; // Pretend to buy with 0.1 ETH
        
        // Simple Price Formula (No complex slippage calc)
        // If ETH reserve is low, token price depends on ratio
        
        console.log(chalk.bgGreen.black(` 💸 SIMULATION BUY EXECUTED! `));
        console.log(`   Capital:      ${modalETH} ETH`);
        console.log(`   Target:       ${symbol}`);
        console.log(`   Time:         ${new Date().toLocaleTimeString()}`);
        console.log(`   Gas Estimate: 150,000 Gwei`);
        console.log(chalk.green(`   ✅ SUCCESS: Order Sent to Mempool (Virtual)`));
        console.log(chalk.cyan(`----------------------------------------\n`));

    } catch (error) {
        console.log(chalk.red("⚠️ Failed to read reserves (Maybe Dev hasn't added Liquidity yet)"));
    }
}

async function startSniper() {
    console.log(chalk.green("\n🔫 SNIPER BOT v3: PAPER TRADING MODE"));
    console.log(chalk.gray("Waiting for new token listings... Prepare your fake wallet!\n"));

    const provider = new ethers.providers.WebSocketProvider(WSS_URL);
    const factoryContract = new ethers.Contract(UNISWAP_FACTORY_ADDRESS, FACTORY_ABI, provider);
    
    // HEARTBEAT: Listen for new blocks to prove connection is alive
    provider.on("block", (blockNumber) => {
        console.log(chalk.gray(`[Heartbeat] New Block Mined: ${blockNumber} (Waiting for pairs...)`));
    });

    factoryContract.on("PairCreated", async (token0, token1, pairAddress) => {
        let targetTokenAddress = "";
        
        if (token0.toLowerCase() === WETH_ADDRESS.toLowerCase()) targetTokenAddress = token1;
        else if (token1.toLowerCase() === WETH_ADDRESS.toLowerCase()) targetTokenAddress = token0;
        else return;

        const symbol = await getTokenInfo(targetTokenAddress, provider);

        console.log(chalk.bgMagenta.bold(` 🚨 NEW TOKEN: ${symbol} DETECTED! 🚨 `));
        console.log(`Pair Address: ${pairAddress}`);
        
        // Call Buy Simulation Function
        await simulateBuy(pairAddress, targetTokenAddress, symbol, provider);
    });

    provider._websocket.on("error", async () => {
        console.log(chalk.red(`Reconnecting...`));
        setTimeout(startSniper, 3000);
    });
}

startSniper();