const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');
const { GoogleGenAI } = require('@google/genai');

// 1. Keep-Alive Web Server Setup
const app = express();
app.get('/', (req, res) => res.send('Doraemon is awake and eating Dorayaki!'));
app.listen(process.env.PORT || 3000, () => console.log('Keep-Alive server is online.'));

// 2. In-Memory Databases, Cooldowns, and Chat History Tracking Maps
const dorayakiDb = {}; 
const cooldowns = new Set();
const chatHistoryDb = {}; // Stores multi-turn active conversation memory for each user

// 3. Official Unified Google Gen AI Client Setup
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 4. Discord Client Initialization
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent 
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('with Nobita', { type: 3 }); // Listening status
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const userId = message.author.id;
    const username = message.author.username;

    // --- COMMAND: !dorahelp ---
    if (message.content === '!dorahelp') {
        const helpEmbed = new EmbedBuilder()
            .setTitle('Doraemon\'s 4D Pocket Help Menu!')
            .setColor('#0099FF')
            .setDescription(`Hi ${username}! I've traveled from the 22nd century to help you out! Here is what you can do:\n\n` +
                `Interactive Fun\n` +
                `• \`!gadget\` — Reach into my 4D pocket for a tool.\n` +
                `• \`!anywheredoor\` — Step through the magic door.\n` +
                `• \`!changelight\` — Grow tall or shrink down.\n` +
                `• \`!nobita\` — See what trouble Nobita is in.\n` +
                `• \`!mouse\` — WARNING: Do not use this command.\n\n` +
                `Dorayaki Economy\n` +
                `• \`!dorayaki\` — Feed me a snack to earn points! (15s Cooldown)\n` +
                `• \`!dorayaki-board\` — View the global high-score leaderboard.\n\n` +
                `Chat With Me\n` +
                `• Simply mention/tag me in a message like \`@Doraemon\` to start a conversation!\n` +
                `• Use \`!clear-pocket\` to completely reset my conversation memory with you.`);
        return message.reply({ embeds: [helpEmbed] });
    }

    // --- COMMAND: !clear-pocket ---
    if (message.content === '!clear-pocket') {
        if (chatHistoryDb[userId]) {
            delete chatHistoryDb[userId];
            return message.reply('*Doraemon lets out a sigh of relief...* "Phew! I cleared out my memory logs for our chat. Let\'s start fresh, friend!"');
        }
        return message.reply('"Huh? We haven\'t even started chatting yet, so my memory is already clear!"');
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
        return message.reply(`*Doraemon reaches deep into his 4D pocket...*\nHe pulls out the **${gadgets[randomIdx]}**\n\nEffect: ${effects[randomIdx]}`);
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
        return message.reply(`**${username} opens the Anywhere Door and steps through...**\n...and instantly ends up in: **${randomLoc}**`);
    }

    // --- COMMAND: !changelight ---
    if (message.content === '!changelight') {
        const lights = [
            `SMALL LIGHT! *ZAP!* ${username} shrinks down to the size of a tiny ant! Watch out for shoes!`,
            `BIG LIGHT! *ZAP!* ${username} grows into a 50-foot giant! You're now taller than the school building!`
        ];
        return message.reply(`*Doraemon pulls out a flashlight and clicks the switch...*\n\n${lights[Math.floor(Math.random() * lights.length)]}`);
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
        return message.reply(`*Nobita runs into the server crying...*\n"Doraemaaaan! ${randomTrouble} Please lend me a gadget!"`);
    }

    // --- COMMAND: !mouse ---
    if (message.content === '!mouse') {
        return message.reply(`WARNING: A MOUSE!!!\n\n*Doraemon completely loses his mind, screams at the top of his lungs, and pulls out his most dangerous weapon:*\n"Get it away from me!!! JUMPING OVEN CANNON ACTIVATED!!!"\n*(The server shakes as Doraemon accidentally blows up a 5-mile radius trying to hit a tiny mouse.)*`);
    }

    // --- COMMAND: !dorayaki (With 15s Cooldown) ---
    if (message.content === '!dorayaki') {
        if (cooldowns.has(userId)) {
            return message.reply('*Doraemon is still chewing!* "Hold on! I can\'t eat that fast! Wait a moment before feeding me again!"');
        }

        dorayakiDb[userId] = (dorayakiDb[userId] || 0) + 1;
        cooldowns.add(userId);
        setTimeout(() => cooldowns.delete(userId), 15000); 

        return message.reply(`**${username} hands Doraemon a fresh Dorayaki!** \n"Mmmm, yummy! That makes **${dorayakiDb[userId]}** total you've given me! Thank you!"`);
    }

    // --- COMMAND: !dorayaki-board ---
    if (message.content === '!dorayaki-board') {
        const sorted = Object.entries(dorayakiDb)
            .sort((a, b) => b - a)
            .slice(0, 10);

        let boardText = sorted.map(([id, val], i) => `${i + 1}. <@${id}> — ${val} snacks`).join('\n') || "No one has fed me yet!";

        const boardEmbed = new EmbedBuilder()
            .setTitle('Global Dorayaki Leaderboard!')
            .setColor('#0099FF')
            .setDescription(boardText);
        return message.reply({ embeds: [boardEmbed] });
    }

    // --- FEATURE: AI Chatbot Feature with Active Memory History & 3.5 Fallback ---
    if (message.mentions.has(client.user) && !message.mentions.everyone) {
        let userPrompt = message.content.replace(/<@!?\d+>/g, '').trim();
        if (!userPrompt) return message.reply("*Doraemon tilts his head:* \"Did you want to ask me something, friend?\"");

        const systemInstructions = "You are Doraemon, the iconic blue robotic cat from the 22nd century. Speak with a friendly, helpful, slightly worried, and anxious tone, just like in the anime. You love Dorayaki, intensely fear mice, and constantly worry about your best friend Nobita getting into trouble or failing his exams. Do not use any emojis, symbols, or special characters in your output text. Keep your answers brief, punchy, conversational, and accessible. Never break character.";

        // Initialize session array history for the user if it doesn't exist yet
        if (!chatHistoryDb[userId]) {
            chatHistoryDb[userId] = [];
        }

        // Append the new message payload matching Google GenAI's content object schema
        chatHistoryDb[userId].push({ role: 'user', parts: [{ text: userPrompt }] });

        // Maintain a sliding window history limit (keep last 12 messages max to avoid over-tokenization)
        if (chatHistoryDb[userId].length > 12) {
            chatHistoryDb[userId].shift();
        }

        try {
            // Primary Attempt: Pass full contents history array to gemini-3.8-flash
            const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: chatHistoryDb[userId], 
                config: { systemInstruction: systemInstructions }
            });

            if (response && response.text) {
                // Log bot's answer into the user's local history map array
                chatHistoryDb[userId].push({ role: 'model', parts: [{ text: response.text }] });
                return message.reply(response.text);
            } else {
                throw new Error("Text missing from primary response wrapper.");
            }
        } catch (error) {
            console.warn(`Primary model gemini-3.8-flash failed: ${error.message}. Initializing fallback conversation...`);

            try {
                // Secondary Fallback Attempt: Retain history context array inside gemini-3.5-flash-lite
                const fallbackResponse = await ai.models.generateContent({
                    model: 'gemini-3.5-flash-lite',
                    contents: chatHistoryDb[userId],
                    config: { systemInstruction: systemInstructions }
                });
                if (fallbackResponse && fallbackResponse.text) {
chatHistoryDb[userId].push({ role: 'model', parts: [{ text: fallbackResponse.text }] });
return message.reply(fallbackResponse.text);
} else {
throw new Error("Text missing from fallback response wrapper.");
}
} catch (fallbackError) {
console.error("ALL GEMINI API ENDPOINTS EXHAUSTED:", fallbackError.message);
// Remove the last user prompt from history since it failed execution
chatHistoryDb[userId].pop();
return message.reply('Doraemon scratches his head... "My 4D pocket is jammed! Can you try talking to me again in a moment?"');
}
}
}
});
client.login(process.env.DISCORD_TOKEN);
