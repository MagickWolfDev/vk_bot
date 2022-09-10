const Markup = require('node-vk-bot-api/lib/markup');

require('dotenv').config()


class Comands
{
    constructor(bot)
    {
        this.bot = bot;
    }

    isAdmin(id)
    {
        return id == process.env.ADMIN_ID
    }

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

    infoMenu(ctx)
    {
        return Markup.keyboard([
            [
                Markup.button('Меню', 'positive'),
            ]              
        ])
    }

    adminMenu(ctx)
    {
        return Markup.keyboard([
            [
                Markup.button('Кикнуть', 'primary'),
                Markup.button('Заткнуть', 'primary'),
            ],[
                Markup.button('Сообщение', 'primary'),
                Markup.button('Меню', 'positive'),
            ]          
        ])
    }

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

    comandHandler()
    {   //главное меню
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

        this.bot.command('Комманды', (ctx) => {
            ctx.reply('Доступные команды', null, 
            this.commandMenu(ctx)
        );
        })

    }

}

module.exports = Comands