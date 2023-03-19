const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const moment = require('moment');
const puppeteer = require('puppeteer');

const bot = new Telegraf(process.env.TOKEN);

const tokenEnPoint = process.env.TOKEN_EN_POINT;
let previousMessageId;


// Menú fijo
const staticMenu = [
  [{ text: 'Sacar cita' }, { text: 'Buscar producto' }],
  [{ text: 'Añadir producto al carrito' }, { text: 'Afiliado' }]
];


const idUserRegex = /^\d{7,12}$/;

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
  const userId = {userid: ctx.message.from.id, name: ctx.message.from.first_name, language: ctx.message.from.language_code};

  if(userRef) {
    if(validarFormatoIdUser(userRef)) {
      try {
        //aqui comprobar que el user exista en la tabla usuarios
        const endPoint_comprobarUserRef = 'https://seofy.es/api/exists-user/'+tokenEnPoint+'/'+userRef;
        peticionGet(endPoint_comprobarUserRef)
        .then((response) => {
          if(response.existe) {
            console.log('existe la id del referido');
            //si existe ID_USER_SIN_REFERIDO, guardar en tabla usuarios el tipo ID_USER_REFERIDO.si ya existe en la tabla
            //no se guardará, porque o ya era un referido o tenia referidos
            // y guardar en tabla asociacion_referidos la asociacion del tipo ID_USER_SIN_REFERIDO y ID_USER_REFERIDO
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
              //aqui notificar al tipo ID_USER_SIN_REFERIDO de que tiene un nuevo usuario referido si error = 0
              jsonResponse = response.data;
              if(jsonResponse.error === 0) {
                console.log('todo correcto');
                bot.telegram.sendMessage(userRef, `¡Enhorabuena! Tiene un nuevo referido, NAME: ${userId.name} e ID: ${userId.userid}`);
              } else {
                console.log('salio mal');
              }

            })
            .catch(error => {
              console.log(error);
            });
          } else {
            console.log('NO existe la id del referido');
            bot.telegram.sendMessage(userId.userid, 'No se te asocio a ningún referido, ya que el referido no existe');
          }
        })
        .catch((error) => {
          console.error('error: '+error);
        });

      } catch (error) {
         console.log(error);
         console.log('No se pudo encontrar el usuario');
      }
    } else {
      console.log('no tiene el id de user correcto');
      bot.telegram.sendMessage(userId.userid, 'No se te asocio a ningún referido, ya que el formato introducido es incorrecto');
    }
  } else {
    console.log('no hay ningun usuario referido');
    console.log('el user id: '+userId.userid+' , el name: '+userId.name+', el language: '+userId.language);
    //comprobar si existe en la base de datos como userRef o userId. si existe no hacer nada. si no existse
    //guardar el userid vacio sin referidos en la bd como userRef (tabla referidos)
    const endPoint_comprobarUser = 'https://seofy.es/api/exists-user/'+tokenEnPoint+'/'+userId.userid;
    peticionGet(endPoint_comprobarUser)
    .then((response) => {
      //si ya existe el user, no hacemos nada ni se muestra nada
      if(response.existe === 0) {
        //GUARDAR EN LA TABLA referidos
        axios.post('https://seofy.es/api/guardar-user', {
          token: tokenEnPoint,
          idUser: userId.userid,
          nameUser: userId.name
        }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        .then(response => {
          //console.log(response.data);
          jsonResponse = response.data;
          if(jsonResponse.error === 0) {
            console.log(jsonResponse.msg);
            //bot.telegram.sendMessage(userRef, `¡Enhorabuena! Tiene un nuevo referido, NAME: ${userId.name} e ID: ${userId.userid}`);
          } else {
            console.log('No se pudo insertar el registro');
          }
        })
        .catch(error => {
          console.log('error nivel1:'+error);
        });
      }
    })
    .catch((error) => {
      console.error('error nivel2: '+error);
    });
  }

  ctx.reply('¡Bienvenido! ¿Qué acción quieres realizar?', {
    reply_markup: {
      keyboard: staticMenu,
      resize_keyboard: true,
      selective: true
    }
  });
});

