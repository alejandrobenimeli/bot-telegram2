const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.TOKEN)

// Define el menú
bot.start((ctx) => {
  ctx.reply('¡Bienvenido! ¿Qué acción quieres realizar?', {
    reply_markup: {
      keyboard: [
        [{ text: 'Ver lista de productos' }, { text: 'Buscar producto' }],
        [{ text: 'Añadir producto al carrito' }, { text: 'Ver carrito de compras' }]
      ],
      resize_keyboard: true
    }
  });
});

bot.command('menu', (ctx) => {
  ctx.reply('¿Qué acción quieres realizar?', {
    reply_markup: {
      keyboard: [
        [{ text: 'Ver lista de productos' }, { text: 'Buscar producto' }],
        [{ text: 'Añadir producto al carrito' }, { text: 'Ver carrito de compras' }]
      ],
      resize_keyboard: true
    }
  });
});

bot.hears('Ver lista de productos', (ctx) => {
  // Acción al presionar el botón "Ver lista de productos"
  ctx.reply("Ver lista de productos");
});

bot.hears('Buscar producto', (ctx) => {
  // Acción al presionar el botón "Buscar producto"
  ctx.reply("Buscar producto");
});

bot.hears('Añadir producto al carrito', (ctx) => {
  // Acción al presionar el botón "Añadir producto al carrito"
  ctx.reply("Añadir producto al carrito");
});

bot.hears('Ver carrito de compras', (ctx) => {
  // Acción al presionar el botón "Ver carrito de compras
  ctx.reply("Ver carrito de compras");
});


// Escucha por el puerto dinámico asignado por Heroku
bot.startWebhook('/', null, process.env.PORT)
bot.launch()
