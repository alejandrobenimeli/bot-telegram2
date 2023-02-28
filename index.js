const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.TOKEN)

// Menú fijo
const staticMenu = [
  [{ text: '🎂 Ver lista de productos' }, { text: 'Buscar producto' }],
  [{ text: 'Añadir producto al carrito' }, { text: 'Ver carrito de compras' }]
];

// Comando para iniciar la conversación
bot.start((ctx) => {
  // Mostrar el menú fijo
  ctx.reply('¡Bienvenido! ¿Qué acción quieres realizar?', {
    reply_markup: {
      keyboard: staticMenu,
      resize_keyboard: true,
      selective: true
    }
  });
});

// Manejador de eventos para el botón "Ver lista de productos"
bot.hears('🎂 Ver lista de productos', (ctx) => {

  // Borramos el mensaje anterior
  ctx.deleteMessage(ctx.chat.id, ctx.message.message_id - 1);
  // Acción a realizar cuando se seleccione el botón
  ctx.reply('Aquí está la lista de productos:');
  // ...
});

// Manejador de eventos para el botón "Buscar producto"
bot.hears('Buscar producto', (ctx) => {
  ctx.deleteMessage(ctx.chat.id, ctx.message.message_id - 1);
  // Acción a realizar cuando se seleccione el botón
  ctx.reply('¿Qué producto estás buscando?');
  // ...
});

// Manejador de eventos para el botón "Añadir producto al carrito"
bot.hears('Añadir producto al carrito', (ctx) => {
  ctx.deleteMessage(ctx.chat.id, ctx.message.message_id - 1);
  // Acción a realizar cuando se seleccione el botón
  ctx.reply('¿Qué producto quieres añadir al carrito?');
  // ...
});

// Manejador de eventos para el botón "Ver carrito de compras"
bot.hears('Ver carrito de compras', (ctx) => {
  ctx.deleteMessage(ctx.chat.id, ctx.message.message_id - 1);
  // Acción a realizar cuando se seleccione el botón
  ctx.reply('Aquí está tu carrito de compras:');
  // ...
});

bot.command('menu', (ctx) => {
  const menuOptions = [
    [{ text: 'Opción 1', callback_data: 'opcion1' }],
    [{ text: 'Opción 2', callback_data: 'opcion2' }],
    [{ text: 'Comprar producto', callback_data: 'comprar', pay: true }]
  ];

  ctx.reply('Selecciona una opción:', { reply_markup: { inline_keyboard: menuOptions } });
});

bot.on('callback_query', (ctx) => {
  const data = ctx.callbackQuery.data;

  if (data === 'opcion1') {
    ctx.reply('Seleccionaste la opción 1');
  } else if (data === 'opcion2') {
    ctx.reply('Seleccionase la opción 2');
  }
});

bot.on('pre_checkout_query', (ctx) => {
  // Verificar y confirmar el pago
  ctx.answerPreCheckoutQuery(true);
});

bot.on('successful_payment', (ctx) => {
  // Procesar el pago
  ctx.reply('Pago exitoso. Gracias por tu compra!');
});

// Escucha por el puerto dinámico asignado por Heroku
bot.startWebhook('/', null, process.env.PORT)
bot.launch()
