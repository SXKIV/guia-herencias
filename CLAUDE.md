# Guía del impuesto a las herencias intestadas

## Qué es este proyecto
Sitio web de orientación para declarar el impuesto a las herencias intestadas
ante el SII, después de la posesión efectiva. Nació en el curso Diseño Legal
(Derecho UC) y se está desarrollando como proyecto real.

Tiene un solo público y una sola ruta: cualquier persona, sepa o no de la
materia. Muchas no tienen formación jurídica, son vulnerables o entran desde
el celular, por eso se escribe en lenguaje simple. El detalle técnico
(normas, tablas, notas) está en la misma guía para quien lo necesite, sin
estorbar a quien no.

## Hacia dónde va el proyecto (decidido por el equipo)
Hecho:
- Una sola ruta para todos (12-11-2026). Ya no existe la separación entre
  "usuario que hace el trámite" y "estudiante": hay un solo menú, «Guía».
- Abierto a todas las personas (12-11-2026, Tarea 9). El sitio ya no se
  presenta como material de la Clínica Jurídica ni para sus usuarios. La
  Clínica sigue como una opción de ayuda gratuita: cuando la guía, la
  calculadora o el chat derivan un caso, dicen «Revísalo con un abogado o la
  Clínica Jurídica Derecho UC» (adaptando el verbo) y enlazan a la sección
  «Dónde pedir ayuda» (ayuda), que reúne a todas las instituciones.

Pendiente (se hará más adelante):
- SIIMPLE abarcará todos los trámites tributarios, ante el SII o en otros
  ámbitos, no solo el impuesto a las herencias.
Mientras tanto:
- No hagas este cambio por tu cuenta: se hará cuando el equipo lo pida.
- Lo nuevo, escríbelo para cualquier persona, en lenguaje simple. No
  presentes el sitio como hecho para la Clínica: nómbrala solo como opción
  de ayuda, con la frase de arriba.
- Los textos de la presentación del carrusel (última diapositiva) y de la
  sección nosotros son temporales hasta que se haga este cambio.

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
- codigo.js: el código (navegación, calculadora, valor de la UTM, lista de
  bienes). index.html lo carga al final del <body>.
- asistente.css y asistente.js: el chat SIILV-I.A (burbuja abajo a la derecha).
  Responde en el navegador, sin IA ni servidores. Su configuración está en
  ASISTENTE_CONFIG, al comienzo de asistente.js. Sus respuestas fijas repiten
  datos de la guía (exenciones, tramos, recargos, costos, descuentos, plazos,
  la línea de Etapas sobre documentos, su propia lista de bienes y, en
  contactoMd y la respuesta sin-abogado, a quién recurrir según el caso):
  si cambian en la guía, hay que cambiarlos también ahí. El chat calcula con una sola UTM (la de la línea
  `var UTM`); la calculadora, con la del mes del fallecimiento: para un mismo
  caso pueden dar montos algo distintos.
- En index.html, después del pie de página: la burbuja del chat y dos bloques
  ocultos que solo lee el chat: siaInfoExtra (respuestas que el equipo agrega
  a mano; se ve en el código fuente, no poner datos personales) y
  siaDictamenes (dictámenes del SII sobre la Ley 16.271; no editar a mano).
- .github/: la tarea automática de GitHub que cada día (5:00 UTC) busca
  dictámenes nuevos en el SII y los agrega a siaDictamenes con un commit.
  Se puede correr a mano en la pestaña Actions del repositorio.
