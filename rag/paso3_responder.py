# -*- coding: utf-8 -*-
"""
PASO 3 — El RAG completo, para probarlo antes de ponerlo en el sitio
Es el paso 4 del kit del optativo, con las instrucciones de SIILV-I.A:
busca los pedazos de oficios y normas que tienen que ver con la pregunta
y, con esos y solo con esos, arma la respuesta.

Esto todavia NO esta conectado al chat del sitio. Sirve para que el
equipo pruebe preguntas reales y para que el profesor revise las
respuestas (quedan guardadas en rag/sesiones/).

En VS Code: abre este archivo, aprieta ▶ y escribe las preguntas en la
Terminal de abajo. /salir para terminar.
Tambien se puede hacer una sola pregunta:
  python rag/paso3_responder.py "¿se paga impuesto por el seguro de vida?"
"""

# ============================================================
#  ZONA EDITABLE
# ============================================================

CUANTOS_PEDAZOS = 6     # cuantos pedazos se le pasan a Gemini

PROMPT_RESPONDER = """
Eres SIILV-I.A, el asistente de SIIMPLE, una guía para declarar el impuesto
a las herencias intestadas ante el Servicio de Impuestos Internos (SII) de Chile.

Quien pregunta puede no tener formación jurídica: usa español de Chile, frases
cortas y lenguaje simple. Si usas un término técnico, explícalo en pocas palabras.

Responde usando ÚNICAMENTE los fragmentos que se entregan más abajo (oficios del
SII y artículos de ley). Si no alcanzan para responder, dilo derechamente:
"No encuentro eso en los oficios y normas que tengo", y sugiere revisar la
sección «Dónde pedir ayuda» de la guía. Nunca completes con lo que sepas por
fuera de los fragmentos.

Al final de cada afirmación, indica entre paréntesis de dónde salió, tal como
viene en el encabezado del fragmento (por ejemplo: Oficio N° 1126 de 2026, o
Ley 16.271, art. 46 bis).

Los oficios del SII responden consultas de casos concretos: preséntalos como el
criterio del SII, no como una regla obligatoria para todos los casos.

No calcules montos de impuesto ni repartos de la herencia: para eso, indica que
use la calculadora de la guía.

No pidas ni repitas datos personales (RUT, claves, números de cuenta).

Termina siempre con esta frase: "Esto es orientación general, no asesoría legal
ni información oficial del SII."
"""

TEMPERATURA = 0

# Si esta en True, ademas de los pedazos se le pasa a Gemini la lista de
# oficios del chat (numero, fecha y tema) como "mapa": sirve para preguntas
# como "¿cuantos oficios hay de 2026?". Es la "tabla" del kit.
USAR_TABLA = True

# ============================================================
#  DE AQUI HACIA ABAJO NO SE TOCA
# ============================================================

import os
import sys
from datetime import datetime

import modelo
import paso1_corpus
import paso2_indexar

AQUI = os.path.dirname(os.path.abspath(__file__))
CARPETA_SESIONES = os.path.join(AQUI, "sesiones")


def cargar():
    fragmentos = paso2_indexar.cargar_indice()
    if fragmentos is None:
        print("\nNo hay indice, o se hizo con otro modelo. Corre paso2_indexar.py y vuelve aca.\n")
        raise SystemExit(1)
    return fragmentos


def tabla_como_texto():
    filas = paso1_corpus.leer_tabla()
    return "\n".join("- Oficio N° %s, de %s: %s" % (d["oficio"], d.get("fecha", d["anio"]), d.get("resumen", ""))
                     for d in filas)


def buscar(pregunta, fragmentos):
    vector = modelo.vectorizar([pregunta], es_pregunta=True)[0]
    puntajes = [(modelo.parecido(vector, f["vector"]), f) for f in fragmentos]
    puntajes.sort(key=lambda par: par[0], reverse=True)
    return puntajes[:CUANTOS_PEDAZOS]


def armar_prompt(pregunta, encontrados, tabla=None):
    mapa = ""
    if tabla:
        mapa = ("\n\nLISTA DE OFICIOS DEL SII QUE CONOCE LA GUIA (sirve para contar o saber cuales\n"
                "existen; para decir QUE dicen, cita siempre los fragmentos):\n" + tabla)
    contexto = "\n\n".join("--- fragmento %d ---\n%s" % (i, f["texto"])
                           for i, (_, f) in enumerate(encontrados, start=1))
    return (PROMPT_RESPONDER.strip() + mapa + "\n\nFRAGMENTOS:\n" + contexto
            + "\n\nPREGUNTA:\n" + pregunta)


