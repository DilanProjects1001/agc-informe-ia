# 📝 InformeIA — Generador de informes profesionales con IA

> **Estado:** propuesta (diseño). Aún no construido — este README define el proyecto.

## 🎯 El problema (en palabras simples)

Redactar informes desde cero es lento y repetitivo: un **acta de reunión**, un **reporte de
estado de proyecto**, una **propuesta comercial** o un **informe breve** implican estructurar
ideas, dar formato y cuidar el tono. Muchos freelancers y pequeñas empresas pierden tiempo en
eso en lugar de en su trabajo real.

**InformeIA** convierte unas **notas sueltas** en un **informe estructurado y profesional** en
segundos: tú pegas los puntos clave, eliges el tipo de informe y el tono, y la IA redacta un
documento listo para editar y exportar.

## ✨ Qué hará (features)

1. **Plantillas de informe** (eliges una):
   - 📋 Acta de reunión (asistentes, temas, acuerdos, tareas asignadas).
   - 📊 Estado de proyecto (avance, riesgos, próximos pasos).
   - 💼 Propuesta comercial (contexto, solución, alcance, precio estimado).
   - 🔎 Informe breve de investigación (introducción, hallazgos, conclusión).
2. **Entrada simple:** un área de texto para pegar tus notas o puntos clave, más un selector de
   **tono** (formal / cercano) y longitud (breve / detallado).
3. **Generación con IA:** produce un informe estructurado en **español** (título, resumen
   ejecutivo, secciones con encabezados, y próximos pasos / conclusión).
4. **Vista previa con formato:** el informe se muestra renderizado (un mini-render de Markdown
   propio, sin librerías) para que se vea como documento, no como texto plano.
5. **Editable y exportable:** corriges lo que quieras y exportas con **copiar Markdown**,
   **descargar .md** o **imprimir a PDF** (diálogo de impresión del navegador).
6. **Historial (opcional):** cada informe generado se guarda en **Cloudflare D1** para
   reutilizarlo o consultarlo después.
7. **Modo local de respaldo:** si no hay backend, rellena la plantilla con tus notas (sin IA)
   para que la app **siga siendo útil** abierta directamente.

## 🧱 Stack (con el stack del dueño)

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| Interfaz | HTML + CSS + JavaScript puro (sin CDNs) | Autocontenida, se abre sin instalar nada |
| Render de informe | Mini-conversor Markdown→HTML en JS | Vista de documento sin librerías externas |
| Backend | Cloudflare Pages Functions (`POST /api/generar`) | API REST serverless, sin servidor que mantener |
| Capa de IA | OpenAI `gpt-4o-mini` **o** Cloudflare Workers AI (respaldo) | Genera el informe; el respaldo evita depender de una clave |
| Base de datos | Cloudflare D1 (SQLite) | Historial de informes generados |
| Despliegue | Cloudflare Pages (`agc-informe-ia`) | Demo en vivo pública con HTTPS |
| Calidad | `check.js` + `SELFTEST.md` | Autotest de la lógica pura (plantillas, render Markdown) |

## 💼 Qué skills de empleo demuestra

Las ofertas reales de *AI Developer* y *Generative AI / AI Content* (Upwork, LinkedIn) piden
de forma repetida (julio 2026):

- **Generación de documentos/contenido con IA** — *"Automated Proposals"*, *"AI-driven content
  generation"*, asistentes GPT. ← núcleo del proyecto.
- **Prompt engineering para salida estructurada y long-form** ← el prompt fuerza secciones,
  tono e idioma consistentes.
- **Integración de LLMs (OpenAI GPT-4o / Claude / Workers AI)** ← capa de IA con respaldo.
- **Full-stack + serverless + base de datos** ← Pages Functions + D1 en Cloudflare.

Postings de referencia:
- Upwork — *Best Freelance AI Content Creators (Jul 2026)*: https://www.upwork.com/hire/ai-content-creators/
- Upwork — *Generative AI Professionals (2026)*: https://www.upwork.com/hire/generative-ai/
- Upwork — *AI Developer Job Description Template 2026*: https://www.upwork.com/hire/ai-developers/job-description/

## 🔀 En qué se diferencia de los proyectos anteriores

- No es RAG ni Q&A sobre documentos (eso ya está en DocuMente IA y **AgcDocQA**).
- No extrae datos a una tabla (DatosClaros) ni clasifica sentimiento (Radar de Opiniones).
- No encadena pasos de automatización (FlujoIA).
- **InformeIA genera contenido nuevo y estructurado** a partir de notas: es *generación*, no
  recuperación, extracción ni clasificación.

## 🗺️ Plan de construcción (próximas iteraciones)

1. **Base:** interfaz (plantillas + notas + tono) y modo local (rellenar plantilla) + render
   Markdown propio + autotest + captura.
2. **IA:** `POST /api/generar` con OpenAI `gpt-4o-mini` y respaldo Workers AI; vista previa
   renderizada de la respuesta.
3. **Persistencia + despliegue:** historial en D1, deploy a Cloudflare Pages y publicación del
   repo en GitHub.

---

*Proyecto de portafolio · Ciclo "Herramientas Full-Stack con IA".*
