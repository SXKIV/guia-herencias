# Asistente SIILV-I.A + dictámenes del SII: paquete para integrar

> **Para Claude Code:** este archivo explica qué hay en el paquete y cómo integrarlo en el
> proyecto de la guía de herencias. Léelo completo antes de tocar el código del proyecto y
> adapta lo que se indica en "Qué adaptar" a la estructura real de la página.

Hay dos piezas:

1. **El chatbot SIILV-I.A**: una burbuja de chat abajo a la derecha. Responde **sin IA ni
   servidores** (costo cero). Todo corre en el navegador con reglas, el contenido de la guía y
   los procedimientos de las tres aptitudes del agente de Copilot (`resolver-herencia-intestada-sii`,
   `aplicar-ley-16271-formulario` e `interpretar-circulares-sii-herencia`).
2. **Los dictámenes del SII sobre herencias**: 142 oficios (2010–2026) de la Ley 16.271,
   guardados en un bloque oculto que el chat consulta, más un script que **cada día a las
   2:00** revisa si el SII publicó oficios nuevos y los agrega.

## Archivos

| Archivo | Qué es |
|---|---|
| `asistente/asistente.css` | Estilos de la burbuja. Todas las clases empiezan con `sia-`. |
| `asistente/asistente-burbuja.html` | Marcado de la burbuja y la ventana (va antes de `</body>`). |
| `asistente/asistente-bloques-ocultos.html` | Dos `<script>` que no se muestran: `siaInfoExtra` (información que la Clínica agrega a mano) y `siaDictamenes` (los dictámenes, en JSON). |
| `asistente/asistente.js` | El motor del chat. `ASISTENTE_CONFIG` al inicio es lo único que se configura. |
| `dictamenes/dictamenes.json` | Los mismos dictámenes en un archivo aparte, para proyectos que prefieran cargarlos así. |
| `dictamenes/actualizar-dictamenes.ps1` | Script de PowerShell que trae los dictámenes nuevos del SII. |
| `dictamenes/programar-tarea.ps1` | Programa el script en el Programador de tareas de Windows (diario, 2:00). |
| `demo.html` | Página mínima para probar el paquete (abrir con un servidor local). |

## 1. Integrar el chatbot

### Página HTML estática
1. Pegar el contenido de `asistente.css` dentro del `<style>` de la página, o enlazarlo con `<link>`.
2. Pegar `asistente-burbuja.html` justo antes de `</body>`.
3. Pegar `asistente-bloques-ocultos.html` después de la burbuja.
4. Pegar `asistente.js` dentro de un `<script>` **después** de los tres anteriores (necesita que la burbuja ya exista en el DOM).

Una sola página autocontenida funciona aunque se abra con doble clic (`file://`).

### Proyecto con framework (React, Vue, Next, Vite, Astro…)
- Lo más simple es dejarlo fuera del framework: el marcado en el HTML base (`index.html`, `_document`, layout) y `asistente.js` como script estático (`public/`) cargado al final del `body`.
- Si se quiere como componente, el JS espera estos ids en el DOM antes de ejecutarse: `siaLanzador`, `siaPanel`, `siaCuerpo`, `siaForm`, `siaTexto`, `siaEnviar`, `siaPunto`, `siaNueva`, `siaCerrar`. Ejecutarlo una sola vez después de montar el componente.
- Si las secciones de la guía se renderizan después (rutas, carga diferida), el chat no podrá citarlas ni enlazarlas: ver `selectorSecciones` más abajo.

## 2. Qué adaptar a la versión nueva de la página

**a) Secciones y enlaces.** El chat cita párrafos de la guía y enlaza secciones con `[texto](#id)`. Lo controla `ASISTENTE_CONFIG`:
- `selectorSecciones` (por defecto `"section.pantalla[id]"`): las secciones de contenido. Cada una debe tener `id` y un `h1`.
- `irASeccion`: por defecto `null`, porque la guía original ya navega con botones `data-ir="id"` (un listener global en `document` que muestra la sección). Si la página nueva no usa `data-ir`, definirla, por ejemplo:
  `irASeccion: function(id){ document.getElementById(id).scrollIntoView({behavior: "smooth"}); }`