def responder(pregunta, encontrados, tabla=None):
    return modelo.preguntar(armar_prompt(pregunta, encontrados, tabla), TEMPERATURA).strip()


def guardar(conversacion):
    os.makedirs(CARPETA_SESIONES, exist_ok=True)
    nombre = "rag-%s.txt" % datetime.now().strftime("%Y-%m-%d-%H%M%S")
    with open(os.path.join(CARPETA_SESIONES, nombre), "w", encoding="utf-8") as f:
        f.write("SESION DEL %s\n" % datetime.now().strftime("%d-%m-%Y %H:%M"))
        f.write("=" * 60 + "\n\nINSTRUCCIONES USADAS:\n" + PROMPT_RESPONDER.strip() + "\n")
        f.write("\nmodelo: %s | vectores: %s (%d) | pedazos por pregunta: %d | temperatura: %s | tabla: %s\n"
                % (modelo.MODELO_GEMINI, modelo.MODELO_EMBEDDINGS, modelo.DIMENSIONES,
                   CUANTOS_PEDAZOS, TEMPERATURA, "si" if USAR_TABLA else "no"))
        f.write("=" * 60 + "\n")
        for i, turno in enumerate(conversacion, start=1):
            f.write("\nPREGUNTA %d: %s\n\nRESPUESTA:\n%s\n\nPEDAZOS QUE USO:\n"
                    % (i, turno["pregunta"], turno["respuesta"]))
            for puntaje, fr in turno["fragmentos"]:
                f.write("  [%.3f] %s | %s\n     %s\n" % (puntaje, fr["cita"], fr["seccion"], fr["texto"]))
            f.write("\nREVISION (la completa quien revisa): correcta / incompleta / incorrecta. Comentario:\n")
            f.write("-" * 50 + "\n")
    return nombre


def una_pregunta(pregunta, fragmentos, tabla, conversacion):
    print("buscando...", flush=True)
    encontrados = buscar(pregunta, fragmentos)
    print("\n" + "-" * 60)
    print("LOS %d PEDAZOS QUE VA A USAR:" % len(encontrados))
    print("-" * 60)
    for puesto, (puntaje, f) in enumerate(encontrados, start=1):
        print("%d. parecido %.3f | %s | %s" % (puesto, puntaje, f["cita"], f["seccion"]))
    print("\npensando...", flush=True)
    respuesta = responder(pregunta, encontrados, tabla)
    print("\n" + "-" * 60 + "\nRESPUESTA:\n" + "-" * 60)
    print(respuesta)
    print("-" * 60)
    conversacion.append({"pregunta": pregunta, "respuesta": respuesta, "fragmentos": encontrados})


def main():
    modelo.comprobar()
    fragmentos = cargar()
    tabla = tabla_como_texto() if USAR_TABLA else None
    conversacion = []

    preguntas_dadas = [a for a in sys.argv[1:] if not a.startswith("--")]
    if preguntas_dadas:
        for p in preguntas_dadas:
            print("\nPregunta: " + p)
            una_pregunta(p, fragmentos, tabla, conversacion)
    else:
        print("\n" + "=" * 60)
        print("PASO 3 - SIILV-I.A CON GEMINI (prueba)")
        print("=" * 60)
        print("\nIndice: %d pedazos. A cada pregunta se le pasan los %d mas parecidos."
              % (len(fragmentos), CUANTOS_PEDAZOS))
        print("\nPARA EMPEZAR, prueba estas (copia y pega cada linea):\n")
        print("¿Se paga impuesto a la herencia por los derechos de sepultura?")
        print("¿El seguro de vida que cobra un heredero paga impuesto a las herencias?")
        print("¿Puedo rectificar el formulario 4412 si aparecen bienes nuevos?")
        print("¿Cuantos oficios sobre herencias publico el SII en 2026?")
        print("¿Que tiempo hara mañana?   (debe decir que no lo encuentra)")
        print("\n/salir para terminar.")
        print("=" * 60)
        while True:
            try:
                pregunta = input("\nPregunta: ").strip()
            except (EOFError, KeyboardInterrupt):
                break
            if not pregunta:
                continue
            if pregunta.lower() in ("/salir", "salir"):
                break
            una_pregunta(pregunta, fragmentos, tabla, conversacion)

    if conversacion:
        nombre = guardar(conversacion)
        print("\nQuedo guardado en rag/sesiones/%s" % nombre)
        print("Trae cada respuesta con los pedazos exactos que uso, y un espacio")
        print("para que quien revise anote si esta correcta.\n")


if __name__ == "__main__":
    modelo.correr(main)
