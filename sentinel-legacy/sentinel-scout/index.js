const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const axios = require('axios');
const cron = require('node-cron');

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const AUDITOR_API = "http://localhost:7860/audit-contract";
const PROFILER_API = "http://localhost:3002/roast";

// GLOBAL STATE
let REPORT_CHANNEL_ID = null;

// Initialize Bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

console.log("🔥 Sentinel Scout (Bot Mode) is Starting...");

client.once('ready', () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
    console.log("👉 Type '!sentinel init' in your Discord channel to start monitoring.");
});

// COMMAND LISTENER
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!sentinel init') {
        REPORT_CHANNEL_ID = message.channel.id;
        message.reply(`✅ **Sentinel Scout Initialized!**\nReports will be sent to this channel (<#${REPORT_CHANNEL_ID}>).\nScanning starting now...`);
        
        // Start the first scan immediately
        runScout();
    }

    if (message.content.startsWith('!sentinel autopilot')) {
        message.reply("🤖 Autopilot is permanently **ON** in this version. I will naturally hunt for high-score targets.");
    }
});

// INTERACTION LISTENER (BUTTONS)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const [action, protocolSlug] = interaction.customId.split(':');

    if (action === 'audit') {
        const loadingMsg = await interaction.reply({ content: `🕵️ Initiating Quick Audit for **${protocolSlug}**...`, ephemeral: true, fetchReply: true });
        
        try {
            // Need to fetch address first (Same logic as main loop)
            const detailRes = await axios.get(`https://api.llama.fi/protocol/${protocolSlug}`);
            const detail = detailRes.data;

            // Logic: Extract Address from DeFiLlama format (can be "chain:0x123...")
            let rawAddress = detail.address;
            let chain = "Ethereum"; // Default
            
            // If address format is "chain:0x...", we split it
            if (rawAddress && rawAddress.includes(':')) {
                const parts = rawAddress.split(':');
                chain = parts[0]; // e.g., "arbitrum"
                rawAddress = parts[1]; // e.g., "0x123..."
            }

            if (!rawAddress || !rawAddress.startsWith('0x')) {
                await interaction.editReply({ content: "❌ **Audit Failed:** No valid Ethereum/EVM contract address found for this protocol." });
                return;
            }

            console.log(`Command Audit: Checking ${protocolSlug} on ${chain} at ${rawAddress}`);

            // Send chain info to Auditor
            const auditRes = await axios.post(AUDITOR_API, { 
                contractAddress: rawAddress,
                chain: chain
            });
            
            if (auditRes.data.success) {
                // Send report to channel (Publicly)
                const reportEmbed = new EmbedBuilder()
                    .setTitle(`💀 Audit Report: ${protocolSlug}`)
                    .setDescription(auditRes.data.report.substring(0, 4000)) // Discord limit check
                    .setColor(0x000000)
                    .setFooter({ text: `Target: ${rawAddress} (${chain}) • Sentinel Auditor` });
                
                await interaction.channel.send({ embeds: [reportEmbed] });
                await interaction.editReply({ content: "✅ Audit Report Published!" });
            } else {
                await interaction.editReply({ content: "❌ Auditor failed to generate report." });
            }

        } catch (e) {
            console.error(e);
            let errMsg = e.message;
            if (e.response && e.response.data && e.response.data.error) {
                errMsg = e.response.data.error; // Show actual Auditor error
            }
            await interaction.editReply({ content: `❌ **Error:** ${errMsg}` });
        }
    }
});

// --- SCOUT LOGIC ---

function calculateScore(protocol) {
    let score = 0;
    const tvl = protocol.tvl || 0;
    const drop = protocol.change_7d || 0;

    if (tvl > 10000000) score += 40;
    else if (tvl > 5000000) score += 20;

    if (drop < -30) score += 30;
    else if (drop < -15) score += 15;

    if (protocol.chain === "Ethereum" || protocol.chain === "Arbitrum") score += 10;

    return Math.min(score, 100);
}

