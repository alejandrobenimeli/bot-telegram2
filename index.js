const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.TOKEN)
let previousMessageId;


// Menú fijo
const staticMenu = [
  [{ text: '🎂 Ver lista de productos' }, { text: 'Buscar producto' }],
  [{ text: 'Añadir producto al carrito' }, { text: 'Ver carrito de compras' }]
];


// Comando para iniciar la conversación
bot.start(async (ctx) => {
  // Mostrar el menú fijo
  ctx.reply('¡Bienvenido! ¿Qué acción quieres realizar?', {
    reply_markup: {
      keyboard: staticMenu,
      resize_keyboard: true,
      selective: true
    }
  });
/*
  const userId = ctx.from.id

  const userProfilePhotos = await ctx.telegram.getUserProfilePhotos(userId)
  const profilePhotos = userProfilePhotos.photos

  if (profilePhotos.length === 0) {
    return ctx.reply('No se encontró ningún número de teléfono asociado con su cuenta de Telegram.')
  }

  const fileId = profilePhotos[0][0].file_id
  const file = await ctx.telegram.getFile(fileId)
  const phoneNumber = file.file_path.split('_')[1]

  ctx.reply(`Tu número de teléfono en Telegram es: ${phoneNumber}`)
  */
});

// Manejador de eventos para el botón "Ver lista de productos"
bot.hears('🎂 Ver lista de productos', (ctx) => {

  // Borramos el mensaje anterior
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

/*
//borra el mensaje al que se responde
bot.on('text', async (ctx) => {
  // Si existe un mensaje anterior en la conversación
  if (ctx.message.reply_to_message) {
    // Borrar el mensaje anterior
    await ctx.deleteMessage(ctx.message.reply_to_message.message_id);
  }
});
*/

const menuOptions = [
  [
    { text: 'Opción 1', callback_data: 'opcion1' },
    { text: 'Opción 2', callback_data: 'opcion2' },
  ],
  [
    { text: 'Opción 3', callback_data: 'opcion3' },
    { text: 'Opción 4', callback_data: 'opcion4' },
  ],
];

bot.command('menu', (ctx) => {
  ctx.reply('Selecciona una opción:', {
    reply_markup: {
      inline_keyboard: menuOptions,
      one_time_keyboard: true, // Esta opción hace que el menú desaparezca después de seleccionar una opción
    },
  });
});

//elimina el ultimo mensaje y escribe el nuevo mensaje
bot.on('text', async (ctx) => {
  // Si existe un mensaje anterior en la conversación
  if (previousMessageId) {
    // Borrar el mensaje anterior
    try {
      await ctx.telegram.deleteMessage(ctx.chat.id, previousMessageId);
    } catch (error) {
      console.log('Error al eliminar el mensaje anterior:', error);
    }
  }
  // Guardar el ID del mensaje actual como el mensaje anterior
  previousMessageId = ctx.message.message_id;
});



// evento que se produce cuando se le pasa algo al chat(foto, audio, sticker, texto)
/*
bot.on('message', async (ctx) => {
  // Enviar un mensaje de bienvenida al usuario
  const welcomeMessage = '¡Hola! Gracias por iniciar esta conversación. Soy un bot creado por OpenAI.';

  try {
    await ctx.reply(welcomeMessage);
    console.log(ctx);
  } catch (error) {
    console.log('Error al enviar el mensaje de bienvenida:', error);
  }
});
*/







bot.on('callback_query', (ctx) => {
  const data = ctx.callbackQuery.data;

  if (data === 'opcion1') {
    ctx.reply('Seleccionaste la opción 1');
  } else if (data === 'opcion2') {
    ctx.reply('Seleccionase la opción 2');
  }
});

/*
//el evento se produce cuando el usario escribe algo, tiene que ir debajo del command.'menu' porque sino el command menu no lo coge y salta al evento on text
  bot.on('text', (ctx) => {
    ctx.reply('¡Hola! Soy un bot de Telegram.');
  });*/

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
