# -*- coding: utf-8 -*-
"""
PASO 1 — Reunir el corpus
Es el equivalente a la carpeta txt/sentencias del kit del optativo, pero
para SIIMPLE: en vez de 10 sentencias, el texto completo de los oficios
del SII sobre herencias y la Ley 16.271.

Que hace:
  1. Lee la lista de oficios que ya tiene el chat (el bloque siaDictamenes
     de index.html). Esa lista es la "tabla" del curso: dice QUE HAY.
  2. Baja del sitio del SII el texto completo de cada oficio y lo guarda
     en rag/txt/oficios/, con una ficha arriba (numero, fecha, materia).
  3. Baja la Ley 16.271 y la guarda en rag/txt/normas/.
No usa Gemini ni la clave: no cuesta nada.
Lo que ya esta bajado no se vuelve a bajar.

En VS Code: abre este archivo y aprieta el boton ▶ (arriba a la derecha).
Opciones (en la Terminal):
  python rag/paso1_corpus.py --diagnostico 2026   muestra que entrega el SII
  python rag/paso1_corpus.py --rehacer            vuelve a bajar todo
"""

# ============================================================
#  ZONA EDITABLE
# ============================================================

# Normas que se bajan solas. Cada una: nombre de archivo, como se cita y
# de donde se baja (PDF o pagina web). Otras normas (por ejemplo los
# articulos del Codigo Civil) se pegan a mano: ver rag/LEEME.md.
NORMAS = [
    {"archivo": "ley_16271",
     "cita": "Ley 16.271",
     "nombre": "Ley N° 16.271, sobre Impuesto a las Herencias, Asignaciones y Donaciones",
     "url": "https://www.sii.cl/normativa_legislacion/ley16271.pdf"},
]

SEGUNDOS_ENTRE_DESCARGAS = 1     # para no cargar al sitio del SII

# ============================================================
#  DE AQUI HACIA ABAJO NO SE TOCA
# ============================================================

import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

for _flujo in (sys.stdout, sys.stderr):
    try:
        _flujo.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

AQUI = os.path.dirname(os.path.abspath(__file__))
INDEX_HTML = os.path.join(AQUI, "..", "index.html")
CARPETA_OFICIOS = os.path.join(AQUI, "txt", "oficios")
CARPETA_NORMAS = os.path.join(AQUI, "txt", "normas")
CARPETA_PDF_MANUAL = os.path.join(AQUI, "pdfs", "oficios")
CARPETA_PDF_NORMAS = os.path.join(AQUI, "pdfs", "normas")
ARCHIVO_FALTAN = os.path.join(AQUI, "txt", "oficios", "FALTAN.md")
API_SII = "https://www3.sii.cl/getPublicacionesCTByMateria"
DESCARGA_SII = "https://www4.sii.cl/gabineteAdmInternet/descargaArchivo"
SITIO_SII = "https://www.sii.cl/"
MINIMO_TEXTO = 400      # menos que esto no puede ser un oficio completo
_ultima = [0.0]
_api_por_anio = {}


# ---------- Leer la "tabla" que ya tiene el chat ----------

def leer_tabla():
    """Devuelve la lista de dictamenes del bloque siaDictamenes de index.html."""
    if not os.path.exists(INDEX_HTML):
        sys.exit("No encuentro index.html. Este archivo tiene que estar en la carpeta rag/ del proyecto.")
    with open(INDEX_HTML, encoding="utf-8") as f:
        contenido = f.read()
    m = re.search(r'<script type="application/json" id="siaDictamenes">(.*?)</script>', contenido, re.S)
    if not m:
        sys.exit("No encontre el bloque siaDictamenes en index.html.")
    return json.loads(m.group(1).strip() or "{}").get("dictamenes", [])


# ---------- Descargas ----------

def descargar(url, cuerpo=None):
    falta = SEGUNDOS_ENTRE_DESCARGAS - (time.time() - _ultima[0])
    if falta > 0:
        time.sleep(falta)
    _ultima[0] = time.time()
    pedido = urllib.request.Request(url, data=cuerpo, headers={"User-Agent": "Mozilla/5.0 (guia-herencias)"})
    if cuerpo is not None:
        pedido.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(pedido, timeout=60) as r:
        return r.read(), (r.headers.get("Content-Type") or "").lower()


