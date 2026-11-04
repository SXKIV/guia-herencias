# Simulador de declaración para SIIMPLE

Esta carpeta trae el simulador del formulario de herencias del SII, ya con el
diseño de la guía, e instrucciones para que Claude Code lo agregue al sitio.

## Cómo usarlo

1. Descomprime esta carpeta **dentro** del proyecto `guia-herencias`, de modo que
   quede `guia-herencias/integrar-simulador/`.
2. Abre el proyecto en VS Code y abre Claude Code.
3. Escríbele:

   > Lee integrar-simulador/INSTRUCCIONES-PARA-CLAUDE.md y aplícalo paso a paso,
   > explicándome cada cambio antes de hacerlo.

4. Cuando termine, pídele que haga las pruebas de la tabla "Pruebas después de
   integrar", o hazlas tú abriendo `index.html` en el navegador.
5. Si todo está bien, la carpeta `integrar-simulador/` se puede borrar: los
   archivos que el sitio usa ya quedaron copiados en la raíz.

## Qué hay adentro

- `simulador.js` y `simulador.css`: el simulador.
- `seccion-simulador.html`: la sección que se pega en `index.html`.
- `INSTRUCCIONES-PARA-CLAUDE.md`: los pasos, las pruebas y lo que no se debe tocar.

## Para tener en cuenta

- El simulador cubre herencias **testadas e intestadas**, aunque la guía hoy
  explica solo las intestadas. En la pantalla inicial se aclara qué cubre la guía.
- Los casos de ejemplo usan personas y RUT inventados.
- El código del formulario del SII confirma la regla de la sociedad conyugal
  que aparece como pendiente en `CLAUDE.md`: al elegir "Sociedad Conyugal", el
  formulario muestra este aviso: "Recuerde que el valor que declare respecto a
  los bienes debe ser por el total (sin considerar las divisiones que
  correspondan por la Sociedad Conyugal). El Formulario automáticamente hará los
  cálculos que procedan."
