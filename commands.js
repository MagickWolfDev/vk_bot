
const bodyParser = require('body-parser');
const VkBot = require('node-vk-bot-api/lib');
const Markup = require('node-vk-bot-api/lib/markup');
const excelHelper = require('./excel/functions')
const fileManager = require('./http/getTable')
const crypto = require('crypto')
const fs = require('fs');
const { count } = require('console');
const { match } = require('assert');
const { nextTick } = require('process');

require('dotenv').config()


const bot = new VkBot(process.env.TOKEN);

var appData;

async function loadData () {
    fs.readFile('data.json', (err, data) => {
        if (err) throw err;
        appData = JSON.parse(data);
    });
    
}

appData = loadData()

async function writeData (data) {
    let stringdata = JSON.stringify(data, null, 2);
    fs.writeFile('data.json', stringdata, (err) => {
        if (err) throw err;
    });
}

function inArray(obj, array)
{
    muteIds = appData.muted;

    if (array.indexOf(obj) !== -1)
    {
        return 1;
    }else{
        return 0;
    }
}

Object.prototype.getByKeyIndex = function (i) {
    var key = Object.keys(this)[i];
    return key && this[key];
}

async function sendMessageToGroup(msg, pinned, attachments)
{
    var id = Number(process.env.CHAT_ID);

    var attachmentsArray = [];
    if(attachments)
    {
        attachments.forEach(element => {
            attachmentsArray.push(`${element.type}${element.getByKeyIndex(1).owner_id}_${element.getByKeyIndex(1).id}`);
        });
        if (msg.replace(" ", "") == "")
            msg = ".";
    }


    var m = await bot.sendMessage(id, msg, attachmentsArray);
    if (pinned)
    {
        try
        {
            await bot.execute('messages.pin', {
                message_id: m,
                peer_id: id
            });
        } catch(e)
        {
            console.log(e)
        }
    }
    //2000000003
}

async function sednMessageToAll(msg, pinned)
{

const t = await bot.execute('messages.getConversations', {
    
  }, (callback) => {


  });
    let {items} = t
    for(i in items)
    {
        let {conversation} = items[i]
        let {peer} = conversation
        let {last_message_id} = conversation
        let {id} = peer
        let {type} = peer
        console.log(peer);
        if (type === 'chat')
        {
            //bot.sendMessage(id, msg);
            
            if (pinned)
            {
                try
                {
                    await bot.execute('messages.pin', {
                        message_id: last_message_id,
                        peer_id: id
                    });
                } catch(e)
                {
                    console.log(e)
                }
            }
        }
    }
}

async function remMsg(msgId)
{
    await bot.execute('messages.delete', {
        delete_for_all: 1,
        peer_id: Number(process.env.CHAT_ID),
        conversation_message_ids: msgId,
    });
}

bot.command('/link', async (ctx) => {
    var link = await bot.execute('messages.getInviteLink',
        { 
            peer_id: Number(process.env.CHAT_ID),
            reset: 0
        }
    )
    ctx.reply(link.link);
})

bot.command('Меню', async (ctx) => {
    ctx.reply('Select your sport', null, 
    Markup.keyboard([
    'Админ панель',
    'Информация',
  ])
  .oneTime(),
);
})

bot.command('Админ панель', async (ctx) => {
    ctx.reply('Select your sport', null, 
    Markup.keyboard([
    'Меню',
    'Бан',
    'Мут',
    'Сообщение админам',
    'Сообщение в группу'
  ])
  .oneTime(),
);
})

bot.command('/ban', async (ctx) => {
    if (inArray(ctx.message.from_id, appData.muted))
    {
        remMsg(ctx.message.conversation_message_id)
        return 0;
    }
    if (ctx.message.from_id == process.env.ADMIN_ID || inArray(ctx.message.from_id, appData.admins))
    {
        var reply_id;
        var user_id;
        try{
            reply_id = ctx.message.reply_message.id
        } catch (e) {}
    
        if (reply_id)
        {
            var reply_msg = await bot.execute('messages.getById', {
                delete_for_all: 1,
                peer_id: Number(process.env.CHAT_ID),
                message_ids: reply_id,
            });
            user_id = reply_msg.from_id;
        }else{
           var name = ctx.message.text.replace('/ban').match(/id(\d*)/);
           try {
                var user = await bot.execute('users.get', {
                    user_ids : name[1]
                });
                user_id = user[0].id
           }catch(e) {}
        }

        try
        {
            if(user_id)
            {
                chatId =  (Number(process.env.CHAT_ID) - 2000000000);

                if (user_id != process.env.ADMIN_ID)
                {
                    await bot.execute('messages.removeChatUser', {
                        chat_id: chatId,
                        member_id: user_id
                    });
                    ctx.reply('Пользователь успешно послан нахуй!');
                }else{
                    ctx.reply('Жопу себе забань блять!');
                }
            }else{
                ctx.reply('Пользователь не найден.');
            }
        } catch(e) {
            console.log(e);
            ctx.reply('Не удалось забанить пользователя.');
        }
    }else{
        ctx.reply('Длины вашего члена не достаточно для выполения данной команды!');
    }
});