def decodificar(datos):
    for codificacion in ("utf-8", "iso-8859-1"):
        try:
            return datos.decode(codificacion)
        except UnicodeDecodeError:
            continue
    return datos.decode("utf-8", "replace")


def html_a_texto(pagina):
    """Saca las etiquetas HTML y deja el texto con sus parrafos."""
    t = re.sub(r"(?is)<(script|style|head|nav)[^>]*>.*?</\1>", " ", pagina)
    t = re.sub(r"(?is)<a[^>]*href=['\"]#_ftn[^>]*>.*?</a>", " ", t)          # marcas de notas al pie
    t = re.sub(r"(?i)<br\s*/?>", "\n", t)
    t = re.sub(r"(?i)</(p|div|h\d|li|tr|table|blockquote)>", "\n\n", t)
    t = re.sub(r"<[^>]+>", " ", t)
    t = html.unescape(t).replace("\xa0", " ")
    lineas = [re.sub(r"[ \t]+", " ", l).strip() for l in t.split("\n")]
    t = "\n".join(lineas)
    return re.sub(r"\n{3,}", "\n\n", t).strip()


def pdf_a_texto(datos):
    """Convierte un PDF en texto. Usa pymupdf o pypdf, el que este instalado."""
    try:
        import fitz  # pymupdf
        documento = fitz.open(stream=datos, filetype="pdf")
        paginas = [p.get_text() for p in documento]
    except ImportError:
        try:
            import io
            import pypdf
            lector = pypdf.PdfReader(io.BytesIO(datos))
            paginas = [p.extract_text() or "" for p in lector.pages]
        except ImportError:
            return None
    texto = "\n\n".join("[pag. %d]\n%s" % (i, p.strip()) for i, p in enumerate(paginas, start=1))
    return re.sub(r"\n{3,}", "\n\n", texto).strip()


def hay_lector_pdf():
    for modulo in ("fitz", "pypdf"):
        try:
            __import__(modulo)
            return True
        except ImportError:
            pass
    return False


def a_texto(datos, tipo, url):
    if url.lower().endswith(".pdf") or "pdf" in tipo or datos[:5] == b"%PDF-":
        texto = pdf_a_texto(datos)
    else:
        texto = html_a_texto(decodificar(datos))
    return texto.replace("﻿", "").strip() if texto is not None else None


# ---------- Donde esta cada oficio ----------

def items_de_la_api(anio):
    """Lo mismo que consulta .github/scripts/actualizar_dictamenes.py (anos 2019 en adelante)."""
    if anio not in _api_por_anio:
        cuerpo = json.dumps({"key": "OTROS", "year": str(anio)}).encode("utf-8")
        try:
            datos, _ = descargar(API_SII, cuerpo)
            _api_por_anio[anio] = json.loads(datos.decode("utf-8"))
        except Exception as e:
            print("   (no pude consultar la lista %d del SII: %s)" % (anio, e))
            _api_por_anio[anio] = []
    return _api_por_anio[anio]


def enlace_descarga(item):
    """Arma la direccion del PDF del oficio, igual que el boton de descarga del sitio del SII
    (funcion abreDoctoJurAdm de funciones_jurisprudencia.js). La lista del SII no trae la
    direccion, solo un codigo interno (idBlobArchPublica)."""
    codigo = item.get("idBlobArchPublica")
    if not codigo:
        return None
    datos = {
        "nombreDocumento": "%s-%s.%s" % (item.get("pubNumOficio", ""), item.get("pubFechaPubli", ""),
                                         item.get("extensionArchPublica") or "pdf"),
        "extension": item.get("extensionArchPublica") or "pdf",
        "acc": "download",
        "id": codigo,
        "mediaType": item.get("mTypeArchPublica") or "application/pdf",
    }
    return DESCARGA_SII + "?" + urllib.parse.urlencode(datos)


def candidatos(d):
    """Lista de direcciones donde podria estar el texto del oficio, de la mas segura a la menos."""
    anio, oficio = int(d["anio"]), str(d["oficio"])
    carpeta = SITIO_SII + "normativa_legislacion/jurisprudencia_administrativa/otras_normas/%d/" % anio
    lista = []
    if re.search(r"/ja\d+\.htm$", d.get("url", "")):
        lista.append(d["url"])                       # anos 2009-2018: pagina propia del oficio
    if anio >= 2019:
        for item in items_de_la_api(anio):
            if str(item.get("pubNumOficio")) == oficio and enlace_descarga(item):
                lista.append(enlace_descarga(item))
    lista += [carpeta + "ja%s.htm" % oficio, carpeta + "ja%s.pdf" % oficio]
    vistos, unicos = set(), []
    for u in lista:
        if u not in vistos and not u.endswith("otras_normas_jadm%d.htm" % anio):
            vistos.add(u)
            unicos.append(u)
    return unicos