- Portada (12-11-2026): el banner de arriba es un carrusel de 5
  diapositivas, cada una con su color:
  1. «Alguien falleció sin dejar testamento: ¿por dónde empiezo?» (azul
     oscuro, clases s-intro y s-empezar; «¿por dónde empiezo?» va en el
     amarillo suave de la diapositiva 5): tarjeta con tres acciones numeradas
     (calcular si hay que pagar impuesto, ver las etapas del trámite y
     preguntarle al asistente) y la línea «¿Hay testamento u otro caso
     especial? Ver dónde pedir ayuda». Dura 10 segundos.
  2. Calculadora (celeste). 3. Simulador (naranjo). 4. Chat SIILV-I.A
     (verde). 5. Presentación de SIIMPLE (amarillo, clase s-nosotros).
     Cada una dura 6 segundos.
  - La duración general está en SEGUNDOS_POR_SLIDE (codigo.js, "Carrusel
    de la portada"); una diapositiva con data-segundos="N" en index.html
    dura N segundos.
  - La diapositiva con la clase s-intro es la de fondo oscuro: con ella,
    las flechas y los puntos se ven en blanco.
  - Avanza solo al abrir la página y tiene botón de pausa. Se detiene con
    el mouse encima o al navegar con el teclado dentro, y no avanza solo
    si la persona pidió reducir las animaciones en su computador o celular.
  - Sus textos describen el simulador y el chat: si cambian, revisarlos.
  - Los botones con data-abrir-chat abren la burbuja del chat.
- img/: logos.
- Secciones principales: inicio, guia (el menú único «Guía»: se llega desde
  el menú superior y el botón «Entrar a la guía» de la portada; si se agrega
  o renombra una sección, revisar este menú), viaje,
  parentesco, calculadora, cero, costos, descuentos, dudas-usuario, dos-utm,
  tablas, ordenes, bienes, formulario, conceptos, trampas,
  que-entra (con ilustraciones), guias (descarga los PDF de pdf/),
  ayuda (ver más abajo) y privacidad (qué guarda la página: si cambia lo que guarda el chat, la
  calculadora o el simulador, hay que cambiarlo ahí también) y
  nosotros (qué es el proyecto, herramientas y equipo; se llega desde la
  última diapositiva del carrusel).
- Secciones que ya no existen: menu-usuario y menu-estudiante (se
  reemplazaron por guia) y cadena (su contenido está en viaje, en los
  desplegables «Más detalle» de cada Paso y en la tabla «Resumen del
  encadenamiento»). Las direcciones viejas (index.html#cadena, etc.) abren
  guia o viaje (`pantallaDeLaDireccion`, codigo.js). No volver a enlazarlas.
- Cada tema se explica en un solo lugar y desde las demás secciones se
  enlaza, en vez de repetirlo:
  - Régimen matrimonial: en que-entra, apartado `id="regimen-matrimonial"`.
    Viaje, parentesco, ordenes y el glosario dan una versión corta y
    enlazan ahí (ver «Pendientes conocidos»).
  - Tabla de exenciones por parentesco: solo en parentesco. Tablas la
    enlaza con el botón «Ver la tabla de exenciones».
- «Dónde pedir ayuda» (sección ayuda, 12-11-2026): tabla «Según lo que te
  pasa» (qué caso va a qué institución) y una tarjeta por institución: SII,
  Registro Civil, Corporación de Asistencia Judicial, Defensoría del
  Contribuyente, clínicas jurídicas y Clínica Jurídica Derecho UC.
  - Solo enlaces a sitios oficiales (sii.cl, registrocivil.cl y fichas de
    ChileAtiende), sin teléfonos: los números del SII no coinciden entre sus
    propias páginas. El único teléfono es el de la Clínica.
  - Se llega desde el menú «Guía», el pie («¿Necesitas ayuda?»), el botón
    «Hablar con una persona» del chat y los enlaces «Ver dónde pedir ayuda»
    de las derivaciones (en la guía, en la calculadora con VER_AYUDA de
    codigo.js y en el chat).
  - Los datos de la Clínica (formulario y correo) están también en
    ASISTENTE_CONFIG.contacto (asistente.js): si cambian, cambiarlos en ambos.
- Los id de las secciones (por ejemplo dudas-usuario o viaje) no se cambian
  aunque cambie el título visible de la sección (decisión del equipo,
  11-11-2026): los usan los enlaces data-ir, los enlaces del chat en
  asistente.js y las direcciones que las personas guardan
  (index.html#calculadora). Para renombrar una sección, cambiar solo su <h1>
  y el texto de los botones que llevan a ella.
- pdf/: las cuatro guías en PDF que enlaza la sección guias. Las hizo Antonio
  (29-10-2026) y traen sus propios montos con la UTM de octubre de 2026: no se
  actualizan solas.
- Lista de bienes (BIENES) en codigo.js. index.html tiene una copia ya
  pintada como respaldo: si se cambia la lista, actualizar también esa copia.
- Documentos: el sitio ya no tiene una lista de documentos a reunir. En
  "Etapas del trámite" (viaje, Paso 2) dice que el SII no pide documentos
  para declarar, pero puede pedir antecedentes después para respaldar lo
  declarado; "Guarda esas boletas" sigue en descuentos. El chat repite eso
  (DOCUMENTOS, en asistente.js). La Guía 2 en PDF ("Documentos por etapa")
  sigue en la sección guias.
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
- Antecedentes en el historial de git (carpetas ya integradas y borradas):
  el paquete del asistente de Ryan (para-claude-code/, commit 2a9fa72) y el
  paquete del simulador de Joaquín (integrar-simulador/, commit 5d27dcd, con
  su LEEME y sus instrucciones). Se recuperan con
  `git checkout <commit> -- <carpeta>`.
- Respaldo de la sección «Documentos a reunir» (eliminada por decisión del
  grupo el 11-11-2026; se guarda para reutilizarla más adelante en otro lugar
  de la página). El commit 04ad93f es el último que la tiene completa. Partes:
  - index.html: `<section class="pantalla" id="documentos">` (con la copia ya
    pintada de la lista) y sus enlaces data-ir="documentos" (menú superior,
    accesos rápidos, menús de usuario y estudiante, botón "Ver qué documentos
    reunir" de la calculadora, tarjeta "Documentos y bienes" de nosotros), y
    la fila "Lista de documentos" de privacidad.
  - codigo.js: ETAPAS, la lista DOCS (17 documentos en 3 etapas), el código que
    la dibuja con casillas y barra de avance, y la clave docsHerencia3.
  - estilos.css: .check, .progreso, .barra y .etapa-docs.
  - asistente.js: botón "Lista de documentos" y la respuesta fija DOCUMENTOS.
  Para verla sin cambiar nada: `git show 04ad93f:index.html` (o codigo.js,
  etc.), o en GitHub: github.com/SXKIV/guia-herencias/blob/04ad93f/index.html.
  Al reutilizarla: no copiar los archivos enteros (borrarían cambios
  posteriores), sino solo esas partes; usar una clave nueva en vez de
  docsHerencia3 y volver a agregar la fila en privacidad.

## Calculadora
- Está en codigo.js, en calculadoraSIIMPLE. Una sola función, calcular(),
  produce todo lo que se ve (veredicto, esquema de pasos, tabla de la familia,
  casilla del Registro Civil y plazos), para que no puedan diferir.
- Calcula a toda la familia (Código Civil, arts. 988 a 992) y dice qué casilla
  marcar: exentas todas, afectas algunas o afectas todas.
- Se detiene con testamento, representación, transmisión, sobrinos sin
  hermanos vivos, bienes en el extranjero, donaciones previas, repudio o
  cesión, y deriva con «Revísalo con un abogado o la Clínica Jurídica
  Derecho UC» y el enlace «Ver dónde pedir ayuda» (VER_AYUDA). Hace lo mismo
  en el aviso de más de ocho años. Avisa cuando el parentesco elegido no
  hereda. El enlace va solo en el veredicto, no en el esquema de pasos (que
  muestra el mensaje como texto simple).
- window.SIIMPLE_CALC expone la misma lógica para pruebas.
- Después de cambiarla, probar (testamento = No en todos):
| Caso | Datos | Debe decir |
|---|---|---|
| A | Hijo · 15-03-2025 · ¿hijo murió antes? No · cónyuge Sí · 3 hijos · $80.000.000 | Tu parte no paga; hijos $16.000.000 y cónyuge $32.000.000; Exentas todas |
| B | Hijo · 10-10-2026 · cónyuge No · 1 hijo · $50.000.000 | Paga 0,93 UTM; Afectas todas |
| C | Hijo · 15-03-2025 · cónyuge Sí · 3 hijos · $200.000.000 | Tu parte no paga, el cónyuge paga 5,76 UTM; Afectas algunas, con aviso "Ojo" |
| D | Hermano · 01-06-2024 · nadie antes · 1 hermano carnal (tú) y 1 medio hermano · $30.000.000 | Tú 2,93 UTM; medio hermano 1,10 UTM |
| E | Padre, madre o abuelo · dejó hijos: Sí | No eres heredero |
| F | Testamento: Sí | La guía no cubre herencias con testamento; abogado o Clínica Jurídica Derecho UC y «Ver dónde pedir ayuda» |
| G | Hijo · 01-05-2016 · UTM manual 45.000 · cónyuge No · 1 hijo · $100.000.000 | 26,16 UTM y aviso de más de ocho años con «Ver dónde pedir ayuda» |
| H | "Heredo en lugar de mi padre o madre…" | Este caso necesita revisión; abogado o Clínica Jurídica Derecho UC y «Ver dónde pedir ayuda» |

## Asistente SIILV-I.A: cómo responde y cómo probarlo
Orden en que busca la respuesta (en asistente.js, función responder):
1. Botones y conversaciones guiadas ("Revisar mi caso", "Guiar Formulario 4412").
2. siaInfoExtra: lo que agrega el equipo a mano (formato explicado en el propio bloque).
3. Preguntas por dictámenes ("¿hay dictámenes sobre…?").
4. Cálculos de impuesto y repartos (art. 988) con montos.
5. Dónde se declara cada bien (lista BIENES).
6. Temas frecuentes (lista TEMAS). Gana el que más coincide; si empatan,
   el que está primero. Por eso sin-abogado («¿puedo hacerlo sin
   abogado?») va antes de persona («Hablar con una persona»), que también
   se activa con la palabra «abogado».
7. Texto de la guía y diccionario (los <details> de la sección conceptos).
8. Dictámenes que calcen con la pregunta.
9. Si nada calza, lo dice y ofrece el botón «Hablar con una persona» (no inventa).
Los enlaces [texto](#id) del chat abren secciones de la guía: si se cambia el
id de una sección, hay que cambiarlo también en asistente.js.
Para llevar a un apartado dentro de una sección (no solo a su comienzo):
- El título del apartado necesita un id propio, por ejemplo
  `<h2 id="regimen-matrimonial">` en que-entra.
- En index.html, el botón lleva además del data-ir la marca data-apartado:
  `data-ir="que-entra" data-apartado="regimen-matrimonial"`. La página abre la
  sección, baja hasta ese título y deja ahí el foco (codigo.js, apartadoPendiente).
- En el chat se escribe [texto](#que-entra#regimen-matrimonial).
- Si se cambia o borra el id del apartado, cambiarlo también en esos botones
  y en asistente.js. Si no, el enlace abre la sección desde arriba.
- Hoy lo usan los cuatro enlaces al régimen matrimonial (viaje, parentesco,
  ordenes y glosario) y la respuesta regimen del chat.

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
| ¿qué tiempo hará mañana? | Que no puede ayudar y ofrece el botón «Hablar con una persona» |
| Botón "Hablar con una persona" | A quién recurrir (SII, Registro Civil, Corporación de Asistencia Judicial y clínicas jurídicas, Defensoría del Contribuyente), formulario de la Clínica y «Ver dónde pedir ayuda» |
| ¿puedo hacerlo sin abogado? | Sin testamento, sí; con testamento, se necesita abogado; enlaces a Etapas del trámite y a Dónde pedir ayuda (texto revisado por un profesor, 12-11-2026) |
| tengo testamento | La guía no sirve para ese caso; abogado o Clínica Jurídica Derecho UC y «Ver dónde pedir ayuda» |
| ¿tengo que declarar si no pago? | Art. 60 (se da por cumplida si todas son exentas) y certificado del SII |
| ¿qué gastos puedo descontar? | Art. 4 de la Ley 16.271 (no el art. 959 del Código Civil) |
| ¿dónde declaro las cañerías? | Instalaciones fijas, dentro del bien raíz |
| ¿qué documentos necesito? | El SII no pide documentos para declarar, pero puede pedir antecedentes después; guardar boletas |
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
- Español de Chile, tono claro y cercano, para cualquier persona. Una sola
  regla: lenguaje simple arriba y el detalle técnico (normas, artículos,
  fórmulas) más abajo, en desplegables «Más detalle», cajas de normas o
  notas técnicas, para que quien no lo necesite pueda saltárselo.
- Normas y detalle técnico (12-11-2026): van plegados en
  `<details class="detalle-tecnico"><summary>Ver norma y detalle técnico</summary>…</details>`,
  cerrado por defecto (al imprimir se abre). A la vista queda la explicación
  simple con su ejemplo. Las citas cortas dentro de una frase, como
  «(art. 44)», se dejan donde están. Recuadro rojo (.aviso) solo para
  advertencias importantes (por ejemplo «Guarda esas boletas»). Ya aplicado
  en descuentos, cero, costos, dos-utm, tablas, bienes, viaje, ordenes,
  que-entra y conceptos (en el glosario, la norma va al final de cada
  entrada). El chat no trata ese desplegable como una entrada propia
  (asistente.js, construirIndice).
- Debe verse bien en celular.
- Cuida la accesibilidad: contraste, textos alternativos y navegación con teclado.

## Pendientes conocidos
- Verificar antes de publicar (vienen de la versión 3 de Antonio):
  - Rol del fallo de la Corte Suprema de 2025 sobre sobrinos (sección ordenes).
  - Rol del fallo de la C.A. de Temuco de junio de 2026 y si fue confirmado (costos).
  - Fuente de la recomendación de la Defensoría del Contribuyente (cero).
  - Regla del 100% de la sociedad conyugal en el F4412: no se comprobó en una
    sesión real del formulario (formulario, trampas y las respuestas regimen
    y trampas del chat; que-entra no la repite, enlaza a formulario).
    Evidencia a revisar: según el LEEME del paquete del simulador (commit
    5d27dcd), el código del F4412 muestra este aviso al elegir "Sociedad
    Conyugal": "Recuerde que el valor que declare respecto a los bienes debe
    ser por el total (sin considerar las divisiones que correspondan por la
    Sociedad Conyugal). El Formulario automáticamente hará los cálculos que
    procedan." Falta que el equipo o un profesor decidan si basta.
  - Mención a la porción conyugal en la cita del art. 4 (descuentos, diccionario).
  - En tablas, la rebaja por discapacidad no dice desde cuándo rige
    (1-3-2020) ni su tope de 8.000 UF, que la calculadora sí indica.
  - Contenido de las guías 1, 2 y 4 en PDF.
- Régimen matrimonial: la explicación completa está en Qué entra a la
  herencia (que-entra, apartado regimen-matrimonial). Además hay versiones
  cortas, con distinto detalle, en Etapas del trámite (Paso 1), Parentesco
  («Cuarto») y Quién hereda (órdenes, «Antes de repartir»), cada una con el
  enlace «Más detalle: el régimen matrimonial». El equipo decidió
  (11-11-2026) mantener esas tres, porque cada una da lo que esa sección
  necesita. Revisar con comentarios de usuarios si conviene dejar una sola.
  Si cambia algo de fondo, cambiarlo en que-entra, en las tres, en el
  glosario y en la respuesta regimen de asistente.js.
- Usar en el chat la información de ChileAtiende (idea del equipo,
  12-11-2026; por ver más adelante).
- Definir identidad visual propia (hoy se parece al portal del SII).
- Autorización de la UC para usar su marca.