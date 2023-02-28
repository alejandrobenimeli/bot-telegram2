const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.TOKEN)

// Menú fijo
const staticMenu = [
  [{ text: 'Ver lista de productos' }, { text: 'Buscar producto' }],
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
bot.hears('Ver lista de productos', (ctx) => {
  // Acción a realizar cuando se seleccione el botón
  ctx.reply('Aquí está la lista de productos:');
  // ...
});

// Manejador de eventos para el botón "Buscar producto"
bot.hears('Buscar producto', (ctx) => {
  // Acción a realizar cuando se seleccione el botón
  ctx.reply('¿Qué producto estás buscando?');
  // ...
});

// Manejador de eventos para el botón "Añadir producto al carrito"
bot.hears('Añadir producto al carrito', (ctx) => {
  // Acción a realizar cuando se seleccione el botón
  ctx.reply('¿Qué producto quieres añadir al carrito?');
  // ...
});

// Manejador de eventos para el botón "Ver carrito de compras"
bot.hears('Ver carrito de compras', (ctx) => {
  // Acción a realizar cuando se seleccione el botón
  ctx.reply('Aquí está tu carrito de compras:');
  // ...
});

// Menú dinámico
const dynamicMenu = [
  [{ text: 'Opción 1' }, { text: 'Opción 2' }],
  [{ text: 'Opción 3' }, { text: 'Opción 4' }]
];

// Comando para mostrar el menú dinámico
bot.command('menu', (ctx) => {
  // Mostrar el menú dinámico
  ctx.reply('Aquí está el menú dinámico:', {
    reply_markup: {
      keyboard: dynamicMenu,
      resize_keyboard: true,
      selective: true
    }
  });
});

// Manejador de eventos para el menú dinámico
bot.on('text', (ctx) => {
  // Verificar si el mensaje del usuario coincide con una de las opciones del menú dinámico
  if (dynamicMenu.flat().some((option) => option.text === ctx.message.text)) {
    // Acción a realizar cuando se selecciona una opción del menú dinámico
    ctx.reply(`Has seleccionado: ${ctx.message.text}`);
    // ...
  }
});

// Escucha por el puerto dinámico asignado por Heroku
bot.startWebhook('/', null, process.env.PORT)
bot.launch()