def menciona_numero(texto, oficio):
    """Revisa que el texto sea de verdad ese oficio (y no una pagina de error del SII)."""
    digitos = re.sub(r"\D", "", str(oficio))
    if not digitos:
        return True
    patron = digitos if len(digitos) <= 3 else digitos[:-3] + r"\.?" + digitos[-3:]
    return re.search(r"(?<!\d)" + patron + r"(?!\d)", texto) is not None


def nombre_oficio(d):
    return "%s-%s" % (d["anio"], re.sub(r"\W", "", str(d["oficio"])))


def ficha_oficio(d, fuente):
    return ("=" * 70 + "\n"
            "OFICIO SII N° %s, de %s\n"
            "Materia : %s\n"
            "Resumen : %s\n"
            "Fuente  : %s\n"
            % (d["oficio"], d.get("fecha", d["anio"]), d.get("materia", ""), d.get("resumen", ""), fuente)
            + "=" * 70 + "\n\n")


def bajar_oficio(d):
    """Devuelve (texto, fuente) o (None, motivo)."""
    manual = os.path.join(CARPETA_PDF_MANUAL, nombre_oficio(d) + ".pdf")
    if os.path.exists(manual):
        with open(manual, "rb") as f:
            texto = pdf_a_texto(f.read())
        if texto is None:
            return None, "hay un PDF puesto a mano, pero falta instalar pypdf (ver LEEME)"
        return texto, "PDF puesto a mano (" + os.path.basename(manual) + ")"
    motivos = []
    for url in candidatos(d):
        try:
            datos, tipo = descargar(url)
        except urllib.error.HTTPError as e:
            motivos.append("%s -> %s" % (url, e.code))
            continue
        except Exception as e:
            motivos.append("%s -> %s" % (url, e))
            continue
        texto = a_texto(datos, tipo, url)
        if texto is None:
            motivos.append("%s -> es PDF y falta instalar pypdf" % url)
            continue
        if len(texto) < MINIMO_TEXTO:
            motivos.append("%s -> texto muy corto (%d caracteres)" % (url, len(texto)))
            continue
        if not menciona_numero(texto, d["oficio"]):
            motivos.append("%s -> la pagina no menciona el oficio %s (¿pagina de error?)" % (url, d["oficio"]))
            continue
        return texto, url
    return None, "; ".join(motivos) or "el SII no entrego ninguna direccion"


# ---------- Normas ----------

def bajar_norma(n):
    try:
        datos, tipo = descargar(n["url"])
    except Exception as e:
        return None, "no se pudo bajar %s (%s)" % (n["url"], e)
    if n["url"].lower().endswith(".pdf"):
        os.makedirs(CARPETA_PDF_NORMAS, exist_ok=True)
        with open(os.path.join(CARPETA_PDF_NORMAS, n["archivo"] + ".pdf"), "wb") as f:
            f.write(datos)
    texto = a_texto(datos, tipo, n["url"])
    if texto is None:
        return None, "es PDF y falta instalar pypdf (ver LEEME)"
    return texto, n["url"]


def ficha_norma(n, fuente):
    return ("=" * 70 + "\n"
            "NORMA   : %s\n"
            "Cita    : %s\n"
            "Fuente  : %s\n" % (n["nombre"], n["cita"], fuente)
            + "=" * 70 + "\n\n")


# ---------- Programa ----------

def diagnostico(anio):
    print("\nLo que entrega el SII para %d (primer oficio sobre herencias):\n" % anio)
    for item in items_de_la_api(anio):
        if re.search(r"16\.271|[Hh]erencia", json.dumps(item, ensure_ascii=False)):
            print(json.dumps(item, ensure_ascii=False, indent=2)[:3000])
            print("\nDireccion de descarga que arma este programa:")
            print("   " + (enlace_descarga(item) or "ninguna (el SII no entrego idBlobArchPublica)"))
            return
    print("No llego nada. ¿Hay internet? ¿Cambio la direccion de la API del SII?")


