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
    mainMenu(id)
    {
        return Markup.keyboard([
            [
            Markup.button('Команды', 'primary'),
            Markup.button('Информация', 'primary'),
            ],this.isAdmin(id)?
            [
                Markup.button('Админ панель', 'primary'),
                Markup.button('Закрыть', 'negative'),
            ]:[
                Markup.button('Закрыть', 'negative'),
            ]                 
        ])
    }

    //Информация о боте
    infoMenu(id)
    {
        return Markup.keyboard([
            [
                Markup.button('Меню', 'positive'),
            ]              
        ])
    }
    //Админ меню
    adminMenu(id)
    {
        if(!this.isSuperAdmin(id))
            return Markup.keyboard([
                [
                    Markup.button('Кикнуть', 'primary'),
                    Markup.button('Мут', 'primary'),
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
                    Markup.button('Мут', 'primary'),
                ],
                [
                    Markup.button('Сообщение', 'primary'),
                    Markup.button('Ссылка', 'primary'),
                    Markup.button('Меню', 'positive'),
                ],[
                    Markup.button('Назначить админа', 'secondary'),
                    Markup.button('Список админов', 'secondary'),
                ]        
            ])

    }
    //Общедоступные Команды
    commandMenu(ctx)
    {
        return Markup.keyboard([
            [
                Markup.button('Ранд челик', 'primary'),
                Markup.button('Id человека', 'primary'),
            ],[
                Markup.button('Меню', 'positive'),
            ]
        ])
    }

    mutMenu()
    {
        return Markup.keyboard([
            [
                Markup.button('Замутить', 'primary'),
                Markup.button('Челы в муте', 'primary'),
            ],[
                Markup.button({
                    action: {
                        type: 'callback',
                        label: 'Назад',
                        payload: JSON.stringify({
                            text: 'Админ меню.',
                          }),
                    },
                    color: 'secondary'
                    }),
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

    //Мут
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
        )
    },(ctx) => {
        ctx.scene.next();
        ctx.session.muteId = +ctx.message.text;
        ctx.reply('Укажите время, на которое будет выдан мут (мин, час, дни). Пример: 10 мин, 2 час, 1 день.', null, 
            Markup.keyboard([
            [
                Markup.button('1 мин', 'primary'),
                Markup.button('10 мин', 'primary'),
                Markup.button('30 мин', 'primary'),
            ],[
                Markup.button('1 час', 'primary'),
                Markup.button('3 часа', 'primary'),
                Markup.button('1 день', 'primary'),
            ],[
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
    },(ctx) => {
        ctx.session.muteTime = +ctx.message.text;
        ctx.scene.leave();
        ctx.reply(`Пользователь ${ctx.session.muteId} добавлен в мут на ${ctx.message.text}`, null, this.adminMenu());
    }
    );

    //Отправка сообщения от имени бота
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
                ctx.reply('Сообщение успешно отправлено.', null, this.adminMenu(ctx.message.from_id));
        })
        }catch{
            ctx.reply('Ошибка отправки сообщения.', null, this.adminMenu(ctx.message.from_id));
        }
    }
    );

    //Получение id человека
    sceneGetId = new Scene('getId',
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
        let id = ctx.message.text.match(/id(\d*)/)[1];
        ctx.scene.leave();
        ctx.reply(id, null, this.mainMenu(ctx.message.from_id));
    }
    );

    //Добавление новых админов
    sceneAdminAdd = new Scene('adminAdd',
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
         ctx.message.text;

        ctx.scene.leave();

        ctx.reply('Функция отработала, но пока что нихуя не сделала!', null, this.adminMenu(ctx.message.from_id));
    }
    );


    //Подключение обработки эвентов

    stage = new Stage(this.sceneKick, this.sceneMute, this.sceneMessage, this.sceneAdminAdd, this.sceneGetId);
    session = new Session();

    //Обработка команд

    comandHandler()
    {   
        this.bot.use(this.session.middleware());
        this.bot.use(this.stage.middleware());

        this.bot.event('message_event', (ctx) => {
            ctx.scene.leave()

             ctx.reply(ctx.message.payload.text || 'Отменено.', null, this.adminMenu(ctx.message.user_id));

            this.bot.execute('messages.sendMessageEventAnswer', {
                event_id: ctx.message.event_id,
                user_id: ctx.message.user_id,
                peer_id: ctx.message.peer_id
            })
            
          });

        //главное меню
        this.bot.command('Меню', async (ctx) => {
            ctx.reply('Главное меню', null, 
                this.mainMenu(ctx.message.from_id).oneTime(),
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
                this.infoMenu(ctx.message.from_id).oneTime(),
            );
        });

        //Админ панель
        this.bot.command('Админ панель', async (ctx) => {
            ctx.reply('Админ команды', null, 
                this.adminMenu(ctx.message.from_id)
            );

        })

        //Доступные Команды
        this.bot.command('Команды', (ctx) => {
            ctx.reply('Доступные команды', null, 
            this.commandMenu(ctx.message.from_id)
        );
        })

        //Комманда кика
        this.bot.command('Кикнуть', (ctx) => {
            if(this.isAdmin(ctx.message.from_id))
            {
                ctx.scene.enter('kick');
            }else{
                ctx.reply('У вас недостаточно прав.', null, this.mainMenu(ctx.message.from_id));
            }
            
        })

        //Комманда удаления сообщений
        this.bot.command('Замутить', (ctx) => {
            if(this.isAdmin(ctx.message.from_id))
            {
                ctx.scene.enter('mute');
            }else{
                ctx.reply('У вас недостаточно прав.', null, this.mainMenu(ctx.message.from_id));
            }
        })

        this.bot.command('Мут', (ctx) => {
            if(this.isAdmin(ctx.message.from_id))
            {
                ctx.reply('Мут меню', null, this.mutMenu())
            }else{
                ctx.reply('У вас недостаточно прав.', null, this.mainMenu(ctx.message.from_id));
            }
        })

        //Комманда отправки сообщения от имени бота
        this.bot.command('Сообщение', (ctx) => {
            if(this.isAdmin(ctx.message.from_id))
            {
                ctx.scene.enter('message');
            }else{
                ctx.reply('У вас недостаточно прав.', null, this.mainMenu(ctx.message.from_id));
            }
        })

        this.bot.command('Ссылка', (ctx) => {
            if(this.isAdmin(ctx.message.from_id))
            {
                this.commandHandler.getLink().then((link) => {
                    ctx.reply(link,  null, this.adminMenu(ctx.message.from_id))
                })
            }else{
                ctx.reply('У вас недостаточно прав.', null, this.mainMenu(ctx.message.from_id));
            }
        })

        //Назначение администраторов
        this.bot.command('Назначить админа', (ctx) => {
            if(this.isSuperAdmin(ctx.message.from_id))
            {
                ctx.scene.enter('adminAdd');
            }else{
                ctx.reply('У вас недостаточно прав.', null, this.mainMenu(ctx.message.from_id));
            }
        })

        //Команда получения рандомного участника беседы
        this.bot.command('Ранд челик', (ctx) => {
            
            this.commandHandler.randUser().then((user) => {
                ctx.reply(user);
            });
        })

        this.bot.command('/update', (ctx) => {
            this.bot.execute('messages.getConversationMembers', {
                peer_id: process.env.CHAT_ID,
                fields: ['first_name', 'last_name']
            }).then((res) => {
                let users = res.profiles;
                this.commandHandler.updateUsers(users)
            });     
        })

        //Команда получение id человека
        this.bot.command('Id человека', (ctx) => {
            ctx.scene.enter('getId');
        })

        //Команда получения списка админов
        this.bot.command('Список админов', (ctx) => {
            this.commandHandler.getAdmins((err, row) => {
                if (!err)
                {
                    if (row)
                        ctx.reply(row.id);
                    else
                        ctx.reply('Ничего не найдено.');
                }else{
                        ctx.reply('Произошла ошибка.');
                }
            });
        })

    }
}

module.exports = Comands