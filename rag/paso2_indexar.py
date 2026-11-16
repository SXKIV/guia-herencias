# -*- coding: utf-8 -*-
"""
PASO 2 — Cortar en pedazos y convertirlos en numeros
Es el paso 3 del kit del optativo, adaptado a SIIMPLE. Dos cambios:
  1. No corta cada 1.200 caracteres a ciegas:
       - las normas se cortan por ARTICULO (un pedazo por articulo);
       - los oficios, por SECCION (antecedentes, analisis, conclusion).
     Y cada pedazo lleva arriba de donde viene ("Oficio N° 1126, de
     13/05/2026 ... Seccion: analisis"), para que el vector sepa de que
     habla y para que la respuesta pueda citarlo.
  2. Solo vectoriza lo NUEVO: si mañana llega un oficio, no se rehace todo.

En VS Code: abre este archivo y aprieta ▶.
Opcion (en la Terminal):
  python rag/paso2_indexar.py --solo-cortar    corta y muestra, sin usar la API (gratis)
"""

# ============================================================
#  ZONA EDITABLE
# ============================================================

TAMANO_MAXIMO = 1500   # caracteres por pedazo (sin contar el encabezado)
SOLAPE = 200           # solo se usa al partir un parrafo demasiado largo

# ============================================================
#  DE AQUI HACIA ABAJO NO SE TOCA
# ============================================================

import hashlib
import json
import os
import re
import sys
from datetime import datetime

import modelo

AQUI = os.path.dirname(os.path.abspath(__file__))
CARPETA_OFICIOS = os.path.join(AQUI, "txt", "oficios")
CARPETA_NORMAS = os.path.join(AQUI, "txt", "normas")
ARCHIVO_INDICE = os.path.join(AQUI, "indice_vectorial.json")
VERSION_CORTE = "siimple-1"

RE_SECCION = re.compile(
    r"(?im)^\s*(?:[IVX]{1,4}\s*[.\-–)]?\s*)?(ANTECEDENTES|AN[ÁA]LISIS|CONCLUSI[ÓO]N(?:ES)?)\s*[.:]?\s*$")
# Cuenta como comienzo de articulo una linea que empieza con mayuscula y:
#   - "Artículo 5º.-", "Artículo 10.-" o "Artículo 46 bis.-" (formato del SII), o
#   - "Art. 1.º", "Art. 10." o "Art. 959." (formato de BCN y del Codigo Civil).
# Asi una frase como "artículo 1.386 del Código Civil" no se confunde con un
# articulo nuevo.
RE_ARTICULO = re.compile(
    r"(?m)^\s*(?:Art[íi]culo|ART[ÍI]CULO|Art\.)\s+(\d+)\s*(?:\.\s*[°º]|[°º])?\s*((?i:bis|ter|qu[áa]ter))?"
    r"(?:\s*\.?\s*[-–]|\.(?=\s)|(?<=[°º])(?=\s))")
RE_SOLO_DEROGADO = re.compile(r"(?i)^\(?derogado\)?\.?$")


# ---------- Leer los archivos del paso 1 ----------

def leer_ficha(texto):
    """Separa la ficha de arriba (entre lineas ====) del cuerpo."""
    m = re.match(r"\s*=+\n(.*?)\n=+\n", texto, re.S)
    if not m:
        return {}, texto
    ficha = {}
    for linea in m.group(1).split("\n"):
        if ":" in linea:
            clave, valor = linea.split(":", 1)
            ficha[clave.strip().lower()] = valor.strip()
        elif linea.strip():
            ficha["titulo"] = linea.strip()
    return ficha, texto[m.end():]


def leer_carpeta(carpeta):
    if not os.path.isdir(carpeta):
        return []
    salida = []
    for nombre in sorted(os.listdir(carpeta)):
        if nombre.endswith(".txt"):
            with open(os.path.join(carpeta, nombre), encoding="utf-8", errors="replace") as f:
                salida.append((nombre, f.read()))
    return salida


# ---------- Cortar ----------

def limpiar(texto):
    texto = re.sub(r"\[pag\. \d+\]", " ", texto)
    return re.sub(r"[ \t]+", " ", texto).strip()


