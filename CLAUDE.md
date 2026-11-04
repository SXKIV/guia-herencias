# Guía del impuesto a las herencias intestadas

## Qué es este proyecto
Sitio web de orientación para declarar el impuesto a las herencias intestadas
ante el SII, después de la posesión efectiva. Nació en el curso Diseño Legal
(Derecho UC) y se está desarrollando como proyecto real.

Tiene dos públicos:
- Usuarios de la Clínica Jurídica: personas sin formación jurídica, muchas
  veces vulnerables, que entran desde el celular. Lenguaje simple.
- Estudiantes de la Clínica: asisten casos y necesitan normas, tablas y detalle técnico.

## Equipo
Somos estudiantes de Derecho y no programamos. Por eso:
- Explica cada cambio en lenguaje simple antes de hacerlo.
- Haz cambios pequeños y de a uno. No modifiques cosas que no se pidieron.
- Si algo es ambiguo, pregunta antes de cambiarlo.

## Tecnología
- HTML, CSS y JavaScript simples, sin frameworks, sin dependencias y sin paso de compilación.
- Debe seguir funcionando al abrir index.html directamente en el navegador.
- Se publica con GitHub Pages desde la rama main.
- No agregues librerías, frameworks ni herramientas nuevas sin consultarlo.

## Estructura
- index.html: el contenido del sitio. Cada sección es un <section class="pantalla">
  y se navega con atributos data-ir.
- estilos.css: los estilos (colores, tipografía, diseño). index.html lo carga
  en el <head>.
- codigo.js: el código (navegación, calculadora, valor de la UTM, listas de
  bienes y documentos). index.html lo carga al final del <body>.
- asistente.css y asistente.js: el chat SIILV-I.A (burbuja abajo a la derecha).
  Responde en el navegador, sin IA ni servidores. Su configuración está en
  ASISTENTE_CONFIG, al comienzo de asistente.js. Sus respuestas fijas repiten
  datos de la guía (exenciones, tramos, recargos, costos, descuentos, plazos,
  documentos y su propia lista de bienes): si cambian en la guía, hay que
  cambiarlos también ahí. El chat calcula con una sola UTM (la de la línea
  `var UTM`); la calculadora, con la del mes del fallecimiento: para un mismo
  caso pueden dar montos algo distintos.
- En index.html, después del pie de página: la burbuja del chat y dos bloques
  ocultos que solo lee el chat: siaInfoExtra (respuestas que la Clínica agrega
  a mano; se ve en el código fuente, no poner datos personales) y
  siaDictamenes (dictámenes del SII sobre la Ley 16.271; no editar a mano).
- .github/: la tarea automática de GitHub que cada día (5:00 UTC) busca
  dictámenes nuevos en el SII y los agrega a siaDictamenes con un commit.
  Se puede correr a mano en la pestaña Actions del repositorio.
- Portada: el banner de arriba es un carrusel de 3 diapositivas (calculadora,
  simulador y chat SIILV-I.A), cada una con su color. Avanza sola cada 6
  segundos (SEGUNDOS_POR_SLIDE en codigo.js, "Carrusel de la portada") y
  tiene botón de pausa. Sus textos describen el simulador y el chat: si
  cambian, revisarlos.
- img/: logos.
- Secciones principales: inicio, menu-usuario, menu-estudiante, viaje, cadena,
  parentesco, calculadora, cero, costos, descuentos, dudas-usuario, dos-utm,
  tablas, ordenes, bienes, formulario, conceptos, trampas, documentos,
  que-entra (con ilustraciones), guias (descarga los PDF de pdf/) y
  privacidad (qué guarda la página: si cambia lo que guarda el chat, la
  calculadora o la lista de documentos, hay que cambiarlo ahí también).
- pdf/: las cuatro guías en PDF que enlaza la sección guias. Las hizo Antonio
  (29-10-2026) y traen sus propios montos con la UTM de octubre de 2026: no se
  actualizan solas.
- Listas de bienes (BIENES) y documentos (DOCS, ordenados por etapa) en
  codigo.js. index.html tiene una copia ya pintada de las dos como respaldo:
  si se cambia una lista, actualizar también esa copia. Las casillas marcadas
  de documentos se guardan en el navegador con la clave docsHerencia3; si
  cambia el orden o la cantidad de documentos, cambiar la clave.
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

