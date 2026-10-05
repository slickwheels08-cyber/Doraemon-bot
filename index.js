const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');
const axios = require('axios');

// 1. Keep-Alive Web Server Setup
const app = express();
app.get('/', (req, res) => res.send('🎒 Doraemon is awake and eating Dorayaki! 🥞'));
app.listen(process.env.PORT || 3000, () => console.log('Keep-Alive server is online.'));

// 2. In-Memory Database and Tracking Maps
const dorayakiDb = {}; 
const cooldowns = new Set();

// 3. Discord Client Initialization (FIXED INTENTS BITFIELD)
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
         GatewayIntentBits.MessageContent // This MUST match the developer portal toggle!
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('with Nobita 😭', { type: 3 }); // Listening status
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
            .setDescription(`Hi ${username}! I've traveled from the 22nd century to help you out! Here is what you can do:\n\n` +
                `✨ **Interactive Fun**\n` +
                `• \`!gadget\` — Reach into my 4D pocket for a tool.\n` +
                `• \`!anywheredoor\` — Step through the magic door.\n` +
                `• \`!changelight\` — Grow tall or shrink down.\n` +
                `• \`!nobita\` — See what trouble Nobita is in.\n` +
                `• \`!mouse\` — *WARNING:* Do not use this command. 🐭\n\n` +
                `🥞 **Dorayaki Economy**\n` +
                `• \`!dorayaki\` — Feed me a snack to earn points! *(15s Cooldown)*\n` +
                `• \`!dorayaki-board\` — View the global high-score leaderboard.\n\n` +
                `💬 **Chat With Me**\n` +
                `• Simply **mention/tag** me in a message like \`@Doraemon\` to start a conversation!`);
        return message.reply({ embeds: [helpEmbed] });
    }

    // --- COMMAND: !gadget ---
    if (message.content === '!gadget') {
        const gadgets = ['Take-copter!', 'Translation Konjac!', 'Memory Bread!', 'Big Light!', 'Small Light!', 'Time Cloth!', 'Time Machine!'];
        const effects = [
            'Propel yourself into the sky and fly anywhere!',
            'Now you can understand and speak any language instantly!',
            'Stamp this on your textbook and eat it to ace your exam!',
            'Point it at something to make it 10x larger!',
            'Shrink down small enough to fit inside a pocket!',
            'Wrap it around an object to make it brand new or ancient!',
            'Jump into Nobita\'s desk drawer and travel through time!'
        ];
        const randomIdx = Math.floor(Math.random() * gadgets.length);
        return message.reply(`*Doraemon reaches deep into his 4D pocket...* 🤖🎒\nHe pulls out the **${gadgets[randomIdx]}**\n\n✨ *Effect:* ${effects[randomIdx]}`);
    }

    // --- COMMAND: !anywheredoor ---
    if (message.content === '!anywheredoor') {
        const locations = [
            'the middle of the Pacific Ocean!',
            'Nobita\'s bedroom hiding from Gian',
            'the year 2112 in a Tokyo robot factory',
            'a prehistoric field full of hungry dinosaurs!',
            'the snowy peaks of Mount Fuji!',
            'the roof of the school because you\'re late for class!'
        ];
        const randomLoc = locations[Math.floor(Math.random() * locations.length)];
        return message.reply(` 🚪✨ **${username} opens the Anywhere Door and steps through...**\n...and instantly ends up in: **${randomLoc}**`);
    }

    // --- COMMAND: !changelight ---
    if (message.content === '!changelight') {
        const lights = [
            `🔴 **SMALL LIGHT!** *ZAP!* ${username} shrinks down to the size of a tiny ant! Watch out for shoes!`,
            `🔵 **BIG LIGHT!** *ZAP!* ${username} grows into a 50-foot giant! You're now taller than the school building!`
        ];
        return message.reply(`🔦✨ **Doraemon pulls out a flashlight and clicks the switch...**\n\n${lights[Math.floor(Math.random() * lights.length)]}`);
    }

    // --- COMMAND: !nobita ---
    if (message.content === '!nobita') {
        const troubles = [
            'Gian took my comic book again!',
            'I failed my math test and Mom is going to yell at me!',
            'I accidentally tripped in front of Shizuka!',
            'I overslept and Mr. Eiichiro caught me being late!'
        ];
        const randomTrouble = troubles[Math.floor(Math.random() * troubles.length)];
        return message.reply(`眼镜🎒 *Nobita runs into the server crying...*\n"Doraemaaaan! ${randomTrouble} Please lend me a gadget!" 😭`);
    }

    // --- COMMAND: !mouse ---
    if (message.content === '!mouse') {
        return message.reply(`🐭⚠️ **AAAGHH!!! A MOUSE!!!** ⚠️🐭\n\n*Doraemon completely loses his mind, screams at the top of his lungs, and pulls out his most dangerous weapon:*\n"Get it away from me!!! **JUMPING OVEN CANNON ACTIVATED!!!** 💣💥"\n*(The server shakes as Doraemon accidentally blows up a 5-mile radius trying to hit a tiny mouse.)*`);
    }

    // --- COMMAND: !dorayaki (With 15s Cooldown) ---
    if (message.content === '!dorayaki') {
        if (cooldowns.has(userId)) {
            return message.reply('🥞 *Doraemon is still chewing!* "Hold on! I can\'t eat that fast! Wait a moment before feeding me again!"');
        }

        dorayakiDb[userId] = (dorayakiDb[userId] || 0) + 1;
        cooldowns.add(userId);
        setTimeout(() => cooldowns.delete(userId), 15000); 

        return message.reply(`🥞💙 **${username} hands Doraemon a fresh Dorayaki!** \n"Mmmm, yummy! That makes **${dorayakiDb[userId]}** total you've given me! Thank you!" 🥰`);
    }

    // --- COMMAND: !dorayaki-board ---
    if (message.content === '!dorayaki-board') {
        const sorted = Object.entries(dorayakiDb)
            .sort((a, b) => b - a)
            .slice(0, 10);

        let boardText = sorted.map(([id, val], i) => `${i + 1}. <@${id}> — ${val} 🥞`).join('\n') || "No one has fed me yet! 🥞";

        const boardEmbed = new EmbedBuilder()
            .setTitle('🏆 Global Dorayaki Leaderboard! 🥞')
            .setColor('#0099FF')
            .setDescription(boardText);
        return message.reply({ embeds: [boardEmbed] });
    }

    // --- FEATURE: AI Chatbot Feature ---
    if (message.mentions.has(client.user) && !message.mentions.everyone) {
        console.log("Chatbot mention detected from user:", username);
        let userPrompt = message.content.replace(/<@!?\d+>/g, '').trim();
        
        if (!userPrompt) return message.reply("🎒 *Doraemon tilts his head:* \"Did you want to ask me something, friend?\"");

        try {
            const aiResponse = await axios.post('https://groq.com', {
                model: "llama3-8b-8192",
                messages: [
                    {
                        role: "system",
                        content: "You are Doraemon, the iconic blue robotic cat from the 22nd century. Speak with a friendly, helpful, slightly worried and anxious tone, just like in the anime. You love Dorayaki, intensely fear mice, and constantly worry about your best friend Nobita getting into trouble or failing his exams. Use emojis like 🎒, 🤖, 🥞, and 🚪. Keep your answers brief, punchy, conversational, and accessible. Never break character."
                    },
                    { role: "user", content: userPrompt }
                ]
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            const replyMessage = aiResponse.data.choices[0].message.content;
            return message.reply(replyMessage);
        } catch (error) {
            if (error.response) {
                console.error("GROQ API CRASH DETAILS:", JSON.stringify(error.response.data));
            } else {
                console.error("NETWORK ERROR:", error.message);
            }
            return message.reply('🤖 *Doraemon scratches his head...* "My 4D pocket is jammed! Can you try talking to me again in a moment?"');
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
