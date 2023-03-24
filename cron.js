const CronJob = require('cron').CronJob;

// Ejecuta el script cada 3 meses en el primer día del mes a las 12:00 AM
const job1 = new CronJob('0 0 1 */3 * *', function() {
  console.log('Ejecutando script1...');
  // Reemplaza `nombre-del-archivo1.js` con el nombre de tu primer archivo JS que quieres ejecutar
  require('./scraperWebProvincias.js');
});

job1.start();