- Las respuestas fijas de `asistente.js` enlazan estos ids de la guía original. Si en la página nueva cambiaron, reemplazarlos en `asistente.js` (buscar `](#`):
  `bienes, cadena, calculadora, cero, conceptos, costos, descuentos, documentos, dos-utm, dudas-usuario, formulario, ordenes, parentesco, tablas, trampas, viaje`.
  Un enlace a un id que no existe se muestra como texto plano: no rompe nada, pero se pierde el enlace.

**b) Diccionario.** Para "¿qué es X?", el chat busca elementos `<details><summary>Término</summary>…</details>` dentro de la sección `conceptos`. Si el diccionario nuevo tiene otro formato, ajustar `construirIndice()` y `buscarEnGuia()` en `asistente.js`.

**c) Contenido de las respuestas.** El arreglo `TEMAS`, las constantes `DOCUMENTOS`, `DEFINICIONES`, `PAGO`, `TESTAMENTO` y `FORMULARIO`, la lista `BIENES` y las tablas `TRAMOS`/`PARENTESCOS` repiten datos de la guía original (exenciones de 600/60 UTM, tramos, recargos, costos, 9 secciones del formulario, categorías de bienes). Si la versión nueva actualizó alguno de esos datos, actualizarlos también aquí para que el chat no contradiga a la página.

**d) Configuración.** En `ASISTENTE_CONFIG`: `utm` y `utmMes` (valor usado en las estimaciones), `contacto` (Clínica Jurídica UC) y `urlDictamenes` (ver más abajo).

**e) Estilos.** `asistente.css` usa las variables de color de la guía (`--primario`, `--primario-osc`, `--acento`, `--linea`, etc.) y trae los colores originales como respaldo. Incluye `.flotante-calc{right:92px}` para correr el botón naranja "Calcular mi impuesto" y que no tape la burbuja; quitarlo si la página nueva no tiene ese botón.

**f) Botones de inicio.** `INICIADORES` en `asistente.js`: "Revisar mi caso", "Lista de documentos", "Guiar Formulario 4412", "Pago y certificado", "Caso con testamento" y "Definiciones rápidas" (los iniciadores del agente de Copilot).

## 3. Cómo responde (orden de prioridad)

1. Botones y conversaciones guiadas en curso ("Revisar mi caso" pregunta 5 cosas y cierra con *Qué tienes listo / Qué te falta / Próximo paso recomendado*; "Guiar Formulario 4412" recorre las 9 secciones).
2. **`siaInfoExtra`**: información agregada a mano por la Clínica (formato explicado en el propio bloque: `## Título`, `claves: …`, respuesta).
3. Preguntas directas por dictámenes ("¿hay dictámenes sobre…?", "¿qué ha dicho el SII?").
4. Cálculos: "soy hijo y me tocan 50 millones" (exención, tramo y recargo) y repartos: "herencia de 80 millones, cónyuge y 3 hijos" (art. 988).
5. Dónde se declara cada bien (auto, AFP, cuenta, parcela, acciones…).
6. Temas frecuentes (`TEMAS`), con dictámenes relacionados agregados al final cuando calzan.
7. Búsqueda en el texto de la guía y en el diccionario.
8. Búsqueda en los dictámenes.
9. Si nada calza: lo dice y ofrece hablar con la Clínica (no inventa).

Además, si alguien escribe un RUT o una clave, le advierte que no la comparta.

## 4. Dictámenes del SII y actualización diaria

**Fuente.** Índice de jurisprudencia administrativa del SII → "Otras Normas":
https://www.sii.cl/normativa_legislacion/jurisprudencia_administrativa/indice_jadm.htm
- 2019 en adelante: la página llena la lista con `POST https://www3.sii.cl/getPublicacionesCTByMateria`, cuerpo `{"key":"OTROS","year":"2026"}`. Responde JSON en UTF-8 con `pubNumOficio`, `pubFechaPubli`, `pubLegal` (materia) y `pubResumen`. El texto completo es un PDF que se descarga con un formulario, así que el enlace guardado apunta a la página del año.
- 2009 a 2018: páginas HTML en ISO-8859-1 (`otras_normas/AAAA/otras_normas_jadmAAAA.htm`), y cada oficio tiene su `jaNNNN.htm`.
- Se guardan los que mencionan `16.271` o "herencia" en la materia o el resumen.

