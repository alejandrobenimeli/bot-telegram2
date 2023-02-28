const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

const bot = new Telegraf(process.env.TOKEN)

// Define el menú
const menu = Extra.markup(Markup.inlineKeyboard([
  Markup.callbackButton('Opción 1', 'opcion1'),
  Markup.callbackButton('Opción 2', 'opcion2'),
  Markup.callbackButton('Opción 3', 'opcion3')
]))

// Manejador para el comando /menu
bot.command('menu', (ctx) => {
  // Envía el menú al usuario
  ctx.reply('Selecciona una opción:', menu)
})

// Manejadores para cada opción del menú
bot.action('opcion1', (ctx) => {
  ctx.reply('Seleccionaste la opción 1')
})

bot.action('opcion2', (ctx) => {
  ctx.reply('Seleccionaste la opción 2')
})

bot.action('opcion3', (ctx) => {
  ctx.reply('Seleccionaste la opción 3')
})

// Escucha por el puerto dinámico asignado por Heroku
bot.startWebhook('/', null, process.env.PORT)
bot.launch()
