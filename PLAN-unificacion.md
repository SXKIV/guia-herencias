# Plan: una sola guía para todo público

Estado: **en curso**. Hecho: pasos 1, 2 y 3 (11-11-2026) y 4, 5, 6 y 7 (12-11-2026).
Objetivo: eliminar la separación entre «usuario que hace el trámite» y
«estudiante», y dejar una sola ruta, en lenguaje simple, para cualquier persona.

Fuera de este plan (son otros cambios ya decididos, se harán cuando el equipo
los pida): quitar las menciones a la Clínica Jurídica y ampliar SIIMPLE a otros
trámites tributarios. Tampoco se cambian montos, exenciones, tramos, recargos
ni artículos citados.

---

## 0. Antes de empezar: lo que falta

### 0.1 Las dos tablas de la V3.3 no llegaron

En el pedido quedaron dos marcadores sin reemplazar:
«[pegar la tabla «Menú único propuesto» de la V3.3]» y
«[pegar la tabla de títulos de la V3.3]». La V3.3 no está en el repositorio.
Los pasos 1 y 8 quedan **pendientes** hasta tenerlas. Mientras tanto, esto es
lo que hay hoy, para compararlo:

**Ítems de los dos menús actuales (todas las secciones a las que se llega desde ellos)**

| id | Menú usuario | Menú estudiante | Accesos rápidos (portada) |
|---|---|---|---|
| calculadora | Calcular si voy a pagar impuesto (destacado) | Calculadora de impuesto (destacado) | — |
| viaje | Etapas del trámite | — | Etapas del trámite |
| cadena | — | Cómo se encadenan los tres trámites | — |
| descuentos | Gastos que se pueden descontar | — | Gastos que se descuentan |
| parentesco | Parentesco y exenciones | — | Parentesco y exenciones |
| cero | Por qué ir al SII aunque no pagues | — | Por qué ir al SII aunque no pagues |
| que-entra | Qué entra a la herencia, con ilustraciones | Qué entra a la herencia y cómo se valora | Qué entra a la herencia |
| costos | Cuánto me va a costar todo esto | — | — |
| dos-utm | — | UTM del fallecimiento y UTM de la declaración | — |
| tablas | — | Tablas del impuesto | — |
| ordenes | — | Órdenes sucesorios y asignaciones | — |
| bienes | — | ¿Dónde declaro cada bien? | ¿Dónde declaro cada bien? |
| formulario | — | El formulario F4412, panel por panel | — |
| simulador | Practicar el formulario del SII en un simulador | Simulador del formulario F4412 | — |
| dudas-usuario | Dudas frecuentes | — | — |
| trampas | — | Errores frecuentes | — |
| guias | Guías en PDF para descargar | Guías en PDF para descargar | Guías en PDF |
| conceptos | Glosario | Glosario | — |

**Títulos (h1) actuales de esas secciones**

| id | Título hoy |
|---|---|
| viaje | Las etapas del trámite |
| cadena | Cómo se encadenan los tres trámites |
| parentesco | ¿Voy a tener que pagar impuesto? |
| calculadora | Calcular el impuesto |
| cero | Por qué ir al SII aunque no pagues impuesto |
| costos | Cuánto me va a costar todo esto |
| descuentos | ¿Qué gastos y deudas se descuentan? |
| dudas-usuario | Dudas frecuentes |
| dos-utm | UTM del fallecimiento y UTM de la declaración |
| tablas | Tablas del impuesto |
| ordenes | Quién hereda y cuánto le toca |
| bienes | ¿Dónde declaro cada bien? |
| formulario | Explicación del formulario en línea |
| conceptos | Glosario |
| trampas | Errores frecuentes |
| que-entra | Qué entra a la herencia y cómo se valora |
| guias | Guías para descargar |
| simulador | Simulador de declaración |

### 0.2 Decisiones del equipo (11-11-2026)

