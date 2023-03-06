const { Telegraf, Markup } = require('telegraf');

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
/*
bot.command('menu', (ctx) => {
  ctx.reply('Selecciona una opción:', {
    reply_markup: {
      inline_keyboard: menuOptions.map(row => row.map(option => ({
        ...option,
        one_time_keyboard: true,
      }))),
    },
  });
});
*/

// Variable para guardar el mensaje del menú
let menuAguardar = null;

bot.command('menu', (ctx) => {
  //ctx.reply('Selecciona una opción:', Markup.inlineKeyboard(menuOptions).oneTime());
  /*
  ctx.reply('Selecciona una opción gay:', {
    reply_markup: {
      inline_keyboard: menuOptions,
      one_time_keyboard: true
    }
  });
  */
  if (menuAguardar) {
   // Si ya se mostró el menú antes, se muestra el mensaje guardado
   ctx.telegram.editMessageText(
     menuAguardar.chat_id,
     menuAguardar.message_id,
     null,
     'Selecciona una opción:',
     Markup.inlineKeyboard(menuOptions)
   );
 } else {
   // Si es la primera vez que se muestra el menú, se envía un mensaje nuevo
   ctx.reply('Selecciona una opción:', Markup.inlineKeyboard(menuOptions));
 }
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




const menuOptionsComida = [
  [
    { text: 'Espaguetis', callback_data: 'espaguetis' },
    { text: 'Macarrones', callback_data: 'macarrones' },
  ],
  [
    { text: 'Ajo', callback_data: 'ajo' },
    { text: 'Sopa', callback_data: 'sopa' },
  ], [
    { text: 'Back', callback_data: 'back' }
  ]
];

let mensajeDeRespuesta = null;

async function borrarRespuestaOpcion(ctx) {
  if(mensajeDeRespuesta) {
    try {
      console.log(ctx.message);
      //await ctx.telegram.deleteMessage(mensajeDeRespuesta.chat_id, mensajeDeRespuesta.message_id);
      await ctx.telegram.editMessageText(mensajeDeRespuesta.chat_id, mensajeDeRespuesta.message_id, null, "Nuevo texto del mensaje");
    } catch (error) {
      console.log('Error al eliminar el mensaje anterior:', error);
    }
  }
}

bot.on('callback_query', async(ctx) => {
  const data = ctx.callbackQuery.data;

  if (data === 'opcion1') {
    //ctx.telegram.deleteMessage(menuAborrar.chat.id, menuAborrar.message.message_id);
    const message = ctx.callbackQuery.message;
    menuAguardar = { chat_id: message.chat.id, message_id: message.message_id };
    ctx.editMessageText('Selecciona una opción de comida:', {
      reply_markup: {
        inline_keyboard: menuOptionsComida
      },
    });
  } else if (data === 'opcion2') {
    borrarRespuestaOpcion(ctx);
      ctx.reply('Seleccionaste la opción 2').then((ctxResponse) => {
        mensajeDeRespuesta = {chat_id: ctxResponse.chat.id, message_id: ctxResponse.message_id};
        console.log(ctxResponse);
      });

  } else if (data === 'opcion3') {
    borrarRespuestaOpcion(ctx);
      ctx.reply('Seleccionaste la opción 3').then((ctxResponse) => {
      mensajeDeRespuesta = {chat_id: ctxResponse.chat.id, message_id: ctxResponse.message_id}
    });

  } else if (data === 'opcion4') {
    borrarRespuestaOpcion(ctx);
      ctx.reply('Seleccionaste la opción 4').then((ctxResponse) => {
      mensajeDeRespuesta = {chat_id: ctxResponse.chat.id, message_id: ctxResponse.message_id}
    });
  } else if (data === 'espaguetis') {
    ctx.reply('Seleccionase espaguetis');
  } else if (data === 'macarrones') {
    ctx.reply('Seleccionase macarrones');
  } else if (data === 'ajo') {
    ctx.reply('Seleccionase ajo');
  } else if (data === 'sopa') {
    ctx.reply('Seleccionase sopa');
  } else if (data === 'back') {
    //await ctx.telegram.sendMessage(ctx.chat.id, '/menu'); // Envía el comando /menu al bot
    //ctx.reply('/menu');
    if (menuAguardar) {
     // Si ya se mostró el menú antes, se muestra el mensaje guardado
     ctx.telegram.editMessageText(
       menuAguardar.chat_id,
       menuAguardar.message_id,
       null,
       'Selecciona una opción:',
       Markup.inlineKeyboard(menuOptions)
     );
   }
  }
});

/*
//el evento se produce cuando el usario escribe algo, tiene que ir debajo del command.'menu' porque sino el command menu no lo coge y salta al evento on text
  bot.on('text', (ctx) => {
    ctx.reply('¡Hola! Soy un bot de Telegram.');
  });*/

  // Manejador del comando /menu
/*
bot.command('hola', (ctx) => {
  // Enviar un mensaje al chat del usuario con un menú inline_keyboard
  ctx.reply('Selecciona una opción:', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Opcion 1', callback_data: 'opcion_1' },
          { text: 'Opción 2', callback_data: 'opcion_2' },
        ],
      ],
    },
  }).then((menuMessage) => {
    // Guardar el ID del mensaje con el menú para actualizarlo más tarde
    const menuMessageId = menuMessage.message_id;

    // Manejador de la opción 1 del menú
    bot.action('opcion_1', (ctx) => {
      // Actualizar el mensaje original con la respuesta
      ctx.editMessageText('La opción 1 ha sido seleccionada.');
    });

    // Manejador de la opción 2 del menú
    bot.action('opcion_2', (ctx) => {
      // Actualizar el mensaje original con la respuesta
      ctx.editMessageText('La opción 2 ha sido seleccionada.');
    });
  });
}); */


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