## Calculadora
- Está en codigo.js, en calculadoraSIIMPLE. Una sola función, calcular(),
  produce todo lo que se ve (veredicto, esquema de pasos, tabla de la familia,
  casilla del Registro Civil y plazos), para que no puedan diferir.
- Calcula a toda la familia (Código Civil, arts. 988 a 992) y dice qué casilla
  marcar: exentas todas, afectas algunas o afectas todas.
- Se detiene y deriva a la Clínica con testamento, representación,
  transmisión, sobrinos sin hermanos vivos, bienes en el extranjero,
  donaciones previas, repudio o cesión, y avisa cuando el parentesco elegido
  no hereda.
- window.SIIMPLE_CALC expone la misma lógica para pruebas.
- Después de cambiarla, probar (testamento = No en todos):
| Caso | Datos | Debe decir |
|---|---|---|
| A | Hijo · 15-03-2025 · ¿hijo murió antes? No · cónyuge Sí · 3 hijos · $80.000.000 | Tu parte no paga; hijos $16.000.000 y cónyuge $32.000.000; Exentas todas |
| B | Hijo · 10-10-2026 · cónyuge No · 1 hijo · $50.000.000 | Paga 0,93 UTM; Afectas todas |
| C | Hijo · 15-03-2025 · cónyuge Sí · 3 hijos · $200.000.000 | Tu parte no paga, el cónyuge paga 5,76 UTM; Afectas algunas, con aviso "Ojo" |
| D | Hermano · 01-06-2024 · nadie antes · 1 hermano carnal (tú) y 1 medio hermano · $30.000.000 | Tú 2,93 UTM; medio hermano 1,10 UTM |
| E | Padre, madre o abuelo · dejó hijos: Sí | No eres heredero |
| F | Testamento: Sí | La guía no cubre herencias con testamento |
| G | Hijo · 01-05-2016 · UTM manual 45.000 · cónyuge No · 1 hijo · $100.000.000 | 26,16 UTM y aviso de más de ocho años |
| H | "Heredo en lugar de mi padre o madre…" | Este caso necesita revisión |