| N.º | Tema | Decisión |
|---|---|---|
| 1 | Dónde va el menú único | Sección nueva «Guía» (id `guia`), con ítem en el menú superior y botón en la portada en lugar de los dos botones de ruta |
| 2 | Ids de las secciones | No se cambian; solo los títulos visibles. Anotado en CLAUDE.md |
| 3 | Glosario | Abre siempre en «Esenciales»; se mantienen los dos botones |
| 4 | Barra de arriba | Solo el botón «‹ Volver» |
| 5 | Nosotros y primera diapositiva | Quitar «Entrar como usuario» y «Entrar como estudiante»; las dos líneas pasan a una: «Para todos: lenguaje simple, con normas y tablas». El resto del texto temporal no se toca |
| 6 | Aprobación del texto del régimen | Basta el visto bueno del equipo |
| 7 | Redacción de la sociedad conyugal | Las tres versiones (etapas, parentesco, órdenes) se quedan como están, cada una adecuada a su sección. Revisar más adelante con comentarios de usuarios. Anotado en CLAUDE.md |
| 8 | Cuántos regímenes | Cuatro en el texto nuevo (incluye el acuerdo de unión civil) |
| 9 | Cajón «La mitad de los gananciales» | Aprobado: «En sociedad conyugal, la mitad de los gananciales que es del cónyuge sobreviviente» |
| 10 | Entrada del glosario | Definición corta con enlace a «Qué entra a la herencia» |
| 11 | Regla del 100% en el F4412 | Solo en formulario y errores frecuentes, con enlace desde que-entra; se quita de cadena |
| 12 | Textos con «estudiante» | Se aplican las dos propuestas del paso 9 |

Además, el equipo aprobó la salida intermedia para el régimen (paso 6b) y el
texto del apartado nuevo (paso 6a), que está al final de este plan.

### 0.3 Propuesta de menú y títulos (en lugar de las tablas de la V3.3)

Aprobada por el equipo (11-11-2026). Una sola tabla: el orden en el menú «Guía» y un
nombre único por sección, que se usará igual en el menú, en el título (h1) y
en los demás botones y enlaces que lleven a ella. El id no cambia (decisión 2).

| Orden | id | Nombre (menú y título) | Título hoy |
|---|---|---|---|
| Destacado | calculadora | Calcular el impuesto | (igual) |
| 1 | viaje | Etapas del trámite | Las etapas del trámite |
| 2 | conceptos | Glosario | (igual) |
| 3 | que-entra | Qué entra a la herencia y cómo se valora | (igual) |
| 4 | bienes | ¿Dónde declaro cada bien? | (igual) |
| 5 | descuentos | ¿Qué gastos y deudas se descuentan? | (igual) |
| 6 | ordenes | Quién hereda y cuánto le toca | (igual) |
| 7 | parentesco | Parentesco y exenciones | ¿Voy a tener que pagar impuesto? |
| 8 | tablas | Tablas del impuesto | (igual) |
| 9 | dos-utm | UTM del fallecimiento y UTM de la declaración | (igual) |
| 10 | cero | Por qué ir al SII aunque no pagues impuesto | (igual) |
| 11 | formulario | Explicación del formulario en línea (F4412) (cambiado a pedido del equipo, 11-11-2026) | Explicación del formulario en línea |
| 12 | simulador | Simulador de declaración | (igual) |
| 13 | costos | Costos del trámite | Cuánto me va a costar todo esto |
| 14 | trampas | Errores frecuentes | (igual) |
| 15 | dudas-usuario | Dudas frecuentes | (igual) |
| 16 | guias | Guías para descargar | (igual) |

No van en el menú «Guía»: inicio, privacidad y nosotros (tienen su propio
acceso) ni cadena (se fusiona con viaje en el paso 7).

---

## Los pasos

Cada paso es un cambio pequeño, se prueba abriendo index.html en el navegador
(computador y celular) y se guarda con su propio commit. Ningún paso deja un
botón que lleve a una sección que no existe.

