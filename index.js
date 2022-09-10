const VkBot = require('node-vk-bot-api/lib');
const Comands = require('./commands')

require('dotenv').config()

const bot = new VkBot(process.env.TOKEN);
const comands = new Comands(bot);

comands.comandHandler();

bot.startPolling();

console.log('startup sucsessful!');