"""
Actualiza los dictámenes del SII sobre herencias (Ley 16.271) que usa el
asistente SIILV-I.A. Es la versión para GitHub Actions del script
para-claude-code/dictamenes/actualizar-dictamenes.ps1.

Fuente: índice de jurisprudencia administrativa del SII, sección "Otras Normas"
https://www.sii.cl/normativa_legislacion/jurisprudencia_administrativa/indice_jadm.htm

Uso:
  python3 actualizar_dictamenes.py index.html             (revisa este año y el anterior)
  python3 actualizar_dictamenes.py index.html --completo  (revisa desde 2009)

Solo agrega dictámenes nuevos: nunca borra los que ya están. Si el SII no
responde o algo falla, no modifica la página y termina con error.
Solo usa la biblioteca estándar de Python (no hay que instalar nada).
"""
import datetime
import html
import json
import re
import sys
import urllib.request

BLOQUE = re.compile(r'(<script type="application/json" id="siaDictamenes">)(.*?)(</script>)', re.S)


def limpiar(s):
    if s is None:
        return ""
    s = html.unescape(re.sub(r"<[^>]+>", " ", str(s)))
    return re.sub(r"\s+", " ", s).strip()


def es_herencia(texto):
    return re.search(r"16\.271|[Hh]erencia", texto) is not None


def descargar(url, cuerpo=None):
    pedido = urllib.request.Request(url, data=cuerpo, headers={"User-Agent": "Mozilla/5.0 (guia-herencias)"})
    if cuerpo is not None:
        pedido.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(pedido, timeout=60) as r:
        return r.read()


# Años 2019 en adelante: el SII los entrega como datos (JSON)
def desde_api(anio):
    cuerpo = json.dumps({"key": "OTROS", "year": str(anio)}).encode("utf-8")
    datos = json.loads(descargar("https://www3.sii.cl/getPublicacionesCTByMateria", cuerpo).decode("utf-8"))
    for i in datos:
        materia = limpiar(i.get("pubLegal"))
        resumen = limpiar(i.get("pubResumen"))
        if not es_herencia(materia + " " + resumen):
            continue
        yield {
            "anio": anio, "oficio": str(i.get("pubNumOficio")), "fecha": str(i.get("pubFechaPubli")),
            "materia": materia, "resumen": resumen,
            "url": "https://www.sii.cl/normativa_legislacion/jurisprudencia_administrativa/otras_normas/%d/otras_normas_jadm%d.htm" % (anio, anio),
        }


# Años 2009 a 2018: páginas HTML con el texto de cada oficio
def desde_html(anio):
    base = "https://www.sii.cl/normativa_legislacion/jurisprudencia_administrativa/otras_normas/%d/" % anio
    pagina = descargar(base + "otras_normas_jadm%d.htm" % anio).decode("iso-8859-1")
    patron = r"(?s)<h5[^>]*>\s*<a href='(ja(\d+)\.htm)'[^>]*>(.*?)</a>.*?</h5>\s*<p[^>]*>(.*?)</p>"
    for m in re.finditer(patron, pagina):
        titulo = limpiar(m.group(3))
        resumen = limpiar(m.group(4))
        if not es_herencia(titulo + " " + resumen):
            continue
        fecha = str(anio)
        f = re.search(r"\((?:Ord|Oficio)[^)]*?de\s*(\d{1,2}[-/]\d{1,2}[-/]\d{4})\)", titulo)
        if f:
            fecha = f.group(1).replace("-", "/")
        yield {
            "anio": anio, "oficio": m.group(2), "fecha": fecha,
            "materia": re.sub(r"\s*\((Ord|Oficio)[^)]*\)\s*$", "", titulo).strip(), "resumen": resumen,
            "url": base + m.group(1),
        }


def numero(oficio):
    digitos = re.sub(r"\D", "", str(oficio))
    return int(digitos) if digitos else 0


def main():
    if len(sys.argv) < 2:
        sys.exit("Indica la página con el bloque siaDictamenes, por ejemplo: index.html")
    ruta = sys.argv[1]
    completo = "--completo" in sys.argv

    with open(ruta, encoding="utf-8", newline="") as f:
        contenido = f.read()
    bloque = BLOQUE.search(contenido)
    if not bloque:
        sys.exit("No encontré el bloque siaDictamenes en " + ruta)
    texto = bloque.group(2).strip()
    actuales = json.loads(texto)["dictamenes"] if texto else []
    claves = {"%s-%s" % (d["anio"], d["oficio"]) for d in actuales}

    hoy = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3)))  # hora de Chile (aprox.)
    desde = 2009 if completo else hoy.year - 1
    nuevos = []
    for anio in range(desde, hoy.year + 1):
        for d in (desde_api(anio) if anio >= 2019 else desde_html(anio)):
            k = "%s-%s" % (d["anio"], d["oficio"])
            if k not in claves:
                claves.add(k)
                nuevos.append(d)

    if not nuevos:
        # No se toca la página: así no hay un commit diario solo por cambiar la fecha
        print("Sin dictámenes nuevos (total %d)" % len(actuales))
        return

    todos = sorted(actuales + nuevos, key=lambda d: (int(d["anio"]), numero(d["oficio"])), reverse=True)
    datos = {"revisado": hoy.strftime("%d/%m/%Y"), "dictamenes": todos}
    nuevo_json = json.dumps(datos, ensure_ascii=False, separators=(",", ":"))
    # Se escapan < > & para que el texto nunca pueda cerrar el <script>
    nuevo_json = nuevo_json.replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026")
    contenido = BLOQUE.sub(lambda m: m.group(1) + "\n" + nuevo_json + "\n" + m.group(3), contenido, count=1)
    with open(ruta, "w", encoding="utf-8", newline="") as f:
        f.write(contenido)

    print("Nuevos dictámenes: %d (total %d)" % (len(nuevos), len(todos)))
    for d in nuevos:
        print("  + Oficio %s de %s: %s" % (d["oficio"], d["fecha"], d["resumen"]))


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception as e:
        sys.exit("ERROR: %s (la página no se modificó)" % e)