### Paso 1. Crear el menú único — HECHO (11-11-2026)
Aplicado con el orden y los nombres de la tabla 0.3: sección `guia` antes de
menu-usuario e ítem «Guía» en el menú superior, entre «Inicio» y «Nosotros».
Mientras no se haga el paso 4, la barra de arriba dice «Haciendo el trámite»
al entrar desde «Guía».
- index.html: nueva sección `<section class="pantalla" id="guia">` (o donde
  decida la pregunta 1) con los ítems en el orden de la V3.3, usando el mismo
  diseño de los menús actuales (`.destacado` para la calculadora, `.menu` e
  `.item` para lo demás). Texto de la bajada en lenguaje simple, sin hablar de
  usuarios ni estudiantes.
- Menú superior: agregar el ítem que lleve a ese menú.
- Todavía no se borra nada: los menús viejos siguen funcionando.
- Probar: cada botón del menú nuevo abre su sección; «Volver» regresa al menú;
  en el celular el menú se ve completo. Calculadora (casos A a H) sin cambios.
- Commit: «Unificación 1: menú único».

### Paso 2. Portada: quitar los dos botones de ruta — HECHO (11-11-2026)
Aplicado: en lugar de los dos botones hay uno solo, «Entrar a la guía», que
abre la sección `guia`. La fila azul pasó de 3 a 2 columnas (en el celular,
una debajo de la otra). De `.puerta` solo se borró la regla del color de la
etiqueta «Estudiante»; las demás las usa el botón nuevo.
- index.html: borrar los dos botones `.puerta` («Usuario de la clínica
  jurídica» y «Estudiante de la clínica jurídica») y poner en su lugar un botón
  al menú único (si se aprueba la pregunta 1).
- Borrar la nota «Si no encuentras lo que buscas en tu apartado, entra igual al
  otro…», pero **mantener** su segunda frase («Esta guía es material de
  orientación y no reemplaza la asesoría de un abogado…»), que es un aviso
  obligatorio.
- estilos.css: borrar las reglas `.puerta` que queden sin uso; revisar que la
  fila azul de la portada no quede descuadrada.
- Probar: portada en computador y celular; navegación con teclado (Tab).
- Commit: «Unificación 2: portada sin rutas».

### Paso 3. Menú superior: quitar «Hago el trámite» y «Estudiantes» — HECHO (11-11-2026)
Aplicado: el menú superior queda Inicio, Guía, Nosotros, Glosario, Simulador
y Calculadora. Las secciones menu-usuario y menu-estudiante siguen existiendo
(se llega a ellas desde nosotros) hasta el paso 4; mientras estén abiertas,
ningún ítem del menú superior aparece marcado.
- index.html, líneas 61 y 62 (eran la 62 y la 63): borrar esos dos ítems.
- Probar: menú del celular (botón «Menú») y del computador.
- Commit: «Unificación 3: menú superior».

### Paso 4. Borrar las secciones menu-usuario y menu-estudiante — HECHO (12-11-2026)
Aplicado: se borraron las dos secciones y los botones «Entrar como usuario» y
«Entrar como estudiante» de nosotros. En la primera diapositiva, las dos
líneas quedaron en una: «Para todos · Lenguaje simple, con normas y tablas».
La barra de arriba muestra solo «‹ Volver» y el glosario abre siempre en
«Esenciales». Se quitaron `rutaElegida`, el texto de la barra (`rutaActual`,
`.ruta-actual`) y `--ruta`. Las direcciones viejas `#menu-usuario` y
`#menu-estudiante` abren el menú «Guía» (única mención que queda de esos ids,
en `pantallaDeLaDireccion`, codigo.js).
Primero se quitan los enlaces que llevan a ellas y después las secciones.
- index.html: quitar los botones «Entrar como usuario» y «Entrar como
  estudiante» de nosotros y las líneas de la primera diapositiva (según la
  pregunta 5).
- index.html: borrar `<section id="menu-usuario">` y `<section id="menu-estudiante">`.
- codigo.js, función `mostrar`: quitar `rutaElegida` y lo que depende de él
  (color de la ruta, texto de la barra, filtro del glosario), según las
  preguntas 3 y 4. Quitar `--ruta` de estilos.css si queda sin uso.
