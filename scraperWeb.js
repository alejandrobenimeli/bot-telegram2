const puppeteer = require('puppeteer');

const optionValues = await scrapeCiudades();
console.log('los valores son:');
console.log(optionValues);

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
      const optionValue = options[i].text;
      optionValues.push(optionValue);
    }
    return optionValues;
  });
  await browser.close();
  return selectOptions;
};
