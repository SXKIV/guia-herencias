# RAG de SIILV-I.A — etapas 1 y 2

Esta carpeta adapta a SIIMPLE el kit del RAG que hicimos en el optativo
*Fundamentos de la Inteligencia Artificial para la Práctica Legal*. La lógica es la misma:
**reunir los textos → cortarlos en pedazos → convertirlos en números → buscar los
pedazos más parecidos a la pregunta → que Gemini responda solo con esos pedazos.**

Por ahora es un laboratorio: **no toca el sitio ni el chat publicado.** Sirve para que el
equipo pruebe preguntas reales y para que un profesor revise las respuestas antes de
conectarlo a SIILV-I.A (etapas 3 y 4).

## Qué hay aquí

| Archivo | Equivale en el kit a | Qué hace | ¿Usa la API? |
|---|---|---|---|
| `paso1_corpus.py` | la carpeta `txt/sentencias` | Baja el texto completo de los oficios del SII que ya conoce el chat, más la Ley 19.903 y el DS 237 de 2004; saca la Ley 16.271 vigente del PDF de BCN (que se baja a mano) | No (gratis) |
| `paso2_indexar.py` | `paso3_indexar.py` | Corta las normas **por artículo** y los oficios **por sección**, y los convierte en vectores | Sí, solo lo nuevo |
| `paso3_responder.py` | `paso4_responder.py` | Chat de prueba en la Terminal, con las instrucciones de SIILV-I.A | Sí |
| `modelo.py` | `modelo.py` | Habla con Gemini. Lee la clave de `GEMINI_API_KEY` o de `rag/clave.txt` | — |
| `txt/oficios/`, `txt/normas/` | `txt/sentencias/` | El corpus en texto, con una ficha arriba de cada archivo | — |

**La "tabla" del curso ya existe:** es la lista de oficios del chat (bloque `siaDictamenes`
de `index.html`, que la tarea automática actualiza cada día). Sabe *qué hay*; los vectores
saben *qué dice* cada oficio. `paso3_responder.py` usa las dos.

## Preparar VS Code (una vez)

1. Instala la extensión **Python** de Microsoft (Ctrl + Shift + X → buscar "Python").
2. **Archivo → Abrir carpeta…** y elige la carpeta del proyecto `guia-herencias`.
3. Crea el archivo `rag/clave.txt` con una sola línea:
   ```
   GEMINI_API_KEY=tu-clave-de-aistudio.google.com
   ```
   Ese archivo está en `.gitignore`: **no se sube a GitHub**. No pongas la clave en
   ningún otro archivo.
4. Para leer los PDF (las normas y los oficios desde 2019 vienen en PDF):
   abre la Terminal (Ctrl + ñ, o menú **Terminal → Nueva terminal**) y escribe
   ```
   pip install pypdf
   ```

## Cómo se corre

Abre el archivo y aprieta el **▶** de arriba a la derecha. Las preguntas del paso 3 se
escriben en la **Terminal** de abajo.

1. **`paso1_corpus.py`.** La primera vez baja los ~140 oficios (tarda unos minutos: espera
   un segundo entre descargas para no cargar al SII). Después solo baja los nuevos.
   - Abre dos o tres archivos de `rag/txt/oficios/` y revisa que esté el texto completo
     (antecedentes, análisis y conclusión), no solo el resumen.
   - Si algún oficio no se pudo bajar, queda en `rag/txt/oficios/FALTAN.md` con
     instrucciones: se baja el PDF a mano desde el SII, se guarda en `rag/pdfs/oficios/`
     con el nombre indicado (por ejemplo `2026-802.pdf`) y se vuelve a correr el paso 1.
   - Si faltan **todos** los de 2019 en adelante, el SII cambió dónde los publica. En la
     Terminal: `python rag/paso1_corpus.py --diagnostico 2026` muestra lo que entrega
     el SII; mándale ese resultado a quien mantenga el código.
2. **`paso2_indexar.py`.** Primero conviene correrlo gratis, sin la API, para mirar el corte:
   `python rag/paso2_indexar.py --solo-cortar`. Después, con ▶, hace los vectores
   (unos minutos con el plan gratis; si dice que espera, espera).