bot.command('/mute', async (ctx) => {
    if (inArray(ctx.message.from_id, appData.muted))
    {
        remMsg(ctx.message.conversation_message_id)
        return 0;
    }

    if (ctx.message.from_id == process.env.ADMIN_ID || inArray(ctx.message.from_id, appData.admins))
    {
        var reply_id;
        var user_id;
        try{
            reply_id = ctx.message.reply_message.id
        } catch (e) {}
    
        if (reply_id)
        {
            var reply_msg = await bot.execute('messages.getById', {
                delete_for_all: 1,
                peer_id: Number(process.env.CHAT_ID),
                message_ids: reply_id,
            });
            user_id = reply_msg.from_id;
        }else{
           var name = ctx.message.text.replace('/mute').match(/id(\d*)/);
           try {
                var user = await bot.execute('users.get', {
                    user_ids : name[1]
                });
                user_id = user[0].id
           }catch(e) {}
        }

        try
        {
            if(user_id)
            {
                chatId =  (Number(process.env.CHAT_ID) - 2000000000);

                if (user_id != process.env.ADMIN_ID && user_id!= 271183703 && user_id != 462021253)
                {

                    if (!inArray(user[0].id, appData.muted))
                    {
                        appData.muted.push(user_id);
                        writeData(appData);
                        ctx.reply('Пользователь успешно засунул хуй в рот!');
                    }else{
                        ctx.reply('У пользователя и так хуй во рту, зачем ещё второй?');
                    }
                    
                }else{
                    ctx.reply('Себя затыкать будешь!');
                }
            }else{
                ctx.reply('Пользователь не найден.');
            }
        } catch(e) {
            console.log(e);
            ctx.reply('Не удалось замутить пользователя.');
        }
    }else{
        ctx.reply('Длины вашего члена не достаточно для выполения данной команды!');
    }
});

bot.command('/unmute', async (ctx) => {
    if (inArray(ctx.message.from_id, appData.muted))
    {
        remMsg(ctx.message.conversation_message_id)
        return 0;
    }
    if (ctx.message.from_id == process.env.ADMIN_ID || inArray(ctx.message.from_id, appData.admins))
    {
        var reply_id;
        var user_id;
        try{
            reply_id = ctx.message.reply_message.id
        } catch (e) {}
    
        if (reply_id)
        {
            var reply_msg = await bot.execute('messages.getById', {
                delete_for_all: 1,
                peer_id: Number(process.env.CHAT_ID),
                message_ids: reply_id,
            });
            user_id = reply_msg.from_id;
        }else{
           var name = ctx.message.text.replace('/unmute').match(/id(\d*)/);
           try {
                var user = await bot.execute('users.get', {
                    user_ids : name[1]
                });
                user_id = user[0].id
           }catch(e) {}
        }

        try
        {

            if(user_id)
            {
                chatId =  (Number(process.env.CHAT_ID) - 2000000000);
                index = appData.muted.indexOf(user_id)
                if (index !== -1)
                {
                    appData.muted.splice(index, 1);
                    writeData(appData);
                    ctx.reply('Пользователь успешно высунул хуй из рота!');
                }else{
                    ctx.reply('Пользователь не находится в муте.');
                }
  
            }else{
                ctx.reply('Пользователь не найден.');
            }
        } catch(e) {
            console.log(e);
            ctx.reply('Не удалось размутить пользователя.');
        }
    }else{
        ctx.reply('Длины вашего члена не достаточно для выполения данной команды!');
    }
});

bot.command('/adminlist', async (ctx) => {
    if (ctx.message.peer_id == process.env.ADMIN_ID || inArray(ctx.message.peer_id, appData.admins))
    {   
        try {
            var users = await bot.execute('users.get', {
                user_ids : appData.admins
            });
            var str = "";

            users.forEach(user => {
                str += "[id"+user.id+"|"+user.first_name + " " + user.last_name + "]\n";
            })

            ctx.reply(str);
        } catch(e) {}
    }else{
        ctx.reply('Длины вашего члена не достаточно для выполения данной команды!')
    }
});

