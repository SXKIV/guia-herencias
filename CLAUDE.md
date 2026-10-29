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
- img/: logos.
- Secciones principales: inicio, menu-usuario, menu-estudiante, viaje, cadena,
  parentesco, calculadora, cero, costos, descuentos, dudas-usuario, dos-utm,
  tablas, ordenes, bienes, formulario, conceptos, trampas, documentos.

## Contenido jurídico: reglas estrictas
- NO cambies montos, exenciones, tasas, tramos, deducciones, recargos,
  artículos citados ni reglas de reparto sin aprobación explícita del equipo.
  Toda modificación de fondo pasa por revisión de un profesor.
- Normas base: Ley 16.271 y Código Civil (arts. 959, 988 a 992, 688).
- Si detectas un posible error jurídico, avísalo; no lo corrijas por tu cuenta.
- Mantén siempre los avisos de que la guía es orientación, no asesoría legal,
  y de que no es un sitio oficial del SII.

## Datos que cambian
- Valor de la UTM usado: $71.721 (septiembre de 2026). Cambia cada mes.
- La UTM, su mes y su año se definen en un solo lugar: la línea
  `var UTM = {valor: ..., mes: ..., anio: ...};` al comienzo del <script>
  de index.html. Al actualizarla, cambia solo esa línea (y el valor de arriba).
- Desde ahí se escriben solos en todo el sitio el mes, el valor, los montos
  en pesos, los links a la tabla UTM del SII y la calculadora.
- Marcas en el HTML:
  - data-utm="mes": el mes y el año.
  - data-utm="valor": el valor de la UTM.
  - data-utm="link": link a la tabla UTM del SII.
  - data-utm-por="N": N UTM convertidas a pesos.
  - data-redondeo="M": redondea ese monto al múltiplo de M.
- El texto escrito en el HTML es solo un respaldo. Todo monto nuevo en pesos
  que dependa de la UTM debe llevar data-utm-por, o no se actualizará.

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