- Si alguien tenía guardado `index.html#menu-usuario`, la página ya abre la
  portada sola (eso hace hoy con cualquier dirección que no existe). Si se
  aprueba la pregunta 1, se puede hacer que esas dos direcciones abran el menú
  único (dos líneas en codigo.js).
- Probar: buscar en los cuatro archivos que no quede `menu-usuario` ni
  `menu-estudiante`; glosario abre en «Esenciales»; barra «Volver» funciona.
- Commit: «Unificación 4: una sola ruta».

### Paso 5. Tabla de exenciones solo en «Parentesco y exenciones» — HECHO (12-11-2026)
Aplicado: en tablas, «Tabla 1» conserva su título, el párrafo, la fórmula y
el párrafo de las 50 y 5 UTA; la tabla y su nota se cambiaron por el botón
«Ver la tabla de exenciones», que abre parentesco. El chat ya enlazaba la
exención a `#parentesco`, y el carrusel no enlaza a tablas ni a parentesco:
no hubo que cambiarlos.
- index.html, sección tablas, «Tabla 1. Exención según parentesco»: borrar la
  tabla (7 filas) y su nota de la UTM, y poner un enlace a la tabla de
  parentesco. Se **mantienen** el párrafo de que la exención se resta antes de
  la tasa, la fórmula «Base imponible = asignación en UTM − exención» y el
  párrafo de las 50 y 5 UTA (no están en parentesco).
- No se tocan los montos en prosa de cero, dudas frecuentes, dos-utm y
  glosario: no son tablas.
- Probar: el enlace abre parentesco; los montos en pesos de la tabla de
  parentesco siguen cambiando con la UTM.
- Commit: «Unificación 5: tabla de exenciones en un solo lugar».

### Paso 6. Régimen matrimonial explicado una sola vez, en «Qué entra a la herencia» — HECHO (12-11-2026)
Aplicado en tres commits. 6a: apartado con el texto aprobado después de la
caja de normas de «Cuatro cajones», con `id="regimen-matrimonial"` en su h2;
«ver la explicación del formulario» es un botón a formulario. Después se
agregó `data-apartado`: un botón con data-ir="que-entra" y
data-apartado="regimen-matrimonial" baja directo al apartado (codigo.js), y
en el chat se escribe [texto](#que-entra#regimen-matrimonial). 6b: «Más detalle: el régimen matrimonial» al final de viaje (Paso
1, después de su caja de normas), parentesco («Cuarto») y ordenes («Antes de
repartir»); en cadena se quitó la viñeta y «Dos reglas de valorización» pasó
a «Una regla». 6c: el glosario quedó con dos frases tomadas del texto
aprobado y el botón «Ver el detalle en «Qué entra a la herencia»»; el chat
enlaza `[Qué entra a la herencia: el régimen matrimonial](#que-entra)`. El
carrusel no enlaza a ninguna de estas secciones. También se aplicó la
decisión 9: el cajón dice «En sociedad conyugal, la mitad de los gananciales
que es del cónyuge sobreviviente».
Se divide en tres commits para poder revisar el texto jurídico solo.
- **6a.** que-entra: agregar un apartado nuevo, después de «Cuatro cajones»,
  con el texto unificado (ver Análisis del punto 3, que lista qué debe incluir)
  y un `id` propio para enlazarlo. **Requiere aprobación del texto antes del
  commit.** Commit: «Unificación 6a: régimen matrimonial en qué entra».
- **6b.** Según la decisión 7, las explicaciones de viaje (Paso 1),
  parentesco («Cuarto») y ordenes («Antes de repartir») **no se cambian**: a
  cada una solo se le agrega al final un enlace «Más detalle: el régimen
  matrimonial» hacia el apartado nuevo. Se quita únicamente la viñeta de
  cadena (Etapa 1), que repite a viaje. Commit: «Unificación 6b: enlaces al
  régimen».
- **6c.** Glosario y chat: dejar la entrada del glosario como definición corta
  con enlace (según lo que decida el equipo, ver análisis), y en asistente.js
  cambiar `[Parentesco y régimen](#parentesco)` por un enlace a que-entra.
  Commit: «Unificación 6c: glosario y chat».