bot.command('/adminadd', async (ctx) => {
    if (inArray(ctx.message.from_id, appData.muted))
    {
        remMsg(ctx.message.conversation_message_id)
        return 0;
    }
    if (ctx.message.from_id == process.env.ADMIN_ID)
    {
        var name = ctx.message.text.replace('/adminadd').match(/id(\d*)/);
        try
        {
            var user = await bot.execute('users.get', {
                user_ids : name[1]
            });

            if (user != [])
            {
                appData.admins.push(user[0].id);
                writeData(appData);
                ctx.reply('Пользователь успешно назначен администратором!');
            }else{
                ctx.reply('Пользователь не найден.');
            }
        } catch(e) {
            console.log(e);
            ctx.reply('Не удалось дать админку пользователю.');
        }
    }else{
        ctx.reply('Длины вашего члена не достаточно для выполения данной команды!');
    }
});

bot.command('/adminremove', async (ctx) => {
    if (inArray(ctx.message.from_id, appData.muted))
    {
        remMsg(ctx.message.conversation_message_id)
        return 0;
    }
    if (ctx.message.from_id == process.env.ADMIN_ID)
    {
        var name = ctx.message.text.replace('/adminremove').match(/id(\d*)/);
        try
        {
            var user = await bot.execute('users.get', {
                user_ids : name[1]
            });
            
            if (user != [])
            {
                index = appData.admins.indexOf(user[0].id)
                if (index !== -1)
                {
                    appData.admins.splice(index, 1);
                    writeData(appData);
                }
                ctx.reply('Пользователь снят с поста администратором!');
            }else{
                ctx.reply('Пользователь не найден.');
            }
        } catch(e) {
            console.log(e);
            ctx.reply('Не удалось снять админку пользователю.');
        }
    }else{
        ctx.reply('Длины вашего члена не достаточно для выполения данной команды!');
    }
});

bot.command('/tochat', async (ctx) => {
    if (inArray(ctx.message.from_id, appData.muted))
    {
        remMsg(ctx.message.conversation_message_id)
        return 0;
    }
    try {
      if (ctx.message.peer_id == process.env.ADMIN_ID || inArray(ctx.message.peer_id, appData.admins))
      {
            var text = ctx.message.text.replace('/tochat', '');
            if((text !== null && text !== '' && text !== ' ') || (ctx.message.attachments != []))
            {
                sendMessageToGroup(text, 0, ctx.message.attachments);
                await ctx.reply('Сообщение отправлено.');
            }else{
                await ctx.reply('сообщение не может быть пустым.');
            }
        }else{
                ctx.reply('Длины вашего члена не достаточно для выполения данной команды!');
        }
    } catch (e) {
      console.error(e);
    }
});

bot.command('/toadmins', async (ctx) => {
    if (ctx.message.peer_id == process.env.ADMIN_ID || inArray(ctx.message.peer_id, appData.admins))
    {
        var text = ctx.message.text.replace('/toadmins', '');
        if(text !== null && text !== '' && text !== ' ')
        {
            try
            {
                var users = await bot.execute('users.get', {
                    user_ids : ctx.message.from_id
                });

                msg = `Сообщение от администратора [id${ctx.message.from_id}|${users[0].first_name} ${users[0].last_name}]: ${text}`
                var selected_users = appData.admins
                self_index = selected_users.indexOf(users[0].id)
                selected_users.push(process.env.ADMIN_ID)
                selected_users.splice(self_index, 1);

                await bot.sendMessage(selected_users, msg);
                selected_users.push(users[0].id)
                ctx.reply("Сообщение успешно отправлено.")
            } catch(e){
                ctx.reply("Произошла ошибка.")
                console.log(e);
            }
        }
    }
});

