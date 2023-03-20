const puppeteer = require('puppeteer');
const tokenEnPoint = process.env.TOKEN_EN_POINT;

async function main() {
  const optionValues = await scrapeCiudades();
  console.log('los valores son:');
  console.log(optionValues);
  axios.post('https://seofy.es/api/guardar-provincias', {
    token: tokenEnPoint,
    provincias: optionValues
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
      console.log(jsonResponse.msg);
    } else {
      console.log('Algo salio mal');
    }
  })
  .catch(error => {
    console.log(error);
  });
}

async function scrapeCiudades() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ]
  });
  //const browser = await puppeteer.launch({executablePath: '/app/.apt/opt/google/chrome/chrome'});
  const page = await browser.newPage();
  await page.goto(process.env.URL_CITAS);
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
      const optionValue = options[i].text;
      optionValues.push(optionValue);
    }
    return optionValues;
  });
  await browser.close();
  return selectOptions;
};

main();