- Probar: cada enlace abre que-entra; preguntar al chat «¿qué pasa si estaba
  casado en sociedad conyugal?» y revisar el enlace; calculadora casos A y C.

### Paso 7. «Cómo se encadenan» dentro de «Etapas del trámite» — HECHO (12-11-2026)
Aplicado en dos commits. 7a: al final de cada Paso de viaje, un `<details>`
con el texto de cadena sin cambios: «Más detalle: el formulario y su
inventario» (Paso 1), «Más detalle: cómo se construye el F4412» (Paso 2, sin
la nota «Ojo», según la decisión 11) y «Más detalle: las tres inscripciones
del art. 688» (Paso 3, con la caja de normas completa, que suma el art. 30
bis). La tabla «Resumen del encadenamiento» va después del aviso «Si te
quedaste en el paso 1», con `id="resumen-encadenamiento"` en su h2. 7b: se
borró el botón a cadena del Paso 3 (el contenido ya está en la misma página);
en el chat, `[Ver la cadena de trámites](#cadena)` pasó a
`[Ver las etapas del trámite](#viaje)` y en la respuesta de etapas se quitó
`[Cómo se encadenan](#cadena)` (ya tenía `[Ver etapas](#viaje)`). Se borró la
sección y `#cadena` abre viaje (`pantallaDeLaDireccion`, codigo.js). El
carrusel no enlazaba a cadena ni a viaje.
- **7a.** viaje: agregar, en cada Paso, un desplegable «Más detalle» (el mismo
  `<details>` que ya usan dudas frecuentes y errores frecuentes) con lo que
  solo está en cadena (ver análisis). Al final, la tabla «Resumen del
  encadenamiento». Commit: «Unificación 7a: detalle de la cadena en etapas».
- **7b.** Cambiar los enlaces a `cadena`: el botón del Paso 3 de viaje y dos
  respuestas de asistente.js (líneas 337 y 373). Borrar la sección cadena.
  Hacer que la dirección vieja `#cadena` abra viaje (dos líneas en codigo.js).
  Commit: «Unificación 7b: quitar la sección cadena».
- Probar: los desplegables se abren con teclado; viaje se lee bien en el
  celular; chat: «¿qué hago después del SII?» y «¿cuáles son las etapas?».

### Paso 8. Igualar los títulos con el menú (PENDIENTE: tabla de la V3.3)
- index.html: cambiar los `<h1>` según la tabla, y los textos de los botones
  que llevan a esas secciones (accesos rápidos, menú único, nosotros, botones
  dentro de otras secciones) para que digan lo mismo.
- asistente.js: igualar el texto de los enlaces que nombran secciones (por
  ejemplo `[Etapas del trámite](#viaje)`, `[Dudas frecuentes](#dudas-usuario)`).
- El título de la pestaña del navegador se arma solo desde el `<h1>`.
- Commit: «Unificación 8: títulos iguales al menú».

### Paso 9. Textos que todavía hablan de «estudiante» o de rutas
- viaje, Paso 2: el botón al formulario dice «En la ruta del estudiante».
  Propuesta: «Paso a paso, con cada pantalla».
- ordenes, «Nota para el estudiante» (línea 980). Propuesta: «Nota técnica».
- Commit: «Unificación 9: textos sin rutas».

### Paso 10. Revisión final de enlaces (chat y carrusel)
- Buscar en index.html, codigo.js, asistente.js y simulador.js todos los
  `data-ir` y los `(#id)` del chat, y comprobar que cada uno corresponde a una
  sección que existe. Ojo: si un enlace del chat apunta a una sección que no
  existe, no da error, se convierte en texto sin enlace; por eso hay que
  buscarlos a mano.
- Carrusel: hoy enlaza a nosotros, calculadora y simulador, que no cambian;
  revisar sus textos si la V3.3 cambia algún título.
