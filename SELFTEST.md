# Pruebas — InformeIA (version inicial)

## Autotest sin navegador (`node check.js`)

```
node check.js
```

Verifica (9 comprobaciones):
1. **Existencia**: `index.html` existe.
2. **Elementos clave**: contiene los ids `notesInput`, `templateSelect`, `toneSelect`,
   `generateBtn` y `resultArea`.
3. **Contenido**: incluye el titulo "InformeIA", el boton "Generar informe" y **no** usa
   CDNs externos (`src="http(s)://..."`).

Resultado de la ultima corrida:

```
Resultado: 9 pasadas, 0 fallidas.
EXIT=0
```

## Prueba manual (en el navegador)

- Se abre `index.html` **directamente** (sin servidor) y la interfaz carga bien.
- Al pulsar **"Generar informe"** se muestra en la vista previa un **informe de ejemplo
  simulado** con formato: titulo, subtitulos, negritas y listas (render de Markdown propio,
  sin librerias). Las notas escritas se incorporan como "Puntos clave".
- Selectores de **tipo de informe** (Acta de reunion, Estado de proyecto, Propuesta comercial,
  Informe de investigacion) y **tono** (Formal, Directo, Detallado) funcionan y el tipo/tono
  elegido aparece en el informe.

## Evaluacion visual

- `ui_shots/iter_01.png` — pantalla inicial (formulario + vista previa vacia). Revisada:
  buen contraste, boton grande, textos legibles, todo en espanol.
- `ui_shots/iter_01_generado.png` — informe de ejemplo generado y renderizado con formato.

## Integracion de IA real (Worker de Cloudflare)

Se agrego un **Worker** en `worker/` (`wrangler.toml` + `src/index.js`) con el endpoint
`POST /api/generar` que usa el binding **AI** (Workers AI) para redactar el informe.

Autotest ampliado (`node check.js` -> **16 pasadas, 0 fallidas**): ahora tambien verifica que
`index.html` define `WORKER_URL` y llama a `/api/generar`, y que el Worker existe, define el
endpoint, usa `env.AI.run` e incluye cabeceras **CORS**.

Prueba real con `npx wrangler dev` (Worker en localhost:8787) y `curl`:

```
POST /api/generar { notes, template:"Acta de reunión", tone:"Formal" }
-> HTTP 200 { "success": true, "informe": "# Acta de Reunión ...", "modelo": "@cf/mistral/mistral-7b-instruct-v0.1" }
```

**Modelo usado:** el solicitado `@cf/meta/llama-3-8b-instruct-awq` esta **retirado (HTTP 410)**,
por lo que el Worker cae automaticamente al respaldo **`@cf/mistral/mistral-7b-instruct-v0.1`**
(funciona). Como ultimo respaldo queda `@cf/meta/llama-3.3-70b-instruct-fp8-fast`.

Prueba desde la interfaz (`index.html` abierto como archivo + Worker corriendo): al pulsar
**Generar** se llama al Worker (CORS habilitado) y se renderiza el informe real con el
conversor Markdown. Evidencia:

- `ui_shots/iter_02_worker_test.png` — comando `curl` y respuesta JSON (`success:true`, modelo).
- `ui_shots/iter_02_ui_generated.png` — la interfaz mostrando un **informe generado por la IA**
  (Acta de reunion con Resumen ejecutivo, Avance, Pendientes y Proximos pasos). Revisada
  manualmente: formato correcto, en espanol, anclado a las notas.

## Estado

La **IA real ya funciona** en local a traves del Worker. Pendiente para proximas iteraciones:
persistencia en D1 y despliegue del Worker + la web.
