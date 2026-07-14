/* =========================================================================
   Worker de Cloudflare — InformeIA
   Endpoint: POST /api/generar   Body: { notes, template, tone }
   Genera un informe profesional en espanol (Markdown) con Workers AI.

   Nota de modelo: la mision pedia '@cf/meta/llama-3-8b-instruct-awq', pero ese
   modelo devuelve HTTP 410 (retirado). Se intenta en orden y se usa el primero
   que funcione; el respaldo real es '@cf/mistral/mistral-7b-instruct-v0.1'.
   ========================================================================= */

const MODELOS = [
  '@cf/meta/llama-3-8b-instruct-awq',        // solicitado (actualmente retirado: 410)
  '@cf/mistral/mistral-7b-instruct-v0.1',    // respaldo solicitado (funciona)
  '@cf/meta/llama-3.3-70b-instruct-fp8-fast', // respaldo adicional (vigente)
];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, CORS),
  });
}

function construirMensajes(notes, template, tone) {
  const sistema =
    'Eres un asistente experto en redaccion de informes profesionales en espanol. ' +
    'Escribes SIEMPRE en espanol, con un tono ' + tone.toLowerCase() + '. ' +
    'Devuelves el informe en formato Markdown: un titulo principal con "# ", subtitulos ' +
    'con "## ", texto en **negritas** cuando sea util y listas con "- ". No agregues ' +
    'explicaciones fuera del informe.';
  const usuario =
    'Redacta un informe del tipo "' + template + '" a partir de estas notas:\n\n' +
    notes + '\n\n' +
    'El informe debe incluir: un titulo, un "## Resumen ejecutivo", una o mas secciones ' +
    'con los puntos principales, y una seccion final "## Proximos pasos" con una lista. ' +
    'Si las notas son escasas, complementa de forma razonable sin inventar datos concretos.';
  return [{ role: 'system', content: sistema }, { role: 'user', content: usuario }];
}

const DDL =
  'CREATE TABLE IF NOT EXISTS informes (' +
  'id INTEGER PRIMARY KEY AUTOINCREMENT, notas TEXT NOT NULL, plantilla TEXT NOT NULL, ' +
  'tono TEXT NOT NULL, informe TEXT NOT NULL, modelo TEXT, ' +
  'creado_en DATETIME DEFAULT CURRENT_TIMESTAMP)';

function hayDB(env) { return env && env.DB && typeof env.DB.prepare === 'function'; }

async function generarInforme(env, mensajes) {
  let ultimoError = 'sin modelos disponibles';
  for (const modelo of MODELOS) {
    try {
      const salida = await env.AI.run(modelo, { messages: mensajes, max_tokens: 900 });
      const texto = (salida && (salida.response || salida.result)) || '';
      if (texto && String(texto).trim()) return { informe: String(texto).trim(), modelo: modelo };
      ultimoError = 'respuesta vacia del modelo ' + modelo;
    } catch (e) {
      ultimoError = String(e && e.message ? e.message : e);
    }
  }
  throw new Error(ultimoError);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (url.pathname === '/api/generar' && request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch (e) { return json({ success: false, error: 'JSON invalido' }, 400); }

      const notes = (body && body.notes ? String(body.notes) : '').trim();
      const template = (body && body.template ? String(body.template) : 'Informe').trim();
      const tone = (body && body.tone ? String(body.tone) : 'Formal').trim();
      if (!notes) return json({ success: false, error: 'Faltan las notas' }, 400);

      if (!env || !env.AI || typeof env.AI.run !== 'function') {
        return json({ success: false, error: 'Workers AI no esta configurado (binding AI).' }, 503);
      }

      let r;
      try {
        r = await generarInforme(env, construirMensajes(notes, template, tone));
      } catch (e) {
        return json({ success: false, error: 'No se pudo generar el informe: ' + String(e) }, 502);
      }

      // Guardar en D1 (no bloquea la respuesta si la BD falla).
      let guardado = false;
      if (hayDB(env)) {
        try {
          await env.DB.prepare(DDL).run();
          await env.DB
            .prepare('INSERT INTO informes (notas, plantilla, tono, informe, modelo) VALUES (?, ?, ?, ?, ?)')
            .bind(notes, template, tone, r.informe, r.modelo)
            .run();
          guardado = true;
        } catch (e) { /* si falla el guardado, igual devolvemos el informe */ }
      }

      return json({ success: true, informe: r.informe, modelo: r.modelo, guardado: guardado });
    }

    if (url.pathname === '/api/historial' && request.method === 'GET') {
      if (!hayDB(env)) return json({ success: false, error: 'La base de datos (D1) no esta configurada.' }, 503);
      try {
        await env.DB.prepare(DDL).run();
        const res = await env.DB
          .prepare('SELECT id, notas, plantilla, tono, informe, modelo, creado_en FROM informes ORDER BY id DESC LIMIT 20')
          .all();
        return json({ success: true, informes: (res && res.results) || [] });
      } catch (e) {
        return json({ success: false, error: 'No se pudo leer el historial: ' + String(e) }, 500);
      }
    }

    if (url.pathname === '/' || url.pathname === '') {
      return new Response('InformeIA Worker activo. Usa POST /api/generar', {
        headers: Object.assign({ 'Content-Type': 'text/plain; charset=utf-8' }, CORS),
      });
    }

    return json({ success: false, error: 'Ruta no encontrada' }, 404);
  },
};