- Probar la tabla completa del chat del CLAUDE.md y los casos A a H.
- Commit solo si hubo que corregir algo.

### Paso 11. Actualizar el CLAUDE.md
- «Qué es este proyecto»: un solo público, en lenguaje simple.
- «Hacia dónde va el proyecto»: marcar la ruta única como hecha.
- «Estructura», lista de secciones: quitar menu-usuario, menu-estudiante y
  cadena; agregar el menú único; decir que el régimen matrimonial está en
  que-entra y la tabla de exenciones en parentesco, y que hay que enlazarlos
  en vez de repetirlos.
- «Estilo»: reemplazar «tono cercano en la ruta del usuario, técnico en la
  del estudiante» por una regla única (por ejemplo: lenguaje simple arriba y
  el detalle técnico en desplegables).
- «Pendientes conocidos»: actualizar la lista de secciones donde aparece la
  regla del 100% de la sociedad conyugal (cadena ya no existe).
- Borrar este PLAN-unificacion.md (queda en el historial de git).
- Commit: «Unificación 11: CLAUDE.md».

---

## Análisis del punto 3: qué se repite y qué se podría perder

Resumen: **si se sigue el plan, no se pierde contenido jurídico**, pero hay
frases y artículos que hoy están en un solo lugar y hay que trasladarlos a
mano. Abajo están listados. También hay pequeñas diferencias de redacción
entre las versiones que el equipo debe resolver (no las corrijo yo).

### A. Régimen matrimonial: hoy está explicado en 6 lugares

| Dónde | Qué dice | Qué tiene que **solo está ahí** |
|---|---|---|
| viaje, Paso 1 (líneas 368 a 375) | Los 4 regímenes en lenguaje simple | «después de las recompensas»; «Revisa las instrucciones vigentes del formulario del Registro Civil para saber cómo anotarlos»; cita del **art. 1774** del Código Civil |
| cadena, Etapa 1 (línea 412) | Sociedad conyugal y gananciales, resumidos | Nada nuevo (repite viaje) |
| cadena, Etapa 2, nota «Ojo» (línea 420) | Regla del 100% en el F4412 | Nada nuevo (repite formulario y errores frecuentes) |
| parentesco, «Cuarto» (líneas 489 a 497) | Los 4 regímenes, en lenguaje simple | «Si no sabes cuál tenía la persona fallecida, revisa la libreta de matrimonio…» |
| ordenes, «Antes de repartir» (líneas 945 a 954) | Los 4 regímenes, versión técnica (la más completa) | «haber social», «corresponde liquidarla», «a falta de bienes propios relevantes»; el crédito se calcula «comparando el patrimonio final e inicial»; párrafo de que este paso es previo al reparto y que el cónyuge hereda además como heredero; citas de los **arts. 1718, 1720 y 1725 y siguientes** y de la **Ley 19.335** |
| glosario, «Régimen matrimonial y qué entra a la herencia» (líneas 1368 a 1379) | Los 3 regímenes más el AUC | El **ejemplo de los 200 millones**; el párrafo «En los formularios hay que distinguir» (Registro Civil vs. F4412, y que el F4412 tiene líneas para el crédito de participación) |

Además mencionan el régimen, pero por otro motivo, y **se quedan donde están**:
- formulario (línea 1074): el estado civil y la regla del 100% al llenar el F4412.
- errores frecuentes (líneas 1415 a 1418): el error de usar la misma regla en
  los dos formularios.
- que-entra, cajón «No es parte de la herencia» (línea 1486): «La mitad de los
  gananciales que es del cónyuge sobreviviente».
- asistente.js, respuesta `regimen` (línea 389): el chat tiene su propia
  respuesta y enlaza a parentesco; hay que cambiar el enlace a que-entra.

