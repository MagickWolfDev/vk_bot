const VkBot = require('node-vk-bot-api/lib');
const Commands = require('./commands')

require('dotenv').config()

const bot = new VkBot(process.env.TOKEN);
const commands = new Commands(bot);

commands.comandHandler();

bot.startPolling();

console.log('startup sucsessful!');