def empacar(texto):
    """Junta parrafos hasta TAMANO_MAXIMO. Un parrafo muy largo se parte con solape."""
    parrafos = [p.strip() for p in re.split(r"\n\s*\n", texto) if p.strip()]
    pedazos, actual = [], ""
    for p in parrafos:
        p = " ".join(p.split())
        if len(p) > TAMANO_MAXIMO:
            if actual:
                pedazos.append(actual)
                actual = ""
            paso = max(TAMANO_MAXIMO - SOLAPE, 200)
            for i in range(0, len(p), paso):
                trozo = p[i:i + TAMANO_MAXIMO]
                if len(trozo) >= 100 or not pedazos:
                    pedazos.append(trozo)
            continue
        if actual and len(actual) + len(p) + 1 > TAMANO_MAXIMO:
            pedazos.append(actual)
            actual = p
        else:
            actual = (actual + "\n" + p).strip()
    if actual:
        pedazos.append(actual)
    return pedazos


def cortar_oficio(nombre, texto):
    ficha, cuerpo = leer_ficha(texto)
    titulo = ficha.get("titulo", nombre)
    m = re.search(r"N° (\S+), de (\S+)", titulo)
    numero, fecha = (m.group(1), m.group(2)) if m else (nombre, "")
    anio = fecha[-4:] if fecha else nombre[:4]
    cita = "Oficio N° %s de %s" % (numero, anio)
    encabezado = "%s (SII, %s). Tema: %s" % (cita, fecha, ficha.get("resumen", "").rstrip(". "))
    cuerpo = limpiar(cuerpo)
    # partir en secciones; lo que va antes de "Antecedentes" es la presentacion
    partes, ultimo, seccion = [], 0, "presentacion"
    for m in RE_SECCION.finditer(cuerpo):
        partes.append((seccion, cuerpo[ultimo:m.start()]))
        seccion = m.group(1).lower().replace("á", "a").replace("ó", "o")
        ultimo = m.end()
    partes.append((seccion, cuerpo[ultimo:]))
    salida = []
    for seccion, texto_seccion in partes:
        pedazos = [p for p in empacar(texto_seccion) if len(p) >= 60]
        for n, pedazo in enumerate(pedazos, start=1):
            parte = " (parte %d de %d)" % (n, len(pedazos)) if len(pedazos) > 1 else ""
            salida.append({"tipo": "oficio", "archivo": nombre, "cita": cita, "seccion": seccion + parte,
                           "fuente": ficha.get("fuente", ""),
                           "texto": "%s. Sección: %s%s.\n%s" % (encabezado, seccion, parte, pedazo)})
    return salida


def cortar_norma(nombre, texto):
    ficha, cuerpo = leer_ficha(texto)
    cita = ficha.get("cita") or ficha.get("norma") or nombre.replace(".txt", "")
    cuerpo = limpiar(cuerpo)
    marcas = list(RE_ARTICULO.finditer(cuerpo))
    salida = []
    if not marcas:
        print("   (ojo: en %s no encontre 'Articulo N.-'; se corta por parrafos)" % nombre)
        marcas_texto = [("", cuerpo)]
    else:
        marcas_texto = []
        for i, m in enumerate(marcas):
            fin = marcas[i + 1].start() if i + 1 < len(marcas) else len(cuerpo)
            articulo = m.group(1) + (" " + m.group(2).lower() if m.group(2) else "")
            # un articulo que solo dice "DEROGADO" no aporta nada: se salta
            # (lo que venga despues en el mismo trozo son titulos de capitulo)
            resto = cuerpo[m.end():fin].strip()
            if RE_SOLO_DEROGADO.match(resto.split("\n")[0].strip()) and len(resto) < 200:
                continue
            marcas_texto.append((articulo, cuerpo[m.start():fin]))
    vistos = {}
    for articulo, texto_articulo in marcas_texto:
        # un mismo numero puede repetirse (articulos transitorios): se marcan
        vistos[articulo] = vistos.get(articulo, 0) + 1
        etiqueta = articulo + (" (%d.ª vez que aparece)" % vistos[articulo] if vistos[articulo] > 1 else "")
        cita_art = "%s, art. %s" % (cita, etiqueta) if articulo else cita
        pedazos = empacar(texto_articulo)
        for n, pedazo in enumerate(pedazos, start=1):
            parte = " (parte %d de %d)" % (n, len(pedazos)) if len(pedazos) > 1 else ""
            salida.append({"tipo": "norma", "archivo": nombre, "cita": cita_art, "seccion": "articulo" + parte,
                           "fuente": ficha.get("fuente", ""),
                           "texto": "%s%s.\n%s" % (cita_art, parte, pedazo)})
    return salida