**Qué tendría que traer el apartado unificado en que-entra** para no perder
nada: los cuatro regímenes (sociedad conyugal, participación en los
gananciales, separación total y acuerdo de unión civil) con las precisiones de
ordenes (recompensas, bienes propios, crédito que no es la mitad), la
sugerencia de la libreta de matrimonio, el ejemplo de los 200 millones, la
frase de que primero se separa la parte del cónyuge y después se reparte, una
línea sobre cómo se anota en cada formulario con enlace a formulario, y una
sola caja de normas con todas las citas: Código Civil arts. 1718, 1720, 1725 y
siguientes, 1774 y 1792-1 y siguientes (Ley 19.335), y Ley 20.830, art. 15.
Para que se lea simple, la parte técnica puede ir en un desplegable.

**Diferencias entre versiones que el equipo debe decidir** (posibles
imprecisiones, no las corrijo):
1. Sociedad conyugal: viaje dice «en general, por mitades, después de las
   recompensas»; parentesco dice «la mitad del patrimonio común corresponde al
   cónyuge» sin mencionar recompensas; ordenes dice «a falta de bienes propios
   relevantes… se estima que la mitad». Hay que elegir una redacción.
2. El glosario dice «Hay tres posibilidades» y después agrega el acuerdo de
   unión civil aparte; las demás versiones hablan de cuatro.
3. El cajón de que-entra «La mitad de los gananciales que es del cónyuge
   sobreviviente» solo es exacto en sociedad conyugal: en participación en los
   gananciales no hay una mitad, sino un crédito. Conviene revisarlo cuando se
   escriba el apartado nuevo, que va justo debajo.
4. Glosario: el chat responde las preguntas de diccionario leyendo el glosario
   (paso 7 de su orden de búsqueda). Si la entrada se acorta, el chat sigue
   respondiendo sobre el régimen con su propia respuesta `regimen` (paso 6,
   que va antes), así que no se pierde la respuesta. Propuesta: dejar en el
   glosario una definición de dos líneas con enlace. ¿Lo aprueban, o prefieren
   que el glosario conserve la versión técnica completa (sería una repetición
   aceptada)?
5. Regla del 100% en el F4412: hoy aparece en cadena, formulario, errores
   frecuentes, glosario y chat, y sigue sin comprobarse (está en Pendientes).
   Propuesta: dejarla en formulario y errores frecuentes, con una línea y
   enlace desde que-entra; se quita de cadena al fusionarla con viaje.

### B. «Cómo se encadenan» dentro de «Etapas del trámite»

| Párrafo de cadena | ¿Está ya en viaje? | Qué hacer |
|---|---|---|
| Bajada («cada una produce un documento que la siguiente exige») | Sí, casi igual en la bajada de viaje | No se traslada |
| Etapa 1: los tres bloques del formulario del Registro Civil y los recuadros del inventario (bienes raíces, vehículos, menaje, etc.) | No | Trasladar al desplegable del Paso 1 |
| Etapa 1: valores a la fecha del fallecimiento | Sí (Paso 1) | No se traslada |
| Etapa 1: régimen matrimonial | Sí | Va a que-entra (paso 6) |
| Etapa 1: exentas o afectas y art. 60 | Sí («Antes de empezar» y Paso 2) | No se traslada |
| Etapa 2: F4412 desde noviembre de 2021, reemplazó a los formularios 4423 y 4419; el F4423 trasladaba los totales del inventario | No | Trasladar al desplegable del Paso 2 |
| Etapa 2: si el inventario quedó mal armado, el error se arrastra al SII | No | Trasladar (es útil para todos) |
| Etapa 2: lo que agrega el SII (reparto por órdenes, exención, tramos, recargo, créditos, giro) | En parte («el sistema calcula el impuesto») | Trasladar la lista |
| Etapa 2: nota «Ojo» de la sociedad conyugal | Sí, en formulario y errores frecuentes | No se traslada; enlace a formulario |
| Etapa 3: el art. 688 explicado (posesión legal desde la muerte; las tres inscripciones; Registro Nacional si es administrativa, Conservador si es judicial; todos los Conservadores si el inmueble está en más de un territorio; «de consuno» y «por sí solo») | Solo resumido en el Paso 3 | Trasladar completo al desplegable del Paso 3 |
| Etapa 3: por qué algunos trámites quedan detenidos (posesión inscrita pero sin partición) | No | Trasladar |
| Etapa 3: caja de normas, arts. 686 a 688 del Código Civil y el texto del art. 54 de la Ley 16.271 | viaje cita «art. 688; Ley 16.271, arts. 30 bis y 54», sin el contenido | Trasladar la caja completa (sumando el art. 30 bis que ya está en viaje) |
| Tabla «Resumen del encadenamiento» | En parte (el mapa de viaje dice qué sale de cada paso) | Trasladar: agrega «qué se entrega» y «para qué sirve después» |

