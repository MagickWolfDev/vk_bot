require('dotenv').config()
class ComandHandler{

    constructor(bot) {
        this.bot = bot;
    }

    kick(ctx, id)
    {
        console.log(id);
    }

    async randUser() {
        let res = await this.bot.execute('messages.getConversationMembers', {
            peer_id: process.env.CHAT_ID,
            fields: ['first_name', 'last_name']
        });

        let randId = Math.floor(Math.random() * res.count)
        let users = res.profiles;
        let user = users[randId]

        return '[id'+user.id+'|'+user.first_name+' '+user.last_name+']'
    }

    async sendMessageToGroup(message) {
        let id =  Number(process.env.CHAT_ID);
        let attachmentsArray = [];

        let resault = await this.bot.sendMessage(id, message, attachmentsArray);

        return resault
    }
}

module.exports = ComandHandler