def cortar_todo():
    fragmentos = []
    for nombre, texto in leer_carpeta(CARPETA_NORMAS):
        fragmentos.extend(cortar_norma(nombre, texto))
    for nombre, texto in leer_carpeta(CARPETA_OFICIOS):
        fragmentos.extend(cortar_oficio(nombre, texto))
    for f in fragmentos:
        clave = "%s|%s|%d|%s" % (VERSION_CORTE, modelo.MODELO_EMBEDDINGS, modelo.DIMENSIONES, f["texto"])
        f["id"] = hashlib.sha1(clave.encode("utf-8")).hexdigest()[:16]
    return fragmentos


# ---------- Indice ----------

def cargar_indice():
    """Lo usa el paso 3. Devuelve la lista de pedazos con su vector, o None."""
    if not os.path.exists(ARCHIVO_INDICE):
        return None
    with open(ARCHIVO_INDICE, encoding="utf-8") as f:
        guardado = json.load(f)
    if (guardado.get("modelo") != modelo.MODELO_EMBEDDINGS
            or guardado.get("dimensiones") != modelo.DIMENSIONES):
        return None
    return guardado["fragmentos"]


def main():
    solo_cortar = "--solo-cortar" in sys.argv
    fragmentos = cortar_todo()
    if not fragmentos:
        sys.exit("\nNo hay nada que indexar. Corre primero paso1_corpus.py\n")

    print("\n" + "=" * 60)
    print("PASO 2 - CORTAR Y CONVERTIR EN NUMEROS")
    print("=" * 60)
    normas = [f for f in fragmentos if f["tipo"] == "norma"]
    oficios = [f for f in fragmentos if f["tipo"] == "oficio"]
    print("\nPedazos de normas : %d (uno por articulo, salvo los muy largos)" % len(normas))
    print("Pedazos de oficios: %d (de %d oficios)" % (len(oficios), len({f["archivo"] for f in oficios})))

    print("\n" + "-" * 60)
    print("UNOS EJEMPLOS, PARA REVISAR EL CORTE:")
    print("-" * 60)
    ejemplos = normas[:1] + [f for f in normas if "46 bis" in f["cita"]][:1] + oficios[:2]
    for f in ejemplos:
        print("\n[%s | %s]" % (f["cita"], f["seccion"]))
        print(f["texto"][:600] + ("..." if len(f["texto"]) > 600 else ""))
    print("\n" + "-" * 60)
    print("Preguntas para revisar el corte:")
    print("  ¿cada pedazo de la ley es un articulo completo?")
    print("  ¿la conclusion de un oficio quedo junta, sin partirse a la mitad?")
    print("-" * 60)
    if solo_cortar:
        print("\n(--solo-cortar: no se uso la API.)\n")
        return

    modelo.comprobar()
    anteriores = {f["id"]: f["vector"] for f in (cargar_indice() or []) if "vector" in f}
    nuevos = [f for f in fragmentos if f["id"] not in anteriores]
    for f in fragmentos:
        if f["id"] in anteriores:
            f["vector"] = anteriores[f["id"]]
    print("\nYa tenian vector: %d | hay que vectorizar: %d" % (len(fragmentos) - len(nuevos), len(nuevos)))
    if nuevos:
        print("Esto toma unos minutos con el plan gratis. Si dice que espera, espera.\n")
        vectores = modelo.vectorizar([f["texto"] for f in nuevos])
        for f, v in zip(nuevos, vectores):
            f["vector"] = v
    with open(ARCHIVO_INDICE, "w", encoding="utf-8") as f:
        json.dump({"modelo": modelo.MODELO_EMBEDDINGS, "dimensiones": modelo.DIMENSIONES,
                   "version_corte": VERSION_CORTE, "creado": datetime.now().strftime("%d-%m-%Y %H:%M"),
                   "fragmentos": fragmentos}, f, ensure_ascii=False)
    tamano = os.path.getsize(ARCHIVO_INDICE) / 1e6
    print("\n" + "=" * 60)
    print("Listo: rag/indice_vectorial.json (%d pedazos, %.1f MB)." % (len(fragmentos), tamano))
    print("Ahora corre paso3_responder.py")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    modelo.correr(main)