Con esto, cadena no pierde nada: todo lo que no está ya en viaje se mueve a
viaje, y lo repetido se quita.

### C. Tabla de exenciones

Hoy está dos veces, con los mismos datos: en parentesco («Segundo: qué es una
exención») y en tablas («Tabla 1»). Se queda en parentesco. De tablas **no se
borra** la explicación de que la exención se resta antes de la tasa, la
fórmula de la base imponible ni el párrafo de las 50 y 5 UTA, porque solo
están ahí. La nota sobre la UTM del fallecimiento de tablas está también, más
completa, en parentesco. No se pierde nada.

Los montos de exención que aparecen en frases (cero, dudas frecuentes,
dos-utm, glosario, carrusel) no son tablas y no se tocan.

---

## Texto aprobado para el paso 6a (11-11-2026)

Va en que-entra, después de «Cuatro cajones». «(causante)» se agrega solo la
primera vez que aparece «persona fallecida».

> **Si la persona estaba casada o tenía acuerdo de unión civil**
>
> Antes de repartir la herencia, hay que separar lo que era solo de la persona fallecida (causante) de lo que le corresponde a su pareja. Eso depende del régimen de bienes. Si no sabes cuál tenían, revisa la libreta de matrimonio o pregunta a quien te está asistiendo.
>
> - **Sociedad conyugal.** Se forma un haber social único. Al disolverse por la muerte, corresponde liquidarla: en la práctica, y a falta de bienes propios relevantes de cada cónyuge, se estima que la mitad del haber social pertenece al cónyuge sobreviviente por gananciales, y la otra mitad, sumada a los bienes propios de la persona fallecida, forma la herencia.
> - **Participación en los gananciales.** Durante el matrimonio cada cónyuge administra su propio patrimonio por separado, sin masa común. Al disolverse el régimen por la muerte, el cónyuge que obtuvo menos gananciales tiene un crédito de participación en contra del otro patrimonio, que se calcula comparando el patrimonio final e inicial de cada uno. **No es automáticamente la mitad:** depende de cuánto ganó cada uno durante el matrimonio.
> - **Separación total de bienes.** No hay masa común que liquidar. Los bienes que estaban a nombre de la persona fallecida forman íntegramente la herencia, y los que estaban a nombre del cónyuge sobreviviente son solo suyos.
> - **Acuerdo de unión civil.** Por regla general cada conviviente conserva lo suyo. Solo si al celebrarlo pactaron comunidad, los bienes adquiridos a título oneroso durante el acuerdo se consideran de ambos por mitades.
>
> *Ejemplo:* con sociedad conyugal y un patrimonio común de 200 millones, 100 son del cónyuge sobreviviente por gananciales y 100 forman la herencia sobre la que se calculan las asignaciones.
>
> Este paso es previo al reparto: solo la porción que corresponde a la persona fallecida entra a la masa que se divide entre sus herederos, incluido su cónyuge en su calidad de heredero.
>
> **En los formularios:** en el inventario del Registro Civil se anota la parte que corresponde a la herencia; revisa las instrucciones vigentes de ese formulario. En el F4412 del SII la regla es distinta: [ver la explicación del formulario].
>
> *Normas:* Código Civil, arts. 1718 y 1725 y siguientes (sociedad conyugal), 1774 (división de los gananciales por mitad), 1720 (separación de bienes) y 1792-1 y siguientes, introducidos por la Ley 19.335 (participación en los gananciales); Ley 20.830, art. 15 (acuerdo de unión civil).