function categorize(protocol, score) {
    if (score >= 70) return "🚨 HIGH PRIORITY";
    if (protocol.change_7d < -50) return "💀 REKT/PANIC";
    return "👀 WATCHLIST";
}

async function triggerSentinels(protocol) {
    // Re-using logic from before, but simplified for the bot loop
    if (protocol.address) { 
        try {
            await axios.post(AUDITOR_API, { 
                contractAddress: protocol.address,
                chain: protocol.chain 
            });
            return "✅ Audit Complete";
        } catch (e) { return "⚠️ Auditor Offline"; }
    }
    return "⚠️ No Address";
}

// Helper to get address
async function retrieveAddress(slug) {
    try {
        const detailRes = await axios.get(`https://api.llama.fi/protocol/${slug}`);
        const detail = detailRes.data;
        let rawAddress = detail.address;
        let chain = "Ethereum";

        if (rawAddress && rawAddress.includes(':')) {
            const parts = rawAddress.split(':');
            chain = parts[0];
            rawAddress = parts[1];
        }

        if (rawAddress && rawAddress.startsWith('0x')) {
            return { address: rawAddress, chain };
        }
        return null;
    } catch (e) { return null; }
}

async function runScout() {
  if (!REPORT_CHANNEL_ID) {
      console.log("⏳ Waiting for !sentinel init...");
      return;
  }

  console.log(`[${new Date().toISOString()}] 🕵️ Scout scanning...`);

  try {
    const response = await axios.get('https://api.llama.fi/protocols');
    const allProtocols = response.data;
    const candidates = allProtocols.filter(p => p.tvl > 1000000 && p.change_7d < -10);

    const scoredCandidates = candidates.map(p => {
        const score = calculateScore(p);
        return { ...p, score, category: categorize(p, score) };
    });

    // Get Top 10 initially, so we can filter for valid ones
    const topCandidates = scoredCandidates.sort((a, b) => b.score - a.score).slice(0, 10);
    
    // Enrich with Address Check (Parallel for speed)
    const enrichedTargets = await Promise.all(topCandidates.map(async (p) => {
        const resolved = await retrieveAddress(p.slug);
        return { ...p, resolved }; // resolved is {address, chain} or null
    }));

    // Prioritize showing targets with Addresses for the buttons
    // But still show high score items in the text list even if no address
    const displayTargets = enrichedTargets.slice(0, 5);

    if (displayTargets.length > 0) {
      await sendToDiscord(displayTargets);
    } 

  } catch (error) {
    console.error("❌ Scout Error:", error.message);
  }
}

async function sendToDiscord(protocols) {
    const channel = client.channels.cache.get(REPORT_CHANNEL_ID);
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setTitle("🧠 INTELLIGENCE REPORT: Auto-Triage")
        .setDescription("Top scoring opportunities. 'Audit' buttons available for verified EVM contracts.")
        .setColor(0x00FF00)
        .setTimestamp();

    const row = new ActionRowBuilder();
    let buttonCount = 0;

    protocols.forEach((p, index) => {
        const hasAddress = !!p.resolved;
        const addressIcon = hasAddress ? "✅" : "⚠️";
        
        embed.addFields({
            name: `${index + 1}. [${p.score}/100] ${p.name} (${p.category})`,
            value: `📉 **Drop:** ${p.change_7d.toFixed(2)}% | 💰 **TVL:** $${(p.tvl / 1000000).toFixed(2)}M\n🔗 [Link](${p.url}) | Contract: ${addressIcon}`,
            inline: false
        });

        // Add a button ONLY if valid address and max 5 buttons (Discord limit)
        if (hasAddress && buttonCount < 5) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`audit:${p.slug}`)
                    .setLabel(`Audit ${p.name}`)
                    .setStyle(ButtonStyle.Danger) 
            );
            buttonCount++;
        }
    });

    const components = buttonCount > 0 ? [row] : [];

    await channel.send({ 
        embeds: [embed], 
        components: components 
    });
    console.log(`📨 Report Sent with ${buttonCount} Buttons.`);
}

client.login(TOKEN);