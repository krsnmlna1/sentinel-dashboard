# 🔫 DeFi Sniper Bot (Simulation Mode)

Real-time trading bot that listens to the Ethereum Mempool via **WebSocket** to detect and "snipe" new token listings on Uniswap V2 instantly.

## ⚡ Features

- **Mempool Monitoring:** Connects to Alchemy WSS to listen for block updates in real-time.
- **Event Filtering:** Filters `PairCreated` events from the Uniswap Factory contract.
- **Auto-Analysis:** Instantly queries Smart Contract to fetch Token Symbol & Liquidity Reserves.
- **Paper Trading:** Simulates buy execution (calculating output amount based on reserves) without spending real funds.

## 🛠 Tech Stack

- Node.js
- Ethers.js (WebSocketProvider)
- Alchemy API

## 📸 Demo Log

```term
 🚨 NEW TOKEN: MLARIA DETECTED! 🚨
Pair Address: 0x90183cA628F47726ddFff35E6C414F5BB9674AeC
⏳ Mengintip Liquidity Pool MLARIA...
   Pool Reserve: 0.80 / 0.63
 💸 SIMULASI BUY EXECUTED!
   Modal:        0.1 ETH
   Target:       MLARIA
   Time:         12:02:12 AM
   Gas Estimate: 150,000 Gwei
   ✅ SUCCESS: Order Sent to Mempool (Virtual)
----------------------------------------
```
