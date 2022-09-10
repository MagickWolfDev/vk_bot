const Markup = require('node-vk-bot-api/lib/markup');
const Scene = require('node-vk-bot-api/lib/scene');
const Stage = require('node-vk-bot-api/lib/stage');
const Session = require('node-vk-bot-api/lib/session');

const CommandHandler = require('./commandsHandler')

require('dotenv').config()


class Comands
{
    constructor(bot)
    {
        this.bot = bot;
        this.commandHandler = new CommandHandler(this.bot)
    }

    isAdmin(id)
    {
        return id == process.env.ADMIN_ID
    }

    isSuperAdmin(id)
    {
        return id == process.env.ADMIN_ID
    }

    //Разметка кнопок

    //Главное меню
    mainMenu(ctx)
    {
        return Markup.keyboard([
            [
            Markup.button('Комманды', 'primary'),
            Markup.button('Информация', 'primary'),
            ],this.isAdmin(ctx.message.from_id)?
            [
                Markup.button('Админ панель', 'primary'),
                Markup.button('Закрыть', 'negative'),
            ]:[
                Markup.button('Закрыть', 'negative'),
            ]                 
        ])
    }

    //Информация о боте
    infoMenu(ctx)
    {
        return Markup.keyboard([
            [
                Markup.button('Меню', 'positive'),
            ]              
        ])
    }
    //Админ меню
    adminMenu(ctx)
    {
        if(!this.isSuperAdmin(ctx.message.from_id))
            return Markup.keyboard([
                [
                    Markup.button('Кикнуть', 'primary'),
                    Markup.button('Заткнуть', 'primary'),
                ],
                [
                    Markup.button('Сообщение', 'primary'),
                    Markup.button('Меню', 'positive'),
                ]        
            ])
        else 
            return Markup.keyboard([
                [
                    Markup.button('Кикнуть', 'primary'),
                    Markup.button('Заткнуть', 'primary'),
                ],
                [
                    Markup.button('Сообщение', 'primary'),
                    Markup.button('Меню', 'positive'),
                ],[
                    Markup.button('Назначить админа', 'primary'),
                ]        
            ])

    }
    //Общедоступные комманды
    commandMenu(ctx)
    {
        return Markup.keyboard([
            [
                Markup.button('Челик', 'primary'),
            ],[
                Markup.button('Меню', 'positive'),
            ]
        ])
    }

    //Диалоги действий

    //Кик
    sceneKick = new Scene('kick',
    (ctx) => {
        ctx.scene.next();
        ctx.reply('Укажите пользователя или введите id:', null, 
            Markup.keyboard([
                [
                    Markup.button({
                    action: {
                        type: 'callback',
                        label: 'Отмена',
                        
                    },
                    color: 'negative'
                    }),
                ]
            ]).oneTime()
        );
    },
    (ctx) => {
        ctx.session.kickId = +ctx.message.text;
        ctx.scene.leave();
        try{
            this.commandHandler.kick(ctx, ctx.message.text.match(/id(\d*)/)[1]);
            ctx.reply(`Пользователь успешно кикнут.`, null, this.adminMenu());
        } catch(err){
            ctx.reply(`Произошла непредвиденная ошибка.`, null, this.adminMenu());
        }
    }
    );

    sceneMute = new Scene('mute',
    (ctx) => {
        ctx.scene.next();
        ctx.reply('Укажите пользователя или введите id:', null, 
            Markup.keyboard([
                [
                    Markup.button({
                    action: {
                        type: 'callback',
                        label: 'Отмена',
                        
                    },
                    color: 'negative'
                    }),
                ]
            ]).oneTime()
        );
    },
    (ctx) => {
        ctx.session.muteId = +ctx.message.text;
        ctx.scene.leave();
        ctx.reply(`Пользователь ${ctx.session.muteId} заткнут`, null, this.adminMenu());
    }
    );

