# -*- coding: utf-8 -*-
"""
MODELO — la parte que habla con Gemini.
Es el mismo modelo.py del kit del optativo, con tres cambios:
  1. La clave se busca primero en la variable GEMINI_API_KEY (asi la
     podra usar la tarea automatica de GitHub) y despues en rag/clave.txt.
  2. Se saco el respaldo con OpenAI: los vectores de un modelo no se
     comparan con los de otro, y SIIMPLE no debe tener una segunda clave.
  3. Solo trabaja con Gemini.
Normalmente no hay que tocar este archivo.
"""

# ============================================================
#  ZONA EDITABLE
# ============================================================

MODELO_GEMINI = "gemini-3.6-flash"
MODELO_EMBEDDINGS = "gemini-embedding-001"

# Cuantos numeros tiene cada vector. Si lo cambias, hay que rehacer el
# indice (paso2_indexar.py lo nota solo y lo rehace).
DIMENSIONES = 768

# Segundos entre una llamada y la siguiente. El plan gratis deja unas
# 10 llamadas por minuto: si salen errores de "demasiadas peticiones",
# sube este numero.
SEGUNDOS_ENTRE_LLAMADAS = 5

# Los modelos nuevos de Gemini "piensan" antes de responder. Para
# responder con fragmentos no hace falta mucho.
PENSAMIENTO = "minimal"

# ============================================================
#  DE AQUI HACIA ABAJO NO SE TOCA
# ============================================================

import json
import os
import sys
import time
import urllib.error
import urllib.request

for _flujo in (sys.stdout, sys.stderr):
    try:
        _flujo.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

AQUI = os.path.dirname(os.path.abspath(__file__))
ARCHIVO_CLAVE = os.path.join(AQUI, "clave.txt")
NOMBRE_CLAVE = "GEMINI_API_KEY"
URL_GEMINI = "https://generativelanguage.googleapis.com/v1beta/models"
REINTENTOS = 4
ESPERA_RED = 180
_ultima_llamada = 0.0


def morir(mensaje):
    print("\n" + "!" * 60)
    print(mensaje)
    print("!" * 60 + "\n")
    sys.exit(1)


def leer_clave():
    clave = os.environ.get(NOMBRE_CLAVE, "").strip()
    if clave:
        return clave
    if not os.path.exists(ARCHIVO_CLAVE):
        morir("No encuentro la clave de Gemini.\n\n"
              "Crea el archivo rag/clave.txt con una sola linea:\n\n"
              "   GEMINI_API_KEY=tu-clave-aca\n\n"
              "La sacas en aistudio.google.com -> Get API key.\n"
              "Ese archivo NUNCA se sube a GitHub (esta en .gitignore).")
    with open(ARCHIVO_CLAVE, encoding="utf-8-sig", errors="replace") as f:
        for linea in f:
            linea = linea.strip()
            if linea.startswith(NOMBRE_CLAVE):
                clave = linea.split("=", 1)[-1].strip().strip('"').strip("'")
                if clave:
                    return clave
    morir("rag/clave.txt existe pero no tiene la clave.\n"
          "Tiene que quedar asi, sin comillas ni espacios:\n\n"
          "   GEMINI_API_KEY=AIza...........................")


def comprobar():
    """Se llama al empezar cada programa: revisa la clave antes de nada."""
    leer_clave()


class ErrorDeApi(Exception):
    def __init__(s, codigo, detalle):
        s.codigo, s.detalle = codigo, detalle
        Exception.__init__(s, "HTTP %s: %s" % (codigo, detalle[:300]))


