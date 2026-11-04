# Integrar el simulador de declaración en la guía SIIMPLE

Instrucciones para Claude Code. Antes de hacer nada, lee el `CLAUDE.md` de la raíz
del proyecto y sigue sus reglas: explica cada cambio en lenguaje simple antes de
hacerlo, haz los cambios de a uno, no toques lo que no se pide y pregunta si algo
es ambiguo.

## Qué es

Un simulador del formulario digital del SII para declarar el impuesto a las
herencias (F4412, formularios "Testadas" e "Intestadas"). Reproduce sus
secciones y casillas, calcula el impuesto de cada asignatario y muestra los giros
y un comprobante de práctica sin validez. Las casillas, las listas, los textos de
error y las fórmulas se copiaron del código del propio formulario del SII.

Ya viene con el diseño de la guía: usa las variables de color de `estilos.css`
(`--primario`, `--primario-osc`, `--acento`, `--banda`, etc.), Open Sans,
botones, tablas y avisos iguales a los del sitio. No hay que rediseñarlo.

## Archivos de esta carpeta

| Archivo | Qué es | Dónde va |
|---|---|---|
| `simulador.js` | Todo el simulador (datos, cálculo y pantallas). Sin librerías. | Raíz del proyecto, junto a `codigo.js` |
| `simulador.css` | Estilos. Todas las clases empiezan con `sim-`. | Raíz del proyecto, junto a `estilos.css` |
| `seccion-simulador.html` | La sección `<section class="pantalla" id="simulador">` lista para pegar. | Dentro de `index.html` |
| `LEEME.md` | Explicación para el equipo. | No se copia al sitio |

No modifiques el contenido de `simulador.js` ni de `simulador.css` al copiarlos.

## Pasos (uno por uno, confirmando con el equipo)

1. **Copiar los archivos.** Copia `simulador.js` y `simulador.css` a la raíz del
   proyecto.

2. **Cargar los estilos.** En el `<head>` de `index.html`, después de
   `<link rel="stylesheet" href="asistente.css">`, agrega:
   ```html
   <link rel="stylesheet" href="simulador.css">
   ```

3. **Agregar la sección.** Pega el contenido de `seccion-simulador.html` dentro
   de `<main class="wrap">`, después de la última `<section class="pantalla">`
   (hoy es `documentos`) y antes de `</main>`.

4. **Cargar el código.** Al final del `<body>`, después de
   `<script src="asistente.js"></script>`, agrega:
   ```html
   <script src="simulador.js"></script>
   ```
   Tiene que ir **después** de `codigo.js`, porque lee `window.UTM_GUIA`.

5. **Botón en el menú principal.** En `<ul class="menu-principal">`, antes del
   botón de la Calculadora, agrega:
   ```html
   <li><button type="button" data-ir="simulador" data-nav="simulador">Simulador</button></li>
   ```

6. **Enlaces de acceso** (pregunta al equipo si los quiere todos):
   - En la sección `formulario` ("Explicación del formulario en línea"), después
     de la bajada, un botón destacado:
     ```html
     <button class="destacado" type="button" data-ir="simulador">
       <b>Practicar en el simulador</b>
       <span>Llena un formulario de prueba igual al del SII, sin enviar nada</span>
     </button>
     ```
   - En el pie de página, columna "La guía", después de "Calculadora de impuesto":
     ```html
     <li><button class="enlace" type="button" data-ir="simulador">Simulador de declaración</button></li>
     ```
   - En `menu-usuario` y `menu-estudiante`, un `.item` con `data-ir="simulador"`,
     si el equipo lo pide.

7. **Que use la misma tabla de UTM que la calculadora** (recomendado). En
   `codigo.js`, dentro de `calculadoraSIIMPLE`, justo después del bloque que
   escribe `window.UTM_GUIA` en `UTM_MENSUAL` (el `(function(){ var g = window.UTM_GUIA ... })();`),
   agrega una línea:
   ```js
   window.UTM_MENSUAL_GUIA = UTM_MENSUAL; // el simulador (simulador.js) usa esta misma tabla
   ```
   Así, cuando se actualice la UTM cada mes, el simulador la recibe sola. Si no se
   hace este paso, el simulador usa su propia copia de la tabla (enero 2019 a
   noviembre 2026), que no se actualiza sola. En ambos casos toma el valor del mes
   de `var UTM = {...}`.

