const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// 1. Keep-Alive Web Server Setup
const app = express();
app.get('/', (req, res) => res.send('🎒 Doraemon is awake and eating Dorayaki! 🥞'));
app.listen(process.env.PORT || 3000, () => console.log('Web server is ready.'));

// 2. Discord Bot Setup
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('with Nobita 😭', { type: 3 }); // Listening to status
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Command: !dorahelp
    if (message.content === '!dorahelp') {
        message.reply('🤖 **Doraemon Help!**\n• `!gadget` - 4D Pocket Gadget\n• `!dorayaki` - Feed me a snack!\n• Ping me directly to chat!');
    }

    // Command: !dorayaki
    if (message.content === '!dorayaki') {
        message.reply('🥞💙 Mmmm, yummy! Thank you! Here is a virtual hug! 😊');
    }
});

client.login(process.env.DISCORD_TOKEN);