def main():
    if "--diagnostico" in sys.argv:
        i = sys.argv.index("--diagnostico")
        diagnostico(int(sys.argv[i + 1]) if len(sys.argv) > i + 1 else 2026)
        return
    rehacer = "--rehacer" in sys.argv
    os.makedirs(CARPETA_OFICIOS, exist_ok=True)
    os.makedirs(CARPETA_NORMAS, exist_ok=True)
    os.makedirs(CARPETA_PDF_MANUAL, exist_ok=True)

    print("\n" + "=" * 60)
    print("PASO 1 - REUNIR EL CORPUS")
    print("=" * 60)
    if not hay_lector_pdf():
        print("\nOjo: no esta instalado pypdf, asi que los oficios y normas que el SII")
        print("publica en PDF no se van a poder leer. Para instalarlo, en la Terminal:")
        print("   pip install pypdf")

    # --- normas ---
    print("\nNORMAS")
    for n in NORMAS:
        destino = os.path.join(CARPETA_NORMAS, n["archivo"] + ".txt")
        if os.path.exists(destino) and not rehacer:
            print("   ya estaba: %s" % n["cita"])
            continue
        texto, fuente = bajar_norma(n)
        if texto is None:
            print("   FALTA %s: %s" % (n["cita"], fuente))
            continue
        with open(destino, "w", encoding="utf-8") as f:
            f.write(ficha_norma(n, fuente) + texto + "\n")
        print("   bajada: %s (%d caracteres)" % (n["cita"], len(texto)))

    # --- oficios ---
    tabla = leer_tabla()
    print("\nOFICIOS: la lista del chat tiene %d" % len(tabla))
    bajados, ya, faltan = 0, 0, []
    for numero, d in enumerate(tabla, start=1):
        destino = os.path.join(CARPETA_OFICIOS, nombre_oficio(d) + ".txt")
        if os.path.exists(destino) and not rehacer:
            ya += 1
            continue
        texto, fuente = bajar_oficio(d)
        if texto is None:
            faltan.append((d, fuente))
            print("   [%d/%d] FALTA oficio %s de %s" % (numero, len(tabla), d["oficio"], d["anio"]))
            continue
        with open(destino, "w", encoding="utf-8") as f:
            f.write(ficha_oficio(d, fuente) + texto + "\n")
        bajados += 1
        print("   [%d/%d] oficio %s de %s (%d caracteres)" % (numero, len(tabla), d["oficio"], d["anio"], len(texto)))

    # --- lista de lo que falta, para completarlo a mano ---
    if faltan:
        with open(ARCHIVO_FALTAN, "w", encoding="utf-8") as f:
            f.write("# Oficios que no se pudieron bajar solos\n\n"
                    "Para cada uno: busca el oficio en el sitio del SII, baja su PDF y guardalo en\n"
                    "`rag/pdfs/oficios/` con el nombre que se indica. Despues vuelve a correr el paso 1.\n\n"
                    "| Guardar como | Oficio | Indice del SII | Motivo |\n|---|---|---|---|\n")
            for d, motivo in faltan:
                f.write("| `%s.pdf` | N° %s, de %s | [abrir](%s) | %s |\n"
                        % (nombre_oficio(d), d["oficio"], d.get("fecha", d["anio"]), d.get("url", ""),
                           motivo.replace("|", "/")[:300]))
    elif os.path.exists(ARCHIVO_FALTAN):
        os.remove(ARCHIVO_FALTAN)

    print("\n" + "-" * 60)
    print("Oficios nuevos: %d | ya estaban: %d | faltan: %d" % (bajados, ya, len(faltan)))
    if faltan:
        print("\nLos que faltan quedaron anotados en rag/txt/oficios/FALTAN.md,")
        print("con instrucciones para completarlos a mano.")
        print("Para ver que entrega el SII y ajustar este programa:")
        print("   python rag/paso1_corpus.py --diagnostico 2026")
    print("\nRevisa dos o tres archivos de rag/txt/oficios: ¿esta el texto completo")
    print("(antecedentes, analisis, conclusion) o solo un resumen?")
    print("Despues corre paso2_indexar.py")
    print("-" * 60 + "\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nCancelado. Lo que ya se bajo queda guardado.\n")