3. **`paso3_responder.py`.** Haz preguntas reales. Al salir (`/salir`), la sesión queda en
   `rag/sesiones/` con cada respuesta, los pedazos exactos que usó y un espacio para que
   quien revise anote si está correcta. Esas sesiones **no se suben a GitHub** (podrían
   traer datos de personas); se comparten a mano con el profesor.

## Normas que no se bajan solas

El Código Civil (arts. 959, 988 a 992, 688), la Ley 20.830 y otras se agregan a mano:
crea un `.txt` en `rag/txt/normas/` que empiece con esta ficha y pega debajo el texto
oficial copiado de [leychile.cl](https://www.bcn.cl/leychile):

```
======================================================================
NORMA   : Código Civil
Cita    : Código Civil
Fuente  : https://www.bcn.cl/leychile/navegar?idNorma=...
======================================================================

Art. 959. ...
```

El paso 2 corta por artículo. Reconoce "Artículo 5º.-" (formato del SII) y "Art. 5.º" o
"Art. 959." (formato de BCN y del Código Civil), siempre al comienzo de una línea y con
mayúscula. Si no encuentra ninguno, lo avisa y corta la norma por párrafos. Los artículos
que solo dicen "DEROGADO" se saltan.

### La Ley 16.271 viene de BCN

El PDF del SII de la Ley 16.271 está desactualizado: llega solo a la Ley 21.210 (2020),
no incluye la Ley 21.420 (4 de febrero de 2022, que cambió los arts. 17, 20, 54 y 70) y
mantiene la letra g) antigua del art. 46, que la Ley 19.903 reemplazó en 2003. Por eso
la ley se saca del PDF de BCN, revisado por el equipo:

1. En [leychile.cl](https://www.bcn.cl/leychile/navegar?idNorma=172986) abre el
   **DFL 1 de 2000 del Ministerio de Justicia** (la Ley 16.271 está en su art. 8º, junto
   con el Código Civil y otras leyes) y descarga el PDF de la versión vigente.
2. Guárdalo como `rag/pdfs/normas/dfl1_2000_bcn.pdf`. Esa carpeta no se sube a GitHub;
   el texto que se saca de él sí.
3. Corre el paso 1. Saca solo la Ley 16.271, le quita los encabezados de página (con el
   aviso de la firma electrónica), las notas al margen y las notas de BCN, y anota en la
   ficha la versión y el código de validación de la firma. Si el PDF es más nuevo que
   `ley_16271.txt`, lo vuelve a sacar solo.
4. Antes de subirlo, compara el texto nuevo con el anterior (en VS Code, el panel de
   control de código muestra qué cambió) y revisa los cambios con un profesor.

El texto actual es la versión del DFL del 28-08-2025. Esa es la fecha de la última
modificación del DFL completo (Ley 21.756); según BCN, la última que tocó la Ley 16.271
es la 21.420.

### La Ley 19.903 y el DS 237 vienen del SII

Están como Anexos 4 y 5 en el mismo PDF del SII de la Ley 16.271. El paso 1 los guarda en
`ley_19903.txt` y `ds_237_2004.txt`. Del resto de ese PDF no se guarda nada (su texto de
la ley, las NOTAS y los anexos 1 a 3: índice, exenciones de otras leyes y una tabla de
cálculo que puede estar desactualizada). No tienen cambios posteriores a 2020, así que la
versión del SII sirve.

## Qué falta (etapas 3 y 4)

3. Que la tarea automática de GitHub corra el paso 1 y el paso 2 cada día, con la clave
   guardada como "secreto" del repositorio.
4. El intermediario (la versión web del paso 3, donde vive la clave) y la conexión con
   `asistente.js`: los pasos 1 a 6 del chat siguen locales (cálculos, botones, bienes) y
   Gemini reemplaza los pasos 7 a 9.

Nada de esto se publica en el chat sin la revisión de un profesor (ver CLAUDE.md,
"Contenido jurídico").