**Formato** (bloque `siaDictamenes` o `dictamenes.json`):
```json
{"revisado":"29/10/2026","dictamenes":[{"anio":2026,"oficio":"1126","fecha":"13/05/2026","materia":"Herencias, Asignaciones y Donaciones – Ley N° 16.271 – …","resumen":"Derechos de sepultación y su afectación con impuesto a las herencias.","url":"https://www.sii.cl/…"}]}
```

**Dónde guardarlos:**
- Dentro de la página (por defecto): funciona con `file://` y en cualquier hosting.
- En un archivo aparte: poner `urlDictamenes: "dictamenes.json"` en `ASISTENTE_CONFIG` y servir el archivo junto a la página. Solo funciona con la página publicada en un servidor, no con doble clic.

**Actualización diaria en Windows:**
```powershell
cd dictamenes
# Primera carga completa (opcional: el paquete ya trae los 142)
powershell -ExecutionPolicy Bypass -File actualizar-dictamenes.ps1 -Destino "C:\ruta\guia.html" -Completo
# Programar la revisión diaria a las 2:00 (con el destino real: .html con el bloque, o .json)
powershell -ExecutionPolicy Bypass -File programar-tarea.ps1 -Destino "C:\ruta\guia.html"
# Quitar la tarea
powershell -ExecutionPolicy Bypass -File programar-tarea.ps1 -Quitar
```
- El script solo **agrega** dictámenes nuevos (clave: año + número de oficio) y nunca borra. Revisa el año actual y el anterior.
- Anota cada ejecución en `dictamenes/dictamenes-log.txt`. Si el SII no responde, no modifica nada.
- El PC debe estar encendido con la sesión abierta; si estaba apagado, la tarea corre al encenderlo.
- Actualiza el archivo **local**. Si la página está publicada en un hosting, hay que volver a subirla. Alternativa sin PC encendido: reescribir el script en Node o Python y correrlo con un cron de **GitHub Actions** (`0 5 * * *` UTC ≈ 2:00 en Chile en horario de verano), con commit automático del HTML o JSON si el hosting despliega desde el repositorio (GitHub Pages, Netlify, Vercel).
- En el computador original ya existe la tarea "SIILV - Actualizar dictamenes SII", que actualiza la copia de allá. Para que no haya dos fuentes de verdad, conviene que quede programada en un solo lugar.

## 5. Probar después de integrar

Abrir la burbuja y escribir:

| Pregunta | Debe responder |
|---|---|
| `hola` | Saludo con botones |
| Botón "Revisar mi caso" | 5 preguntas y el resumen *Qué tienes listo / Qué te falta / Próximo paso* |
| `Soy hijo y me tocan 50 millones, ¿cuánto pago?` | Tabla: exención de 600 UTM, tramo de 1% y ≈ $69.700 |
| `herencia de 80 millones, cónyuge y 3 hijos` | $16.000.000 para cada hijo y $32.000.000 para el cónyuge, todos exentos |
| `¿dónde declaro el auto?` | Categoría Vehículos, código SII y tasación |
| `¿qué es la nuda propiedad?` | Cita del diccionario de la guía |
| `¿Hay dictámenes sobre sepulturas?` | Oficio 1126 de 2026 |
| `¿se paga impuesto por el seguro de vida?` | Oficios 1229 y 186 de 2023 |
| `Mi RUT es 12.345.678-9` | Advertencia de no compartir datos |
| `¿qué tiempo hará mañana?` | Dice que no puede ayudar con eso y ofrece la Clínica |

Revisar también que los enlaces del chat abran la sección correcta y que en el celular (≤ 640 px) la ventana ocupe toda la pantalla.

## Avisos
- El bloque `siaInfoExtra` es oculto pero no secreto: se ve en el código fuente. No guardar ahí datos personales.
- Todo es orientación general: el pie de la burbuja lo dice y las respuestas lo recuerdan.
