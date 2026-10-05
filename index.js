const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');
const axios = require('axios');

// 1. Keep-Alive Web Server
const app = express();
app.get('/', (req, res) => res.send('🎒 Doraemon is awake and eating Dorayaki! 🥞'));
app.listen(process.env.PORT || 3000, () => console.log('Web server running.'));

// 2. Local Database for Dorayaki Tracker
const dorayakiDb = {}; 
const cooldowns = new Set();

// 3. Discord Bot Client Setup
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('with Nobita 😭', { type: 3 });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const userId = message.author.id;
    const username = message.author.username;

    // --- COMMAND: !dorahelp ---
    if (message.content === '!dorahelp') {
        const helpEmbed = new EmbedBuilder()
            .setTitle('🤖 Doraemon\'s 4D Pocket Help Menu! 🎒')
            .setColor('#0099FF')
            .setDescription(`Hi ${username}! Here is everything I can do: \n\n• \`!dorayaki\` — Feed me a snack!\n• \`!dorayaki-board\` — View the high scores.\n• **Mention me** (\`@Doraemon\`) to talk to me!`);
        return message.reply({ embeds: [helpEmbed] });
    }

    // --- COMMAND: !dorayaki (With Cooldown) ---
    if (message.content === '!dorayaki') {
        if (cooldowns.has(userId)) {
            return message.reply('🥞 *Doraemon is still chewing!* "Hold on! I can\'t eat that fast! Wait a moment before feeding me again!"');
        }

        dorayakiDb[userId] = (dorayakiDb[userId] || 0) + 1;
        cooldowns.add(userId);
        setTimeout(() => cooldowns.delete(userId), 15000); // 15-second cooldown

        return message.reply(`🥞💙 **${username} hands Doraemon a fresh Dorayaki!** \n"Mmmm, yummy! That makes **${dorayakiDb[userId]}** total you've given me! Thank you!" 🥰`);
    }

    // --- COMMAND: !dorayaki-board ---
    if (message.content === '!dorayaki-board') {
        const sorted = Object.entries(dorayakiDb)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        let boardText = sorted.map(([id, val], i) => `${i + 1}. <@${id}> — ${val} 🥞`).join('\n') || "No one has fed me yet! 🥞";

        const boardEmbed = new EmbedBuilder()
            .setTitle('🏆 Global Dorayaki Leaderboard! 🥞')
            .setColor('#0099FF')
            .setDescription(boardText);
        return message.reply({ embeds: [boardEmbed] });
    }

    // --- FEATURE: AI Conversational Chat via Mention ---
    if (message.mentions.has(client.user) && !message.mentions.everyone) {
        // Clean up the mention text out of the prompt sentence
        const userPrompt = message.content.replace(`<@${client.user.id}>`, '').trim();
        if (!userPrompt) return message.reply("🎒 *Doraemon tilts his head:* \"Did you want to ask me something, friend?\"");

        try {
            const aiResponse = await axios.post('https://groq.com', {
                model: "llama3-8b-8192",
                messages: [
                    {
                        role: "system",
                        content: "You are Doraemon, the iconic blue robotic cat from the 22nd century. Speak with a friendly, helpful, slightly worried tone, just like in the anime. You love Dorayaki, intensely fear mice, and constantly worry about your best friend Nobita failing his exams. Use emojis like 🎒, 🤖, 🥞, and 🚪. Keep your answers brief, conversational, and accessible. Never break character."
                    },
                    { role: "user", content: userPrompt }
                ]
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            return message.reply(aiResponse.data.choices[0].message.content);
        } catch (error) {
            console.error(error);
            return message.reply('🤖 *Doraemon scratches his head...* "My 4D pocket is jammed! Can you try talking to me again?"');
        }
    }
});

client.login(process.env.DISCORD_TOKEN);

