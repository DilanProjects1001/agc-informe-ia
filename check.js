/* =========================================================================
   check.js — Autotest de InformeIA (version inicial, sin navegador).
   Verifica que index.html exista y contenga los elementos clave.
   Ejecuta: node check.js   ->  exit 0 si todo ok, exit 1 si falta algo.
   ========================================================================= */
'use strict';

const fs = require('fs');
const path = require('path');

let pasadas = 0, fallidas = 0;
function ok(nombre, cond) {
  if (cond) { pasadas++; console.log('  OK  ' + nombre); }
  else { fallidas++; console.log('  XX  ' + nombre); }
}

const rutaHtml = path.join(__dirname, 'index.html');

console.log('== Existencia del archivo ==');
const existe = fs.existsSync(rutaHtml);
ok('index.html existe', existe);

let html = '';
if (existe) html = fs.readFileSync(rutaHtml, 'utf8');

console.log('== Elementos clave (ids) ==');
['notesInput', 'templateSelect', 'toneSelect', 'generateBtn', 'resultArea'].forEach(function (id) {
  ok("contiene id='" + id + "'", html.indexOf('id="' + id + '"') !== -1);
});

console.log('== Contenido en espanol / titulo ==');
ok('contiene el titulo InformeIA', html.indexOf('InformeIA') !== -1);
ok('boton dice "Generar informe"', html.indexOf('Generar informe') !== -1);
ok('sin CDNs externos (no hay http(s)://...cdn)', !/src\s*=\s*["']https?:\/\//i.test(html));

console.log('== Conexion del HTML con el Worker ==');
ok('index.html define WORKER_URL', html.indexOf('WORKER_URL') !== -1);
ok('index.html hace fetch a /api/generar', html.indexOf('/api/generar') !== -1);

console.log('== Worker (backend de IA) ==');
const rutaWorker = path.join(__dirname, 'worker', 'src', 'index.js');
const rutaToml = path.join(__dirname, 'worker', 'wrangler.toml');
const existeWorker = fs.existsSync(rutaWorker);
ok('worker/src/index.js existe', existeWorker);
ok('worker/wrangler.toml existe', fs.existsSync(rutaToml));
let ws = existeWorker ? fs.readFileSync(rutaWorker, 'utf8') : '';
ok('el Worker define el endpoint /api/generar', ws.indexOf('/api/generar') !== -1);
ok('el Worker usa el binding AI (env.AI.run)', ws.indexOf('env.AI.run') !== -1);
ok('el Worker incluye cabeceras CORS', ws.indexOf('Access-Control-Allow-Origin') !== -1);

console.log('\nResultado: ' + pasadas + ' pasadas, ' + fallidas + ' fallidas.');
process.exit(fallidas === 0 ? 0 : 1);