## Asistente SIILV-I.A: cómo responde y cómo probarlo
Orden en que busca la respuesta (en asistente.js, función responder):
1. Botones y conversaciones guiadas ("Revisar mi caso", "Guiar Formulario 4412").
2. siaInfoExtra: lo que agrega la Clínica a mano (formato explicado en el propio bloque).
3. Preguntas por dictámenes ("¿hay dictámenes sobre…?").
4. Cálculos de impuesto y repartos (art. 988) con montos.
5. Dónde se declara cada bien (lista BIENES).
6. Temas frecuentes (lista TEMAS).
7. Texto de la guía y diccionario (los <details> de la sección conceptos).
8. Dictámenes que calcen con la pregunta.
9. Si nada calza, lo dice y ofrece la Clínica (no inventa).
Los enlaces [texto](#id) del chat abren secciones de la guía: si se cambia el
id de una sección, hay que cambiarlo también en asistente.js.

Después de cambiar el asistente, abrir la burbuja y probar:
| Pregunta | Debe responder |
|---|---|
| hola | Saludo con botones |
| Botón "Revisar mi caso" | 5 preguntas y resumen Qué tienes listo / Qué te falta / Próximo paso |
| Soy hijo y me tocan 50 millones, ¿cuánto pago? | Exención de 600 UTM, tramo de 1%, ≈ $65.400 (con la UTM de noviembre de 2026) |
| herencia de 80 millones, cónyuge y 3 hijos | $16.000.000 por hijo y $32.000.000 al cónyuge, exentos |
| ¿dónde declaro el auto? | Categoría Vehículos, código SII y tasación |
| ¿qué es la nuda propiedad? | Cita del diccionario |
| ¿Hay dictámenes sobre sepulturas? | Oficio 1126 de 2026 |
| ¿se paga impuesto por el seguro de vida? | Oficios 1229 y 186 de 2023 |
| Mi RUT es 12.345.678-9 | Advertencia de no compartir datos |
| ¿qué tiempo hará mañana? | Que no puede ayudar y ofrece la Clínica |
| ¿tengo que declarar si no pago? | Art. 60 (se da por cumplida si todas son exentas) y certificado del SII |
| ¿qué gastos puedo descontar? | Art. 4 de la Ley 16.271 (no el art. 959 del Código Civil) |
| ¿dónde declaro las cañerías? | Instalaciones fijas, dentro del bien raíz |
Revisar también que en el celular la ventana ocupe toda la pantalla.

## Contenido jurídico: reglas estrictas
- NO cambies montos, exenciones, tasas, tramos, deducciones, recargos,
  artículos citados ni reglas de reparto sin aprobación explícita del equipo.
  Toda modificación de fondo pasa por revisión de un profesor.
- Normas base: Ley 16.271 (para el impuesto, los descuentos son los de su
  art. 4) y Código Civil (arts. 959, 988 a 992, 688). También se citan la
  Ley 20.830 (acuerdo de unión civil), la Ley 19.903 (arancel del Registro
  Civil) y el Código Tributario (art. 200, prescripción).
- Si detectas un posible error jurídico, avísalo; no lo corrijas por tu cuenta.
- Mantén siempre los avisos de que la guía es orientación, no asesoría legal,
  y de que no es un sitio oficial del SII.

## Datos que cambian
- Valor de la UTM usado: $72.440 (noviembre de 2026). Cambia cada mes.
- La UTM, su mes y su año se definen en un solo lugar: la línea
  `var UTM = {valor: ..., mes: ..., anio: ...};` al comienzo
  de codigo.js. Al actualizarla, cambia solo esa línea (y el valor de arriba).
- Desde ahí se escriben solos en todo el sitio el mes, el valor, los montos
  en pesos, los links a la tabla UTM del SII, la calculadora y el chat
  (asistente.js la lee de window.UTM_GUIA).
- Marcas en el HTML:
  - data-utm="mes": el mes y el año.
  - data-utm="valor": el valor de la UTM.
  - data-utm="link": link a la tabla UTM del SII.
  - data-utm-por="N": N UTM convertidas a pesos.
  - data-redondeo="M": redondea ese monto al múltiplo de M.
- El texto escrito en el HTML es solo un respaldo. Todo monto nuevo en pesos
  que dependa de la UTM debe llevar data-utm-por, o no se actualizará.
- La calculadora usa además una tabla con la UTM de cada mes desde enero de
  2019 (`UTM_MENSUAL`, dentro de calculadoraSIIMPLE en codigo.js): mide la
  exención y los tramos con la UTM del mes del fallecimiento, y pasa el
  impuesto a pesos con la UTM del mes en curso (según la fecha del
  computador). La línea `var UTM = ...` se escribe sola en esa tabla, pero no
  queda guardada: cada mes, al actualizar la línea, agrega también ese valor
  a la tabla, en su año y mes.

## Estilo
- Español de Chile, tono claro y cercano en la ruta del usuario,
  técnico pero legible en la del estudiante.
- Debe verse bien en celular.
- Cuida la accesibilidad: contraste, textos alternativos y navegación con teclado.

## Pendientes conocidos
- Verificar antes de publicar (vienen de la versión 3 de Antonio):
  - Rol del fallo de la Corte Suprema de 2025 sobre sobrinos (sección ordenes).
  - Rol del fallo de la C.A. de Temuco de junio de 2026 y si fue confirmado (costos).
  - Fuente de la recomendación de la Defensoría del Contribuyente (cero).
  - Regla del 100% de la sociedad conyugal en el F4412: no se comprobó en una
    sesión real del formulario (cadena, formulario, trampas, diccionario, chat).
  - Mención a la porción conyugal en la cita del art. 4 (descuentos, diccionario).
  - En tablas, la rebaja por discapacidad no dice desde cuándo rige
    (1-3-2020) ni su tope de 8.000 UF, que la calculadora sí indica.
  - Contenido de las guías 1, 2 y 4 en PDF.
- Chat: a "¿tengo que declarar si no pago?" agrega un dictamen sobre
  impuesto territorial que no viene al caso (busca por palabras parecidas).
- Definir identidad visual propia (hoy se parece al portal del SII).
- Autorización de la UC para usar su marca.