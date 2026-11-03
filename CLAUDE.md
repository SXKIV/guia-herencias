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
- codigo.js: el código (navegación, calculadora, valor de la UTM). index.html lo
  carga al final del <body>.
- asistente.css y asistente.js: el chat SIILV-I.A (burbuja abajo a la derecha).
  Responde en el navegador, sin IA ni servidores. Su configuración está en
  ASISTENTE_CONFIG, al comienzo de asistente.js. Sus respuestas fijas repiten
  datos de la guía (exenciones, tramos, recargos, costos): si cambian en la
  guía, hay que cambiarlos también ahí.
- En index.html, después del pie de página: la burbuja del chat y dos bloques
  ocultos que solo lee el chat: siaInfoExtra (respuestas que la Clínica agrega
  a mano; se ve en el código fuente, no poner datos personales) y
  siaDictamenes (dictámenes del SII sobre la Ley 16.271; no editar a mano).
- .github/: la tarea automática de GitHub que cada día (5:00 UTC) busca
  dictámenes nuevos en el SII y los agrega a siaDictamenes con un commit.
  Se puede correr a mano en la pestaña Actions del repositorio.
- img/: logos.
- Secciones principales: inicio, menu-usuario, menu-estudiante, viaje, cadena,
  parentesco, calculadora, cero, costos, descuentos, dudas-usuario, dos-utm,
  tablas, ordenes, bienes, formulario, conceptos, trampas, documentos,
  que-entra (con ilustraciones), guias (descarga los PDF de pdf/) y
  privacidad (qué guarda la página: si cambia lo que guarda el chat, la
  calculadora o la lista de documentos, hay que cambiarlo ahí también).
- pdf/: las cuatro guías en PDF que enlaza la sección guias.

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
Revisar también que en el celular la ventana ocupe toda la pantalla.

## Contenido jurídico: reglas estrictas
- NO cambies montos, exenciones, tasas, tramos, deducciones, recargos,
  artículos citados ni reglas de reparto sin aprobación explícita del equipo.
  Toda modificación de fondo pasa por revisión de un profesor.
- Normas base: Ley 16.271 y Código Civil (arts. 959, 988 a 992, 688).
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
- Navegación con direcciones propias por sección (#calculadora) y botón atrás del navegador.
- Calculadora: indicar cuando el parentesco elegido no hereda en ese orden.
- Definir identidad visual propia (hoy se parece al portal del SII).
- Autorización de la UC para usar su marca.