// Manejador de eventos para el botón "Ver lista de productos"
bot.hears('Sacar cita', (ctx) => {
  // Acción a realizar cuando se seleccione el botón
  ctx.reply('Eliga una ciudad:');
  console.log(scrapeCiudades());
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


const menuAfiliados = [
  [{ text: 'Generar link de afiliado', callback_data: 'linkAfiliado' }],
  [{ text: 'Ver mi referido', callback_data: 'verReferido' }],
  [{ text: 'Ver mis afiliados', callback_data: 'verAfiliados' }]
];
// Manejador de eventos para el botón "Afiliado"
bot.hears('Afiliado', (ctx) => {
  //variables para que funcione el editMessageText cada vez que se
  // pulsa la opcion del menu Afiliado y coga otra opcion
  idMessageAfiliados = null;
  msgAfiliadosAnterior = '';
  ctx.reply('Selecciona una opción:', Markup.inlineKeyboard(menuAfiliados));
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
 } else if (data === 'linkAfiliado') {
    await compartirEnlace(ctx);
 } else if (data === 'verReferido') {
    await verReferido(ctx);
 } else if (data === 'verAfiliados') {
    await verAfiliados(ctx);
 }
});
//------------------------------
//SECCION AFILIADOS
//------------------------------
let idMessageAfiliados;
let msgAfiliadosAnterior = '';

async function compartirEnlace(ctx) {
  const idUser = ctx.callbackQuery.from.id;
  const nameBot = ctx.callbackQuery.message.from.username;

  // Concatenar los mensajes en un solo mensaje utilizando formato HTML
  const messageText = `<b>📣Si comparte este link, ganará 25 euros por cada compra efectiva que se realice desde su enlace de afiliado.</b>\n\n` +
                      `Ejemplo: si una persona compra 6 tramites siendo referido suyo, usted ganará 150 euros (6 x 25). Y este ejemplo es con una persona, imaginese lo que puede llegar a ganar si este enlace lo comparte con mucha gente.\n\n` +
                      `Recuerda, a cuanta mas gente lo compartas y hagan compras...mas 💲💲\n\n` +
                      `<b>Enlace a compartir❗</b>\n` +
                      `<a href="https://t.me/${nameBot}?start=${idUser}">https://t.me/${nameBot}?start=${idUser}</a>`;

  if(!idMessageAfiliados) {
    // Enviar el mensaje como HTML
    const sentMessage = await ctx.telegram.sendMessage(ctx.chat.id, messageText, {
      parse_mode: 'HTML'
    });
    idMessageAfiliados = sentMessage.message_id;
    msgAfiliadosAnterior = messageText;
  } else {
    if(msgAfiliadosAnterior != messageText) {
      await ctx.telegram.editMessageText(ctx.chat.id, idMessageAfiliados, null, messageText,  {
        parse_mode: 'HTML'
      });
      msgAfiliadosAnterior = messageText;
    }
  }
}

async function verReferido(ctx) {
  const idUser = ctx.callbackQuery.from.id;
  const endPoint = 'https://seofy.es/api/exists-user-ref/'+tokenEnPoint+'/'+idUser;
  try {
    const response = await peticionGet(endPoint);
    //EN ESTE IF SE ENTRA, SI EXISTE EL USUARIO
    if (response.nombre_usuario !== false) {
      const messageText = 'Usuario referido: '+ response.nombre_usuario;
      //GUARDAR EN LA TABLA referidos
      if (!idMessageAfiliados) {
        const sentMessage = await ctx.reply(messageText);
        idMessageAfiliados = sentMessage.message_id;
        msgAfiliadosAnterior = messageText;
      } else {
        if(msgAfiliadosAnterior != messageText) {
          //console.log('se mete en bla: '+messageText);
          await ctx.telegram.editMessageText(ctx.chat.id, idMessageAfiliados, null, messageText);
          msgAfiliadosAnterior = messageText;
        }
      }
    } else {
      const messageText = 'Usuario referido: ninguno';
      //GUARDAR EN LA TABLA referidos
      if (!idMessageAfiliados) {
        const sentMessage = await ctx.reply(messageText);
        idMessageAfiliados = sentMessage.message_id;
        msgAfiliadosAnterior = messageText;
      } else {
        if(msgAfiliadosAnterior != messageText) {
          await ctx.telegram.editMessageText(ctx.chat.id, idMessageAfiliados, null, messageText);
          msgAfiliadosAnterior = messageText;
        }
      }
    }
  } catch (error) {
    console.error('error verReferido: '+error);
  }
}


async function verAfiliados(ctx) {
  const idUser = ctx.callbackQuery.from.id;
  const endPoint = 'https://seofy.es/api/get-afiliados/'+tokenEnPoint+'/'+idUser;
  try {
    const response = await peticionGet(endPoint);
    //SI ES ARRAY ES PORQUE TIENE AFILIADOS

    if(Array.isArray(response)) {
      const cantidadElementos = response.length;
      let msgAfiliados = '';
      msgAfiliados += 'AFILIADOS ('+cantidadElementos+')\n';
      msgAfiliados += '---------------------------\n';
      for (let i = 0; i < cantidadElementos; i++) {
        let nombre_usuario = response[i].nombre_usuario;
        let fecha_asociacion = moment(response[i].fecha_asociacion).format('DD/MM/YYYY HH:mm');
        let numeroLista = i+1;
        msgAfiliados += numeroLista+'- Nombre: '+nombre_usuario+'\nFecha de afiliación: '+fecha_asociacion+' GTM+1\n\n';
      }
      if (!idMessageAfiliados) {
        const sentMessage = await ctx.reply(msgAfiliados);
        idMessageAfiliados = sentMessage.message_id;
        msgAfiliadosAnterior = msgAfiliados;
      } else {
        if(msgAfiliadosAnterior != msgAfiliados) {
          await ctx.telegram.editMessageText(ctx.chat.id, idMessageAfiliados, null, msgAfiliados);
          msgAfiliadosAnterior = msgAfiliados;
        }
      }
    }
  } catch (error) {
    console.error('error verAfiliados: '+error);
  }
}

//------------------------------
//FIN SECCION AFILIADOS
//------------------------------

//------------------------------
//SECCION SACAR CITA
//------------------------------

async function scrapeCiudades() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://icp.administracionelectronica.gob.es/icpplus/index.html');

  // Espera a que el select esté disponible en la página
  await page.waitForSelector('select#form');

  // Obtiene todas las opciones del select
  const selectOptions = await page.evaluate(() => {
    // Selecciona el select
    const select = document.querySelector('select#form');
    // Obtiene todas las opciones del select
    const options = select.querySelectorAll('option');
    // Crea un arreglo para almacenar los valores de las opciones
    const optionValues = [];
    // Itera sobre las opciones y extrae sus valores, ignorando la primera opción
    for (let i = 1; i < options.length; i++) {
      const optionValue = options[i].value;
      optionValues.push(optionValue);
    }
    return optionValues;
  });
};

  //------------------------------
  //FIN SECCION SACAR CITA
  //------------------------------

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