    sceneMessage = new Scene('message',
    (ctx) => {
        ctx.scene.next();
        ctx.reply('Введите сообщение для отправки:', null, 
            Markup.keyboard([
                [
                    Markup.button({
                    action: {
                        type: 'callback',
                        label: 'Отмена',
                        
                    },
                    color: 'negative'
                    }),
                ]
            ]).oneTime()
        );
    },
    (ctx) => {
        ctx.session.muteId = +ctx.message.text;
        ctx.scene.leave();

        try {
            this.commandHandler.sendMessageToGroup(ctx.message.text).then(() => {
                ctx.reply('Сообщение успешно отправлено.', null, this.adminMenu());
        })
        }catch{
            ctx.reply('Ошибка отправки сообщения.', null, this.adminMenu());
        }
    }
    );


    //Подключение обработки эвентов

    stage = new Stage(this.sceneKick, this.sceneMute, this.sceneMessage);
    session = new Session();

    //Обработка команд

    comandHandler()
    {   
        this.bot.use(this.session.middleware());
        this.bot.use(this.stage.middleware());

        this.bot.event('message_event', (ctx) => {
            ctx.scene.leave()
            this.bot.execute('messages.sendMessageEventAnswer', {
                event_id: ctx.message.event_id,
                user_id: ctx.message.user_id,
                peer_id: ctx.message.peer_id
            })
            ctx.reply('Отменено.', null, this.adminMenu(ctx));
          });

        //главное меню
        this.bot.command('Меню', async (ctx) => {
            ctx.reply('Главное меню', null, 
                this.mainMenu(ctx).oneTime(),
            );
        });

        //информация о коммандах
        this.bot.command('Информация', async (ctx) => {
            let comandList = " \
            ⚠Бот доступен только в беседе группы 1212⚠\n \
            \n❗Если хотите добавить в беседу, то welcom to my github и переписывайте под свою беседу❗\n\
            \nhttps://github.com/MagickWolfDev/vk_bot/\n\
            \n/челик - Выдаёт случайного участника беседы.\n \
            "

            if(this.isAdmin(ctx.message.from_id))
            {
                comandList += "\
                /Кикнуть (@ или id) - кикнуть челика\n \
                /Заткнуть (@ или id) - удалять все сообщения челика \n \
                /Сообщение - Написать в беседу от имени бота\
                "
            }

            ctx.reply(comandList, null,  
                this.infoMenu(ctx).oneTime(),
            );
        });

        //Админ панель
        this.bot.command('Админ панель', async (ctx) => {
            ctx.reply('Админ команды', null, 
                this.adminMenu(ctx)
            );

        })

        //Доступные комманды
        this.bot.command('Комманды', (ctx) => {
            ctx.reply('Доступные команды', null, 
            this.commandMenu(ctx)
        );
        })

        //Комманда кика
        this.bot.command('Кикнуть', (ctx) => {
            if(this.isAdmin(ctx.message.from_id))
            {
                ctx.scene.enter('kick');
            }else{
                ctx.reply('У вас недостаточно прав.', null, this.mainMenu(ctx));
            }
            
        })

        //Комманда удаление сообщений
        this.bot.command('Заткнуть', (ctx) => {
            if(this.isAdmin(ctx.message.from_id))
            {
                ctx.scene.enter('mute');
            }else{
                ctx.reply('У вас недостаточно прав.', null, this.mainMenu(ctx));
            }
        })

        //Комманда отправки сообщения от имени бота
        this.bot.command('Сообщение', (ctx) => {
            if(this.isAdmin(ctx.message.from_id))
            {
                ctx.scene.enter('message');
            }else{
                ctx.reply('У вас недостаточно прав.', null, this.mainMenu(ctx));
            }
        })

        //Команда получения рандомного участника беседы
        this.bot.command('Челик', (ctx) => {
            this.commandHandler.randUser().then((user) => {
                ctx.reply(user);
            });
        })
    }
}

module.exports = Comands