bot.command('/clear', async (ctx) => {
    if (inArray(ctx.message.from_id, appData.muted))
        return 0;
    if (ctx.message.peer_id == process.env.CHAT_ID)
    {
        if (ctx.message.from_id == process.env.ADMIN_ID || inArray(ctx.message.from_id, appData.admins))
        {
            var message = ctx.message
            var clear_count = Number(message.text.toString().split(' ')[1]);

            if (clear_count < 1 || !clear_count)
            {
                clear_count = 1
            }
            try
            {                
                var messages = appData.messages;
                var ids_range = [];
                if (ctx.message.fwd_messages == [])
                    ids_range = messages.slice(appData.messages.length - clear_count, appData.messages.length)
                else
                {
                    message.fwd_messages.forEach(msg => {
                        ids_range.push(msg.conversation_message_id)
                    });                
                }

                await bot.execute('messages.delete', {
                    delete_for_all: 1,
                    peer_id: Number(process.env.CHAT_ID),
                    conversation_message_ids: ctx.message.conversation_message_id,
                });

                await bot.execute('messages.delete', {
                    delete_for_all: 1,
                    peer_id: Number(process.env.CHAT_ID),
                    conversation_message_ids: ids_range,
                });
                
                appData.admins.splice(appData.messages.length - clear_count, clear_count);
                writeData(appData);
            } catch(e)
            {
                ctx.reply('Произошла ошибка.')
                console.log(e);
            }
        }else{
            ctx.reply('Длины вашего члена не достаточно для выполения данной команды!');
        }
    }
});


bot.command('тимур', async (ctx) => {
    if (inArray(ctx.message.from_id, appData.muted))
    {
        remMsg(ctx.message.conversation_message_id)
        return 0;
    }
    try {
        await ctx.reply('гей');
    } catch (e) {
      console.error(e);
    }
});

bot.command('/randuser', async (ctx) => {
    if (inArray(ctx.message.from_id, appData.muted))
    {
        remMsg(ctx.message.conversation_message_id)
        return 0;
    }
    var res = await bot.execute('messages.getConversationMembers', {
        peer_id: process.env.CHAT_ID,
        fields: ['first_name', 'last_name']
    });

    var randId = Math.floor(Math.random() * res.count)
    var users = res.profiles;
    var user = users[randId]
    ctx.reply('[id'+user.id+'|'+user.first_name+' '+user.last_name+']')
});



/*bot.command('/test', async (ctx) => {
    try {
        if (ctx.message.peer_id == process.env.ADMIN_ID || inArray(ctx.message.peer_id, appData.admins))
        {
            var text = ctx.message.text.replace('/test', '');
            var attachments = ctx.message.attachments

            console.log(attachments);

            if(text !== null && text !== '' && text !== ' ')
            {
                ctx.reply(text, `${attachments[0].type}${attachments[0].getByKeyIndex(1).owner_id}_${attachments[0].getByKeyIndex(1).id}`)
                //await ctx.reply(message = 'Сообщение отправлено.', attachment = attachments);
            }else{
                await ctx.reply('сообщение не может быть пустым.');
            }
          }else{
                  ctx.reply('Длины вашего члена не достаточно для выполения данной команды!');
          }
      } catch (e) {
        console.error(e);
      }
});*/


async function sendMessageToMe(msg)
{
    bot.sendMessage(process.env.ADMIN_ID, msg)
}

async function checkRasp()
{
    await fileManager.download();

    const path = '../raspParser/temp/rasp1.xlsx'
    
    try {
        if (fs.existsSync(path)) {
            setTimeout(() => {
                var isNew = fileManager.compareHash('../raspParser/temp/rasp1.xlsx', '../raspParser/temp/temp-rasp1.xlsx');
                isNew.then((g) =>
                {
                    console.log(g);
                    if(g)
                    {
                        fileManager.rewrite().then(excelHelper.getData(console.log(1), 1));
                        console.log('New rasp file!');
                    }else{
                       fileManager.removeTemp()
                       console.log('Old rasp file!');
                    }
                });

            }, 5000);
        } else {
            fs.rename("../raspParser/temp/temp-rasp1.xlsx", '../raspParser/temp/rasp1.xlsx', (err) => {
                if (err)
                    console.log(err)
            });
        }
    } catch(e) {
        console.log(e);
    }
}

bot.on(async (ctx) => {
    index = appData.muted.indexOf(ctx.message.from_id);
    appData.messages.push(ctx.message.conversation_message_id);
    writeData(appData);
    try
    {
        if (index !== -1 &&ctx.message.peer_id == process.env.CHAT_ID )
        {
            await bot.execute('messages.delete', {
                delete_for_all: 1,
                peer_id: Number(process.env.CHAT_ID),
                conversation_message_ids: ctx.message.conversation_message_id,
            });
        }//"671001586"
        if (ctx.message.from_id == "671001586" && Math.random()*100 < 33 && ctx.message.peer_id == process.env.CHAT_ID )
        {
            remMsg(ctx.message.conversation_message_id)
        }
    } catch(e) {
        console.log(e);
    }
});

bot.startPolling();
console.log('startup sucsessful!');
//checkRasp();

//let timerId = setInterval(() => checkRasp(), 10*60000);