8. **Página de privacidad.** En la sección `privacidad`, agrega una fila a la tabla:
   ```html
   <tr><td>Simulador de declaración</td><td>Se calcula en tu propio navegador y no se envía a nadie. Solo si presionas "Guardar", el borrador (con los nombres y RUT que escribiste) queda guardado en este navegador; puedes borrarlo con "Borrar borrador" en la pantalla inicial del simulador o limpiando los datos del sitio.</td></tr>
   ```
   La clave que usa es `simuladorHerencia1`.

9. **Actualizar `CLAUDE.md`.** Agrega al final de "Estructura" este texto:
   ```markdown
   - simulador.js y simulador.css: el simulador del formulario F4412 (sección
     simulador). Reproduce las casillas del formulario del SII (testadas e
     intestadas), calcula el impuesto por asignatario y muestra giros y un
     comprobante de práctica. Todo ocurre en el navegador. Todas sus clases CSS
     empiezan con "sim-" y dibuja todo dentro de <div id="simApp">. Usa
     window.UTM_GUIA y window.UTM_MENSUAL_GUIA (codigo.js). Guarda borradores
     solo al presionar "Guardar", con la clave simuladorHerencia1 (si cambia,
     actualizar la sección privacidad). Sus montos, exenciones, tramos y
     recargos siguen las reglas de "Contenido jurídico": no cambiarlos sin
     aprobación.
   ```

## Pruebas después de integrar

Abre `index.html` directamente en el navegador (sin servidor) y revisa:

| Prueba | Debe pasar |
|---|---|
| Menú → Simulador | Se ve "Simulador de declaración" con dos tarjetas: Herencia intestada y Herencia testada |
| Intestada → "Ver caso de ejemplo" | Masa hereditaria $192.000.000; cónyuge 7,74 UTM; Camila 0,87 UTM; Diego 2,44 UTM (con la UTM de marzo 2026 = 69.889 y UTM del día 72.440) |
| Testada → "Ver caso de ejemplo" | Masa $262.000.000; Ana 17,69 UTM; Pablo 3,42 UTM; Tomás 10,58 UTM (recargo 20%) |
| Botón "Enviar" en un ejemplo | Ventana "Enviar declaración" con los giros y la opción de 3 anualidades; "Continuar" muestra el comprobante "SIMULACIÓN · SIN VALIDEZ TRIBUTARIA" |
| "Comenzar" (vacío) → "Enviar" | Ventana de alerta con la lista de lo que falta |
| Agregar asignatario sin causante | Mensaje "Debe ingresar primero un Causante." |
| Ir a la Calculadora y al Diccionario | Siguen funcionando igual que antes |
| Abrir el chat SIILV-I.A | Sigue funcionando; las ventanas del simulador quedan por encima del chat |
| Celular (390 px de ancho) | No hay desplazamiento horizontal de la página; las tablas se desplazan dentro de su recuadro |
| Botón de tamaño de texto (+) | El simulador también agranda su letra |
| Consola del navegador | Sin errores |

Los montos del ejemplo cambian si cambia la UTM del día (`var UTM` en `codigo.js`):
las UTM se mantienen y los pesos se recalculan.

## Lo que no hay que hacer

- No cambies montos, exenciones (600 / 60 UTM), tramos, recargos (20% / 40%),
  tablas de usufructo o nuda propiedad ni reglas de reparto dentro de
  `simulador.js` sin aprobación del equipo (regla de "Contenido jurídico").
- No agregues librerías ni un paso de compilación.
- No quites el aviso "Esto no es una declaración" ni la marca "SIMULACIÓN" del
  comprobante.
- No uses el logo del SII.

## Notas técnicas (por si algo falla)

- Todo el código está dentro de una función `(function(){ ... })();`: no crea
  variables globales. Si no encuentra `#simApp`, no hace nada.
- Escucha clics y escritura en `document`, pero solo actúa si el elemento está
  dentro de `#simApp` o de sus ventanas (`.sim-modal-bg`). Sus botones usan el
  atributo `data-sim`, no `data-ir`, así que no interfiere con la navegación.
- Las ventanas usan `z-index: 1000` (el chat usa 60).
- `simulador.css` neutraliza dentro del simulador algunos estilos generales de
  `estilos.css` (márgenes de `h2`, `p`, `li`, el ancho mínimo de `table`) y
  ensancha solo `#simulador.pantalla`. No afecta a otras secciones.
- El simulador tiene dos diferencias deliberadas con el código del SII, ya
  revisadas: el último tramo de la escala empieza en 14.400 UTM (el SII escribe
  14.440, lo que deja un salto en la escala) y el colateral de 6.º grado de simple
  conjunción recibe su cuota (el SII le da 0).
