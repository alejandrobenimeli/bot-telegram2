const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');


const bot = new Telegraf(process.env.TOKEN);

const tokenEnPoint = process.env.TOKEN_EN_POINT; //'abl248924';
let previousMessageId;


// Menú fijo
const staticMenu = [
  [{ text: '🎂 Ver lista de productos' }, { text: 'Buscar producto' }],
  [{ text: 'Añadir producto al carrito' }, { text: 'Afiliado' }]
];


const idUserRegex = /^\d{10}$/;

function validarFormatoIdUser(idUser) {
  return idUserRegex.test(idUser);
}

function peticionGet(endPoint) {
  // Realizar la petición GET
  return axios.get(endPoint)
    .then((response) => {
      const json = response.data;
      return Promise.resolve(json);
    })
    .catch((err) => {
      return Promise.reject(err);
    });
}

// Comando para iniciar la conversación
bot.start((ctx) => {
  // Mostrar el menú fijo
  //Tiene un usuario referido
  const userRef = ctx.message.text.split(' ')[1];
  const userId = {userid: ctx.message.from.id, name: ctx.message.from.first_name};

  if(userRef) {
    if(validarFormatoIdUser(userRef)) {
      try {
        //aqui comprobar que el userRef exista como userRef (tabla referidos)
        const endPoint_comprobarUserRef = 'https://seofy.es/api/exists-user-ref/'+tokenEnPoint+'/'+userRef;
        console.log('url: '+ endPoint_comprobarUserRef);
        peticionGet(endPoint_comprobarUserRef)
        .then((response) => {
          if(response.existe) {
            console.log('existe la id del referido');
            //si existe userRef, guardar en tabla usuarios el userId.
            // y guardar en tabla asociacion_referidos_usuario la asociacion del userRef y userId
            axios.post('https://seofy.es/api/guardar-userid', {
              token: tokenEnPoint,
              idUser: userId.userid,
              nameUser: userId.name,
              idRef: userRef
            }, {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            })
            .then(response => {
              console.log(response.data);
              //aqui notificar al userRef de que tiene un nuevo usuario referido si error = 0
              jsonResponse = response.data;
              if(jsonResponse.error === 0) {
                console.log('todo correcto');
                bot.telegram.sendMessage(userRef, 'Enhorabuena! Tiene un nuevo referido, name: ${nameUser} e id: ${idUser}');
              } else {
                console.log('salio mal');
              }

            })
            .catch(error => {
              console.log(error);
            });
          } else {
            console.log('NO existe la id del referido');
          }
        })
        .catch((error) => {
          console.error('error'+error);
        });

        /*
         console.log('el usuario referido es: '+userRef);
         console.log('el user id: ');
         console.log(userId);
         console.log('tiene un usuario referido');
         */
      } catch (error) {
         console.log(error);
         console.log('No se pudo encontrar el usuario');
      }
    } else {
      console.log('no tiene el id de user correcto');
    }
  } else {
    console.log('no hay ningun usuario referido');
    console.log('el user id: '+userId.userid+' , el name: '+userId.name);
    //comprobar si existe en la base de datos como userRef o userId. si existe no hacer nada. si no existse
    //guardar el userid vacio sin referidos en la bd como userRef (tabla referidos)
  }

  //console.log('el id de usuario de telegram es: '+ctx.from.id);
  bot.telegram.sendMessage(5997313040, 'tu madre es calva y lleva perila');
  //bot.telegram.sendMessage(1869069790, 'tu madre es calva y lleva perilla');
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
bot.hears('Afiliado', (ctx) => {
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
  /*
  if (menuAguardar) {
   // Si ya se mostró el menú antes, se muestra el mensaje guardado
   ctx.telegram.editMessageText(
     menuAguardar.chat_id,
     menuAguardar.message_id,
     null,
     'Selecciona una opción:',
     Markup.inlineKeyboard(menuOptions)
   );
 } else { */
   // Si es la primera vez que se muestra el menú, se envía un mensaje nuevo
   ctx.reply('Selecciona una opción:', Markup.inlineKeyboard(menuOptions));
 //}
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

let mensajeAnterior = null;

//modifica el mensaje si previamente se ha escrito uno, sino se hara el reply
async function ctxReply(ctx, nuevoTexto) {
  const ctxActual = ctx.callbackQuery.message.message_id;
  //ver si es un contexto nuevo o el mismo que el que se estaba pasando
  console.log(ctx.callbackQuery.message.message_id);
  console.log('el mensaje anterior es: '+mensajeAnterior);
  if(mensajeAnterior) {
      try {
        if(nuevoTexto !==  mensajeAnterior.text) {
          //await ctx.telegram.deleteMessage(mensajeAnterior.chat_id, mensajeAnterior.message_id);
          await ctx.telegram.editMessageText(mensajeAnterior.chat_id, mensajeAnterior.message_id, null, nuevoTexto);
          mensajeAnterior.text = nuevoTexto;
        }
      } catch (error) {
        console.log('Error al eliminar el mensaje anerior:', error);
      }

  } else {
    ctx.reply(nuevoTexto).then((ctxResponse) => {
      mensajeAnterior = {chat_id: ctxResponse.chat.id, message_id: ctxResponse.message_id, text: ctxResponse.text};
    });
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
    ctxReply(ctx,'Seleccionaste la opción 2');

  } else if (data === 'opcion3') {
    ctxReply(ctx,'Seleccionaste la opción 3');

  } else if (data === 'opcion4') {
    ctxReply(ctx,'Seleccionaste la opción 4');

  } else if (data === 'espaguetis') {
    ctxReply(ctx,'Seleccionase espaguetis');
  } else if (data === 'macarrones') {
    ctxReply(ctx,'Seleccionase macarrones');
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
