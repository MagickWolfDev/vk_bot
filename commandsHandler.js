require('dotenv').config()
const sqlite3 = require('sqlite3').verbose();

class ComandHandler{

    constructor(bot) {
        this.bot = bot;

        this.db = new sqlite3.Database('./database.db', (err) => {
            if (err) {
              console.log('Could not connect to database', err)
            } else {
              console.log('Connected to database')
            }
          })
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

    async getLink() {
        let link = await this.bot.execute('messages.getInviteLink',
        { 
            peer_id: Number(process.env.CHAT_ID),
            reset: 0
        });

        return link.link
    }

    async updateUsers(users) {
        users.map((user) => {
            try {
                this.db.run(`INSERT INTO users (id, adminLVL) VALUES (${user.id}, 0)`);
            } catch(err) {
                console.log(err);
            }
        })
    }


    async initDB() {
        try{
            this.db.run('CREATE TABLE users (id int NOT NULL PRIMARY KEY UNIQUE, adminLVL int DEFAULT 0);');
        } catch (err) {
            console.log(err);
        }
    }

    async usersList(f) {
        try {  
            this.db.get('SELECT * FROM users', f)
        } catch(err) {
            return err
        }
    }

    async getAdmins(f) {
        try {  
            this.db.get('SELECT * FROM users WHERE adminLVL > 0 AND adminLVL < 2', f)
        } catch(err) {
            return err
        }
    }

    async getSuperAdmins(f) {
        try {  
            this.db.get('SELECT * FROM users WHERE adminLVL = 2', f)
        } catch(err) {
            return err
        }
    }

    async addAdmin(id) {
        try {
            this.db.run(`UPDATE users SET adminLVL = 1 WHERE id = ${id} AND adminLVL < 1`)
        } catch(err) {
            console.log(err);
        }
    }

    async getMuted(f){
        try {
            this.db.get('SELECT * FROM muted', f);
        } catch(f) {

        }
    }

}

module.exports = ComandHandler