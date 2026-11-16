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
| `paso1_corpus.py` | la carpeta `txt/sentencias` | Baja el texto completo de los oficios del SII que ya conoce el chat, más la Ley 16.271 | No (gratis) |
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
4. Solo si el SII publica algún oficio o norma en PDF (la Ley 16.271 viene en PDF):
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

El paso 2 corta por "Artículo N.-". Si la norma usa "Art. N." en vez de "Artículo", el
paso 2 lo avisa y la corta por párrafos.

**Ojo con la Ley 16.271:** se baja del PDF del SII, que dice estar actualizado a la
Ley 21.210 (2020). Antes de usarla en el sitio, hay que confirmar con un profesor que
no haya cambios posteriores (comparar con leychile.cl).

## Qué falta (etapas 3 y 4)

3. Que la tarea automática de GitHub corra el paso 1 y el paso 2 cada día, con la clave
   guardada como "secreto" del repositorio.
4. El intermediario (la versión web del paso 3, donde vive la clave) y la conexión con
   `asistente.js`: los pasos 1 a 6 del chat siguen locales (cálculos, botones, bienes) y
   Gemini reemplaza los pasos 7 a 9.

Nada de esto se publica en el chat sin la revisión de un profesor (ver CLAUDE.md,
"Contenido jurídico").