def pedir(url, cuerpo, cabeceras=None):
    """Manda un POST con JSON y devuelve la respuesta ya interpretada."""
    datos = json.dumps(cuerpo).encode("utf-8")
    cabeceras = dict(cabeceras or {})
    cabeceras["Content-Type"] = "application/json"
    cabeceras["x-goog-api-key"] = leer_clave()   # la clave va en la cabecera, no en la URL
    pedido = urllib.request.Request(url, data=datos, headers=cabeceras, method="POST")
    try:
        with urllib.request.urlopen(pedido, timeout=ESPERA_RED) as respuesta:
            return json.loads(respuesta.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        raise ErrorDeApi(error.code, error.read().decode("utf-8", "replace"))
    except urllib.error.URLError as error:
        raise ErrorDeApi(0, "no hay conexion a internet (%s)" % error.reason)


def _es_cuota(error):
    if getattr(error, "codigo", None) == 429:
        return True
    texto = str(error).lower()
    return any(p in texto for p in ("rate limit", "quota", "resource_exhausted"))


def _es_saturado(error):
    if getattr(error, "codigo", None) in (0, 500, 502, 503, 504):
        return True
    texto = str(error).lower()
    return any(p in texto for p in ("unavailable", "high demand", "overload", "timeout"))


def _esperar_turno():
    global _ultima_llamada
    falta = SEGUNDOS_ENTRE_LLAMADAS - (time.time() - _ultima_llamada)
    if falta > 0:
        time.sleep(falta)
    _ultima_llamada = time.time()


def _con_reintentos(llamada, que_estabamos_haciendo):
    global PENSAMIENTO
    for intento in range(1, REINTENTOS + 1):
        try:
            _esperar_turno()
            return llamada()
        except ErrorDeApi as error:
            if error.codigo == 400 and "thinking" in str(error).lower() and PENSAMIENTO is not None:
                PENSAMIENTO = None   # este modelo no acepta esa instruccion: se saca y se sigue
                continue
            if (_es_cuota(error) or _es_saturado(error)) and intento < REINTENTOS:
                espera = (15, 30, 60)[min(intento, 3) - 1]
                print("   (la API pidio esperar; reintento en %d segundos)" % espera, flush=True)
                time.sleep(espera)
                continue
            if error.codigo == 0:
                morir("No se pudo conectar a internet.\n\nLo que ya se hizo queda guardado.\n\n"
                      "Detalle: %s" % str(error)[:200])
            if _es_cuota(error):
                morir("La API corto por exceso de pedidos. Espera unos minutos y vuelve\n"
                      "a correrlo: lo que ya se hizo queda guardado.\n"
                      "Si pasa seguido, sube SEGUNDOS_ENTRE_LLAMADAS en modelo.py.")
            if error.codigo == 404:
                morir("Gemini no reconoce el modelo pedido (%s o %s).\n"
                      "Puede que Google lo haya cambiado de nombre: revisa la lista en\n"
                      "ai.google.dev/gemini-api/docs/models y cambialo arriba en modelo.py."
                      % (MODELO_GEMINI, MODELO_EMBEDDINGS))
            morir("Fallo %s.\n\nDetalle tecnico:\n%s\n\n"
                  "Revisa que la clave sea valida y que tengas conexion."
                  % (que_estabamos_haciendo, str(error)[:400]))


def preguntar(texto, temperatura=0, largo_maximo=2000):
    """Le manda texto a Gemini y devuelve su respuesta, tambien en texto."""
    config = {"temperature": temperatura, "maxOutputTokens": largo_maximo}

    def llamada():
        if PENSAMIENTO is not None:
            config["thinkingConfig"] = {"thinkingLevel": PENSAMIENTO}
        else:
            config.pop("thinkingConfig", None)
        r = pedir("%s/%s:generateContent" % (URL_GEMINI, MODELO_GEMINI),
                  {"contents": [{"parts": [{"text": texto}]}], "generationConfig": config})
        candidatos = r.get("candidates") or []
        if not candidatos:
            return ""
        partes = (candidatos[0].get("content") or {}).get("parts") or []
        return "".join(p.get("text", "") for p in partes)

    return _con_reintentos(llamada, "la llamada a Gemini")


def _normalizar(vector):
    largo = sum(x * x for x in vector) ** 0.5
    return [round(x / largo, 5) for x in vector] if largo else vector


def vectorizar(textos, es_pregunta=False, por_tanda=32, al_avanzar=None):
    """Convierte una lista de textos en una lista de vectores (igual que en el kit)."""
    tarea = "RETRIEVAL_QUERY" if es_pregunta else "RETRIEVAL_DOCUMENT"

    def hacer(tanda):
        r = pedir("%s/%s:batchEmbedContents" % (URL_GEMINI, MODELO_EMBEDDINGS),
                  {"requests": [{"model": "models/" + MODELO_EMBEDDINGS,
                                 "content": {"parts": [{"text": t}]},
                                 "taskType": tarea,
                                 "outputDimensionality": DIMENSIONES} for t in tanda]})
        return [_normalizar(e["values"]) for e in r["embeddings"]]

    vectores = []
    for inicio in range(0, len(textos), por_tanda):
        tanda = textos[inicio:inicio + por_tanda]
        vectores.extend(_con_reintentos(lambda t=tanda: hacer(t), "el calculo de los vectores"))
        if len(textos) > por_tanda:
            if al_avanzar:
                al_avanzar(len(vectores), len(textos))
            else:
                print("   vectorizados %d de %d" % (len(vectores), len(textos)), flush=True)
    return vectores


def parecido(a, b):
    """Similitud coseno entre dos vectores ya normalizados."""
    return sum(x * y for x, y in zip(a, b))


def correr(funcion_principal):
    """Si algo inesperado falla, lo explica en castellano."""
    try:
        funcion_principal()
    except KeyboardInterrupt:
        print("\n\nCancelado con Ctrl+C. Lo que ya se guardo no se pierde.\n")
    except SystemExit:
        raise
    except Exception:
        import traceback
        detalle = traceback.format_exc().strip().split("\n")
        print("\n" + "!" * 60)
        print("Algo fallo que no estaba previsto. Copia estas lineas y")
        print("pegaselas a un asistente de IA, o mandaselas al equipo:\n")
        for linea in detalle[-6:]:
            print("   " + linea)
        print("!" * 60 + "\n")
        sys.exit(1)
