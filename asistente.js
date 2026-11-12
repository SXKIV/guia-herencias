/* =========================================================
   ASISTENTE SIILV-I.A (versión sin costo)
   Responde dentro del navegador con el contenido de esta guía
   y con los procedimientos de las tres aptitudes del agente.
   No usa servidores ni servicios pagados.
   Solo hay que tocar este bloque.
   ========================================================= */
var ASISTENTE_CONFIG = {
  // UTM que usa el asistente para sus estimaciones: la toma de codigo.js
  // (línea var UTM = ...), así que no hay que cambiarla aquí cada mes.
  utm: window.UTM_GUIA.valor,
  utmMes: window.UTM_GUIA.mes + " de " + window.UTM_GUIA.anio,

  // Datos de la Clínica Jurídica Derecho UC para el botón "Hablar con una
  // persona" (usa el formulario y el correo). Las demás instituciones están
  // en la sección «Dónde pedir ayuda» (id="ayuda") de index.html.
  contacto: {
    formulario: "https://docs.google.com/forms/d/e/1FAIpQLSehMOzLOG7tXo_FUrF7l-gmuYMQQKxZQjGf1yXQHlMlDK9yHA/viewform",
    correo: "clinicajuridica@uc.cl",
    telefono: "+56 9 5504 2195",
    direccion: "Pasaje Quito 43-A, Santiago"
  },

  // Secciones de la guía que el asistente puede citar y enlazar con [texto](#id)
  selectorSecciones: "section.pantalla[id]",

  // Cómo abrir una sección al tocar un enlace del chat. null = la página ya
  // maneja los botones con data-ir (como esta guía). Si no, por ejemplo:
  // irASeccion: function(id){ document.getElementById(id).scrollIntoView({behavior: "smooth"}); }
  irASeccion: null,

  // Dirección de un dictamenes.json, si los dictámenes no van dentro de la página
  // en el bloque siaDictamenes (solo funciona con la página publicada en un servidor)
  urlDictamenes: null
};

(function(){
  "use strict";

  var cfg = ASISTENTE_CONFIG;
  var lanzador = document.getElementById("siaLanzador");
  var panel = document.getElementById("siaPanel");
  if(!lanzador || !panel) return;
  var cuerpo = document.getElementById("siaCuerpo");
  var form = document.getElementById("siaForm");
  var caja = document.getElementById("siaTexto");
  var btnEnviar = document.getElementById("siaEnviar");
  var punto = document.getElementById("siaPunto");

  /* Botones de inicio: los iniciadores de conversación del agente */
  var INICIADORES = [
    ["Revisar mi caso", "caso"],
    ["Guiar Formulario 4412", "formulario"],
    ["Pago y certificado", "pago"],
    ["Caso con testamento", "testamento"],
    ["Definiciones rápidas", "definiciones"]
  ];

  var CLAVE_CONVERSACION = "siilvConversacion";
  var CLAVE_VISTO = "siilvVisto";

  var AVATAR = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8.5 4.5h10.5l6.5 6.5v16.5h-17z" fill="#0B3A6E"/><path d="M19 4.5V11h6.5z" fill="#EB510D"/><path d="M12 16h9.5M12 20h9.5M12 24h5.5" stroke="#fff" stroke-width="1.9" stroke-linecap="round"/></svg>';

  /* Secciones de la guía a las que el asistente puede enlazar */
  var SECCIONES = {};
  var SELECTOR_SECCIONES = cfg.selectorSecciones || "section.pantalla[id]";
  Array.prototype.forEach.call(document.querySelectorAll(SELECTOR_SECCIONES), function(s){ SECCIONES[s.id] = true; });

  var historial = [];      // [{role, content}]
  var esperando = false;
  var iniciado = false;
  var conversacion = 0;    // cambia al empezar una conversación nueva

  function guardarSesion(clave, valor){ try{ sessionStorage.setItem(clave, valor); }catch(e){} }
  function leerSesion(clave){ try{ return sessionStorage.getItem(clave); }catch(e){ return null; } }
  function esCelular(){ return window.matchMedia && window.matchMedia("(max-width:640px)").matches; }

  /* ---------- Formato de las respuestas (Markdown básico y seguro) ---------- */
  function esc(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }
  function enLinea(t){
    // t ya viene escapado: aquí solo se agregan etiquetas conocidas
    var reservados = [];
    function reservar(html){ reservados.push(html); return "\u0000" + (reservados.length - 1) + "\u0000"; }
    t = t.replace(/`([^`]+)`/g, function(_, c){ return reservar("<code>" + c + "</code>"); });
    t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function(_, txt, url){
      if(url.charAt(0) === "#"){
        // [texto](#seccion) abre la sección; [texto](#seccion#apartado) baja además a ese apartado
        var partes = url.slice(1).split("#"), id = partes[0];
        var apartado = /^[\w-]+$/.test(partes[1] || "") ? ' data-apartado="' + partes[1] + '"' : "";
        return SECCIONES[id] ? reservar('<button type="button" class="sia-enlace" data-ir="' + id + '"' + apartado + '>' + txt + "</button>") : txt;
      }
      if(/^https?:\/\//i.test(url)) return reservar('<a href="' + url + '" target="_blank" rel="noopener">' + txt + "</a>");
      return txt;
    });
    t = t.replace(/https?:\/\/[^\s<>()\u0000]*[^\s<>().,;:!?\u0000]/g, function(url){
      return reservar('<a href="' + url + '" target="_blank" rel="noopener">' + url + "</a>");
    });
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?![*\w])/g, "$1<em>$2</em>");
    t = t.replace(/\u0000(\d+)\u0000/g, function(_, i){ return reservados[+i]; });
    return t;
  }
  function celdas(fila){
    return fila.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(function(c){ return c.trim(); });
  }
  function tabla(filas){
    var cab = celdas(filas[0]);
    var html = '<div class="sia-tabla"><table><thead><tr>' +
      cab.map(function(c){ return "<th>" + enLinea(c) + "</th>"; }).join("") + "</tr></thead><tbody>";
    filas.slice(2).forEach(function(f){
      html += "<tr>" + celdas(f).map(function(c){ return "<td>" + enLinea(c) + "</td>"; }).join("") + "</tr>";
    });
    return html + "</tbody></table></div>";
  }
  var RE_TABLA = /^\s*\|/, RE_SEPARADOR = /^\s*\|?\s*:?-{2,}/, RE_TITULO = /^\s*#{1,6}\s+(.*)$/,
      RE_LINEA = /^\s*(-{3,}|\*{3,}|_{3,})\s*$/, RE_VINETA = /^\s*[-*•]\s+/, RE_NUMERO = /^\s*(\d+)[.)]\s+/;
  function itemLista(t){
    t = t.replace(/^\[ \]\s*/, "☐ ").replace(/^\[[xX]\]\s*/, "☑ ");
    return "<li>" + enLinea(t) + "</li>";
  }
  function iniciaBloque(lineas, i){
    var l = lineas[i];
    return RE_TITULO.test(l) || RE_LINEA.test(l) || RE_VINETA.test(l) || RE_NUMERO.test(l) ||
      (RE_TABLA.test(l) && i + 1 < lineas.length && RE_SEPARADOR.test(lineas[i + 1]));
  }
  function markdown(md){
    var lineas = esc(String(md).replace(/\r/g, "")).split("\n");
    var html = [], i = 0, items, m;
    while(i < lineas.length){
      var l = lineas[i];
      if(!l.trim()){ i++; continue; }
      if(RE_TABLA.test(l) && i + 1 < lineas.length && RE_SEPARADOR.test(lineas[i + 1])){
        var filas = [];
        while(i < lineas.length && RE_TABLA.test(lineas[i])){ filas.push(lineas[i]); i++; }
        html.push(tabla(filas)); continue;
      }
      if((m = l.match(RE_TITULO))){ html.push('<p class="sia-h">' + enLinea(m[1]) + "</p>"); i++; continue; }
      if(RE_LINEA.test(l)){ html.push("<hr>"); i++; continue; }
      if(RE_VINETA.test(l)){
        items = [];
        while(i < lineas.length && RE_VINETA.test(lineas[i])){ items.push(itemLista(lineas[i].replace(RE_VINETA, ""))); i++; }
        html.push("<ul>" + items.join("") + "</ul>"); continue;
      }
      if((m = l.match(RE_NUMERO))){
        var inicio = parseInt(m[1], 10);
        items = [];
        while(i < lineas.length && RE_NUMERO.test(lineas[i])){ items.push(itemLista(lineas[i].replace(RE_NUMERO, ""))); i++; }
        html.push("<ol" + (inicio > 1 ? ' start="' + inicio + '"' : "") + ">" + items.join("") + "</ol>"); continue;
      }
      var parrafo = [l]; i++;
      while(i < lineas.length && lineas[i].trim() && !iniciaBloque(lineas, i)){ parrafo.push(lineas[i]); i++; }
      html.push("<p>" + parrafo.map(enLinea).join("<br>") + "</p>");
    }
    return html.join("");
  }

  /* =========================================================
     MOTOR DE RESPUESTAS LOCAL
     ========================================================= */

  function norm(s){
    return " " + String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, " ").trim() + " ";
  }
  function pesos(n){ return "$" + Math.round(n).toLocaleString("es-CL"); }
  function num(n, dec){ return n.toLocaleString("es-CL", {minimumFractionDigits: 0, maximumFractionDigits: dec == null ? 2 : dec}); }

  var CIERRE_NOTA = "\n\n*Orientación general basada en esta guía; no reemplaza la asesoría de un abogado ni las instrucciones oficiales del SII.*";

  /* ---------- Tablas del impuesto (Ley 16.271, art. 2) ---------- */
  var TRAMOS = [
    [960, 0.01, 0], [1920, 0.025, 14.4], [3840, 0.05, 62.4], [5760, 0.075, 158.4],
    [7680, 0.10, 302.4], [9600, 0.15, 686.4], [14400, 0.20, 1166.4], [Infinity, 0.25, 1886.4]
  ];
  var PARENTESCOS = [
    {id: "hijo", re: /\b(hij[oa]s?|niet[oa]s?)\b/, nombre: "Hijo o hija", exen: 600, rec: 0},
    {id: "conyuge", re: /\b(conyuge|espos[oa]|viud[oa]|marido|conviviente civil|union civil)\b/, nombre: "Cónyuge o conviviente civil", exen: 600, rec: 0},
    {id: "ascendiente", re: /\b(padre|madre|papa|mama|abuel[oa]s?|ascendientes?)\b/, nombre: "Padre, madre o abuelo", exen: 600, rec: 0},
    {id: "medio", re: /\bmedi[oa]s? herman[oa]s?\b/, nombre: "Medio hermano", exen: 60, rec: 0.2},
    {id: "hermano", re: /\bherman[oa]s?\b/, nombre: "Hermano o hermana", exen: 60, rec: 0.2},
    {id: "col34", re: /\b(ti[oa]s?|sobrin[oa]s?|prim[oa]s?)\b/, nombre: "Tío, sobrino o primo", exen: 60, rec: 0.2},
    {id: "col56", re: /\b(pariente (mas )?lejano|lejan[oa]|sin parentesco)\b/, nombre: "Pariente más lejano", exen: 0, rec: 0.4}
  ];
  function parPorId(id){ for(var i = 0; i < PARENTESCOS.length; i++) if(PARENTESCOS[i].id === id) return PARENTESCOS[i]; return null; }
  // Si la persona cuenta quién falleció, su propio parentesco es el inverso
  var INVERSO = {ascendiente: "hijo", hijo: "ascendiente", conyuge: "conyuge", hermano: "hermano", medio: "medio", col34: "col34"};

  function buscarPar(frag){
    for(var i = 0; i < PARENTESCOS.length; i++) if(PARENTESCOS[i].re.test(frag)) return PARENTESCOS[i];
    return null;
  }
  function leerParentesco(t){
    var m = t.match(/ (soy|era|como) (su |el |la |un |una )?(\w+( \w+)?)/);
    if(m){ var p = buscarPar(" " + m[3] + " "); if(p) return p; }
    m = t.match(/ (murio|fallecio|muerte de|perdi a|herencia de) (mi |el |la |su )?(\w+( \w+)?)/) ||
        t.match(/ mi (\w+( \w+)?) (murio|fallecio)/);
    if(m){
      var frag = " " + (m[3] && !/murio|fallecio/.test(m[3]) ? m[3] : m[1]) + " ";
      var f = buscarPar(frag);
      if(f && INVERSO[f.id]) return parPorId(INVERSO[f.id]);
    }
    var hallados = PARENTESCOS.filter(function(p){ return p.re.test(t); });
    if(hallados.length === 2 && hallados[0].id === "medio" && hallados[1].id === "hermano") return hallados[0];
    return hallados.length === 1 ? hallados[0] : null;
  }
  var RE_RUT = /\b\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]\b/g;
  function leerMonto(texto){
    var t = String(texto).toLowerCase().replace(RE_RUT, " ").replace(/\s+/g, " ");
    var m = t.match(/(\d+(?:[.,]\d+)?)\s*(millones|millon|mill|palos|mm)\b/);
    if(m) return {pesos: parseFloat(m[1].replace(",", ".")) * 1e6};
    m = t.match(/(\d[\d.]*(?:,\d+)?)\s*utm\b/);
    if(m) return {utm: parseFloat(m[1].replace(/\./g, "").replace(",", "."))};
    m = t.match(/\$?\s*(\d{1,3}(?:\.\d{3})+|\d{5,})/);
    if(m) return {pesos: parseInt(m[1].replace(/\./g, ""), 10)};
    return null;
  }
  var NUMEROS = {un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10};
  function leerHijos(t){
    var m = t.match(/ (\d+|un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez) hij[oa]s? /);
    if(!m) return 0;
    return NUMEROS[m[1]] || parseInt(m[1], 10) || 0;
  }

  function impuesto(asigUtm, par){
    var base = asigUtm - par.exen;
    if(base <= 0) return {base: base, total: 0};
    for(var i = 0; i < TRAMOS.length; i++){
      if(base <= TRAMOS[i][0]){
        var bruto = base * TRAMOS[i][1] - TRAMOS[i][2];
        return {base: base, tasa: TRAMOS[i][1], ded: TRAMOS[i][2], bruto: bruto, total: bruto * (1 + par.rec)};
      }
    }
  }

  function calculo(monto, par){
    var u = cfg.utm;
    var asig = monto.utm != null ? monto.utm : monto.pesos / u;
    var r = impuesto(asig, par);
    var md = "### Estimación para " + par.nombre.toLowerCase() + "\n" +
      "| Paso | Valor |\n|---|---|\n" +
      "| Lo que te toca | " + (monto.pesos ? pesos(monto.pesos) + " ≈ " : "") + num(asig) + " UTM |\n" +
      "| Exención por parentesco | − " + par.exen + " UTM |\n";
    if(r.total <= 0){
      md += "| Base imponible | 0 |\n\n**Con estos datos no pagarías impuesto**, porque tu parte no supera la exención. " +
        "Si **todas** las asignaciones de la familia quedan exentas y así se marca en la solicitud del Registro Civil, la ley da por cumplida la declaración (art. 60); si otro heredero sí supera su exención, corresponde marcar «afectas algunas». En cualquier caso vas a necesitar el **certificado del SII** para inscribir los bienes, y se obtiene completando el F4412. [Por qué ir al SII aunque no pagues impuesto](#cero)";
    } else {
      md += "| Base imponible | " + num(r.base) + " UTM |\n" +
        "| Tramo (tasa − deducción) | " + num(r.tasa * 100, 1) + "% − " + num(r.ded, 1) + " UTM |\n" +
        "| Impuesto bruto | " + num(r.bruto) + " UTM |\n" +
        "| Recargo por parentesco | " + (par.rec * 100) + "% |\n" +
        "| **Impuesto estimado** | **" + num(r.total) + " UTM ≈ " + pesos(r.total * u) + "** |\n\n" +
        "Los pesos se calculan con la UTM del mes en que se paga. [Cómo funcionan las tablas](#tablas) · [Guía 3 en PDF](#guias)";
    }
    md += "\n\n**Supuestos:** el monto es tu parte ya repartida, después de restar gastos y deudas; usé 1 UTM = " + pesos(u) +
      " (" + cfg.utmMes + "), pero la exención y el tramo se calculan con la UTM del **mes del fallecimiento** ([por qué](#dos-utm)). " +
      "No cubre representación, transmisión, donaciones previas ni bienes en el extranjero. Para afinarlo usa la [calculadora](#calculadora).";
    return md;
  }

  function reparto(total, nHijos, conConyuge){
    var filas = [], partes;
    if(!conConyuge){
      filas.push(["Cada hijo (" + nHijos + ")", total / nHijos, parPorId("hijo")]);
      partes = nHijos + " partes iguales";
    } else if(nHijos === 1){
      filas.push(["Hijo", total / 2, parPorId("hijo")], ["Cónyuge", total / 2, parPorId("conyuge")]);
      partes = "mitad y mitad";
    } else if(nHijos <= 6){
      var P = total / (nHijos + 2);
      filas.push(["Cada hijo (" + nHijos + ")", P, parPorId("hijo")], ["Cónyuge (2 partes)", 2 * P, parPorId("conyuge")]);
      partes = (nHijos + 2) + " partes: una por hijo y dos para el cónyuge";
    } else {
      filas.push(["Cónyuge (un cuarto)", total / 4, parPorId("conyuge")], ["Cada hijo (" + nHijos + ")", total * 0.75 / nHijos, parPorId("hijo")]);
      partes = "un cuarto para el cónyuge y el resto en partes iguales entre los hijos";
    }
    var md = "### Reparto en el primer orden (hay hijos)\nSe divide en " + partes + " (art. 988 del Código Civil).\n\n" +
      "| Heredero | Le toca | Impuesto estimado |\n|---|---|---|\n";
    filas.forEach(function(f){
      var r = impuesto(f[1] / cfg.utm, f[2]);
      md += "| " + f[0] + " | " + pesos(f[1]) + " | " + (r.total > 0 ? "≈ " + pesos(r.total * cfg.utm) : "Exento ($0)") + " |\n";
    });
    md += "\n**Supuestos:** " + pesos(total) + " es el **acervo líquido**, es decir, ya restados funeral, última enfermedad y deudas ([qué se descuenta](#descuentos))";
    if(conConyuge) md += ". Si estaban casados en sociedad conyugal, a la herencia entra la parte del fallecido en los bienes sociales (en general, la mitad, después de las recompensas) más sus bienes propios";
    md += ". UTM de " + cfg.utmMes + " (" + pesos(cfg.utm) + "). Si todos quedan exentos y así se marca en el Registro Civil, la declaración se da por cumplida (art. 60), pero igual se necesita el **certificado del SII** para inscribir. [Ver órdenes sucesorios](#ordenes)";
    return md;
  }

  /* ---------- ¿Dónde declaro cada bien? ---------- */
  var BIENES = [
    {re: /\b(casa|departamento|depto|propiedad|propiedades|inmueble|terreno|sitio|local)\b/, md: "**Casa, departamento o terreno urbano → Bienes raíces no agrícolas.** Se busca por rol y comuna. Valor: **avalúo fiscal vigente al mes del fallecimiento** (art. 46 letra a); si se compró dentro de los 3 años anteriores y el precio fue mayor, va el precio de compra. El certificado de avalúo es gratis en sii.cl. Si es una vivienda DFL 2 o de la Ley Pereira, la exención se indica en las opciones avanzadas del bien."},
    {re: /\b(canerias?|tuberias?|tubos|losas?|pisos?|arboles?|instalaciones)\b/, md: "**Instalaciones fijas: cañerías, pisos, árboles → dentro del bien raíz.** Son inmuebles por adherencia o por destinación: siguen a la casa o al terreno y no son menaje. Si están comprendidas en el avalúo fiscal no se declaran aparte; las que quedan fuera, a valor corriente en plaza (art. 46 letra a). [Ver la ilustración](#que-entra)"},
    {re: /\b(parcela|campo|predio|fundo|agricola|ganado|animales|plantacion\w*|maquinaria)\b/, md: "**Parcela o campo → Bienes raíces agrícolas** (botón azul *Otros*), al avalúo fiscal del mes del fallecimiento. Construcciones, plantaciones, maquinaria y ganado van aparte en **Bienes excluidos de avalúo fiscal de inmuebles agrícolas**, a valor corriente en plaza (art. 46 bis). Si se valoran así, el SII puede citar dentro de los 60 días siguientes a la declaración para revisar ese valor (art. 50). [Ver la ilustración del campo](#que-entra)"},
    {re: /\b(auto|autos|camioneta|moto|vehiculo|vehiculos|camion)\b/, md: "**Auto, camioneta o moto → Vehículos.** Se busca por **código SII** (está en el permiso de circulación) y año. Valor: el formulario trae la tasación fiscal del SII; como bien mueble, la regla legal es el valor corriente en plaza (art. 46 letra c y art. 46 bis)."},
    {re: /\b(muebles|menaje|refrigerador|electrodomesticos|enseres)\b/, md: "**Muebles de la casa → Menaje.** Se puede detallar bien por bien o usar la **presunción del 20%** del valor del inmueble que guarnecían (art. 47). Aunque no se detallen los muebles, la ley presume menaje. [Qué es menaje y qué no](#que-entra)"},
    {re: /\b(banco|cuenta|cuentas|ahorro|efectivo|dinero|cuenta rut|cuenta vista|cuenta corriente)\b/, md: "**Dinero en el banco o efectivo → Dinero.** Se elige la institución. Valor: **saldo a la fecha del fallecimiento**. Los bancos deben entregar esos datos a los herederos (art. 45)."},
    {re: /\b(afp|fondo de pensiones|fondos de pensiones|cuenta de capitalizacion)\b/, md: "**Fondos de AFP → Fondos AFP.** Pide fondo total en UF, **fondo heredable** en UF y en pesos; no son lo mismo, porque parte puede ir a pensiones de sobrevivencia. Los fondos están **exentos del impuesto hasta 4.000 UF** (art. 72 del DL 3.500). Respaldo: certificado de saldo de la AFP."},
    {re: /\b(deposito a plazo|depositos a plazo|fondo mutuo|fondos mutuos|bonos?)\b/, md: "**Depósito a plazo, fondo mutuo o bonos → Otros valores mobiliarios.** Respaldo: certificado de la institución con el saldo a la fecha del fallecimiento."},
    {re: /\b(acciones|accion)\b/, md: "**Acciones:** si se transan en bolsa → *Acciones transadas en bolsa*, valor = **promedio de los 6 meses anteriores** al fallecimiento (art. 46 letra b). Si son de SpA o S.A. cerrada → *Acciones no transadas*, a valor corriente en plaza (en la práctica, según el último balance). Solo la parte del causante."},
    {re: /\b(ltda|eirl|limitada|sociedad|sociedades|empresa|negocio|pyme)\b/, md: "**Participación en Ltda. o EIRL → Derechos en sociedades de personas.** Se aplica el art. 46 letra f a los activos, se resta el pasivo y se declara **solo el porcentaje del causante**. Datos: balance y escritura social. Si es sociedad civil, va en *Sociedades civiles*. Caso complejo: conviene asesoría."},
    {re: /\b(joyas?|arte|cuadros?|antiguedades|armas?|coleccion\w*|instrumentos?)\b/, md: "**Joyas, arte, armas o colecciones → Joyas, objetos de arte, antigüedades y armas**, a valor corriente en plaza (art. 46 bis). No van en el menaje."},
    {re: /\b(extranjero|afuera|otro pais|argentina|peru|espana|estados unidos)\b/, md: "**Bienes en el extranjero → Bienes situados en el extranjero.** Se informa país e impuestos pagados afuera, que sirven de abono (art. 1). Es un caso para revisar con un abogado o la Clínica Jurídica Derecho UC. [Ver dónde pedir ayuda](#ayuda)"},
    {re: /\b(derechos? de agua|mineros?|marca|marcas|propiedad intelectual|patente)\b/, md: "**Derechos de agua, mineros, marcas o propiedad intelectual → Activos intangibles**, a valor corriente en plaza (art. 46 bis)."},
    {re: /\b(bote|lancha|barco|nave|avioneta|aeronave|velero)\b/, md: "**Embarcaciones o aeronaves → Naves y aeronaves**, a valor corriente en plaza. Deben estar inscritas a nombre del causante."},
    {re: /\b(le debian|le debia|prestamo que hizo|me debe|cuentas por cobrar|pagare)\b/, md: "**Plata que le debían al fallecido → Cuentas por cobrar.** **Suma** a la herencia. Respaldo: pagaré, contrato o reconocimiento de deuda."},
    {re: /\b(deudas?|credito|creditos|tarjeta|tarjetas|hipotecario|casa comercial)\b/, md: "**Deudas que dejó → Pasivos heredables.** **Restan** de la masa. Respaldo: certificado de deuda al día del fallecimiento. No se incluyen las que tenían **seguro de desgravamen**, ni las contraídas para comprar bienes exentos (art. 4 N.º 3 de la Ley 16.271)."},
    {re: /\b(funeral|funeraria|sepultura|nicho|cremacion|ultima enfermedad|medicos?|clinica|hospital|remedios|medicamentos)\b/, md: "**Funeral y última enfermedad → Gastos de última enfermedad y otros.** Restan de la masa (art. 4 de la Ley 16.271). De la última enfermedad se descuenta lo que quedó **adeudado** al fallecimiento o lo que la familia pagó antes, si se acredita; no lo que cubrió un seguro, isapre o Fonasa. Siempre **con boletas**."}
  ];
  function respuestaBienes(t){
    var hall = BIENES.filter(function(b){ return b.re.test(t); }).slice(0, 3);
    if(!hall.length) return null;
    return hall.map(function(b){ return b.md; }).join("\n\n") +
      "\n\nRecuerda: el formulario muestra 7 categorías y las otras 15 aparecen con el botón azul **Otros**; el monto solo se suma al apretar el **botón naranja de agregar**. [Ver todas las categorías](#bienes) · [Qué entra a la herencia y cómo se valora](#que-entra)";
  }

  /* ---------- Respuestas fijas (contenido de la guía y de las aptitudes) ---------- */
  var DOCUMENTOS = "**Para declarar, el SII no pide documentos.** Pero después puede pedir antecedentes para respaldar lo que declaraste.\n\n" +
    "Guarda las **boletas** y comprobantes de los gastos que descuentes (funeral, última enfermedad, deudas y posesión efectiva): sin respaldo no se pueden descontar, aunque el gasto haya existido. [Etapas del trámite](#viaje) · [¿Qué gastos y deudas se descuentan?](#descuentos)";

  var DEFINICIONES = "### Definiciones rápidas\n" +
    "- **Causante:** la persona que falleció y cuya herencia se tramita.\n" +
    "- **Masa hereditaria:** todos sus bienes, derechos y deudas, como un conjunto.\n" +
    "- **Asignatario:** quien recibe algo de la herencia; en las intestadas, todos son herederos.\n" +
    "- **Asignación:** la parte que le toca a cada uno; el impuesto se calcula sobre ella.\n" +
    "- **Posesión efectiva:** resolución que reconoce quiénes son los herederos (Registro Civil, si no hay testamento).\n" +
    "- **Bajas generales:** gastos y deudas que se restan antes de repartir (funeral, última enfermedad adeudada, gastos de la posesión efectiva, deudas); para el impuesto, art. 4 de la Ley 16.271.\n" +
    "- **Acervo líquido:** lo que queda después de las bajas; eso se reparte.\n" +
    "- **Exención:** parte de tu asignación que no paga impuesto (600 UTM hijos, cónyuge y padres; 60 UTM hermanos, tíos, sobrinos y primos).\n" +
    "- **CBR:** Conservador de Bienes Raíces, donde se inscriben las propiedades a nombre de los herederos.\n" +
    "- **UTM:** unidad tributaria mensual; cambia cada mes.\n\n" +
    "Más definiciones en el [Glosario](#conceptos).";

  var PAGO = "### Después de enviar la declaración\n" +
    "1. Al presionar **Enviar**, el sistema abre la ventana de **giros**: muestra lo que paga cada asignatario.\n" +
    "2. Si hay impuesto, puedes pagarlo de una vez o pedir pagarlo en **hasta tres cuotas anuales**; cada cuota vence el 31 de diciembre. Antes de elegirlo, ojo: hay que pedirlo dentro del plazo de dos años, las cuotas llevan **reajuste e interés**, y **mientras queden cuotas pendientes el SII no emite el certificado de pago**, salvo que se garantice el saldo (Circular SII 33/2021).\n" +
    "3. Si todos quedan exentos, se obtiene el **certificado de exención**.\n" +
    "4. Con la resolución de posesión efectiva y el **certificado de pago o exención** vas al **Conservador de Bienes Raíces** a inscribir cada propiedad. Sin ese certificado no inscribe.\n\n" +
    "Guarda el certificado: te lo pedirán también al vender o transferir los bienes. Los pesos del giro se calculan con la **UTM del mes en que se paga**. Si te equivocaste, existe la **rectificatoria**. [Ver las etapas del trámite](#viaje) · [Guía 4 en PDF](#guias)";

  var TESTAMENTO = "### Si hay testamento\n" +
    "Esta guía y el formulario de **herencias intestadas** no sirven para ese caso: la ruta es distinta.\n" +
    "- La **posesión efectiva** la concede un **tribunal**, no el Registro Civil.\n" +
    "- Los asignatarios pueden ser **legatarios** (reciben bienes determinados) y no solo herederos.\n" +
    "- Personas sin parentesco pueden recibir algo y pagan un **recargo de 40%**.\n\n" +
    "Es uno de los casos en que conviene **asesoría profesional**. Revísalo con un abogado o la Clínica Jurídica Derecho UC. [Ver dónde pedir ayuda](#ayuda)";

  var FORMULARIO = [
    "**1. Datos del declarante.** Viene prellenado con quien inició sesión, que debe ser asignatario (o un mandatario o representante electrónico autorizado ante el SII). Quien no es heredero forzoso (por ejemplo, un hermano) no puede declarar si en las bases del SII aparecen hijos o cónyuge. Completa domicilio, teléfono y correo. Si el nombre, el RUT o la fecha de fallecimiento están mal, **no se corrige aquí**: hay que ir a una unidad del SII antes de seguir.",
    "**2. Contacto tributario.** Opcional. Anotar a un abogado o estudiante **no le da representación**. En un caso corriente se deja en blanco.",
    "**3. Datos del causante.** Se ingresa su RUT y el sistema trae nombre y fecha de fallecimiento. Tú eliges el **estado civil**. ¡Ojo! Si después lo cambias, el sistema **borra los bienes ya cargados**. Verifícalo con el certificado de matrimonio antes de seguir.",
    "**4. Posesión efectiva.** Número de inscripción, oficina del Registro Civil, fecha de la resolución y folio. Salen del certificado de posesión efectiva: esta sección solo se completa con la posesión efectiva concedida. El resto del formulario se puede usar antes, como borrador, para calcular.",
    "**5. Asignatarios.** Se agregan uno a uno con el botón naranja: RUT, domicilio y parentesco; el sistema compara el parentesco con sus bases. Si un heredero murió antes que el causante, se agrega a ese **heredero fallecido** y, dentro de su ficha, a quienes lo representan. Las opciones avanzadas (repudio, cesión, discapacidad) se dejan como vienen salvo que existan de verdad.",
    "**6. Declaración de bienes.** La sección más larga. Hay 7 categorías a la vista y 15 más en el botón azul **Otros**. El monto **no se suma hasta apretar el botón naranja de agregar**. El lápiz naranja abre opciones avanzadas (nuda propiedad, fideicomiso, exenciones como DFL 2). Pregúntame dónde va un bien, por ejemplo: \"¿dónde declaro el auto?\".",
    "**7. Agregados y deducciones.** Una barra por asignatario. Casi nunca se toca, salvo **donaciones en vida** o si fallecieron ambos cónyuges sucesivamente (art. 2).",
    "**8. Cálculo de impuestos.** Solo lectura: exención, tramo, recargo, créditos e impuesto neto en UTM y pesos. Si algo no cuadra, hay que volver atrás y corregir los datos de entrada.",
    "**9. Declaración jurada y envío.** **Guardar** deja un borrador (úsalo si te falta algo). **Enviar** presenta la declaración y abre los giros. Antes de enviar, confirma que todo es fiel a la verdad: es una declaración jurada y debes conservar los respaldos."
  ];

  function contactoMd(){
    var c = cfg.contacto || {};
    return "Puedes hacer el trámite por tu cuenta. Si necesitas ayuda, según tu caso puedes recurrir a:\n" +
      "- **SII**: dudas sobre el formulario F4412, el pago o el certificado.\n" +
      "- **Registro Civil**: la posesión efectiva.\n" +
      "- **Corporación de Asistencia Judicial** o una **clínica jurídica**, como la Clínica Jurídica Derecho UC: asesoría gratuita.\n" +
      "- **Defensoría del Contribuyente**: problemas o desacuerdos con el SII.\n" +
      (c.formulario ? "\nPara pedir atención a la Clínica Jurídica Derecho UC: [formulario de solicitud](" + c.formulario + ")" + (c.correo ? " o " + c.correo : "") + ".\n" : "") +
      "\n[Ver dónde pedir ayuda](#ayuda)";
  }

  /* Cada tema: palabras que lo activan (sobre texto sin tildes) y su respuesta */
  var TEMAS = [
    {id: "saludo", re: [/^ (hola|buenas|buenos dias|buenas tardes|buenas noches|hey|ola|alo) /], md: "¡Hola! Soy **SIILV-I.A**. Te oriento con el impuesto a las herencias intestadas: Formulario 4412, pago y certificado. ¿Qué necesitas?", opciones: ["Revisar mi caso", "Guiar Formulario 4412", "Pago y certificado"]},
    {id: "gracias", re: [/ (gracias|muchas gracias|vale|perfecto|genial|excelente|ok|listo) $/], md: "¡De nada! Si te surge otra duda, aquí estoy."},
    {id: "quien", re: [/ (quien eres|que eres|eres (un )?(bot|robot|humano|persona)|eres del sii|oficial)/], md: "Soy **SIILV-I.A**, el asistente de SIIMPLE. **No soy un servicio oficial del SII.** Respondo con el contenido de esta guía; para tu caso concreto conviene hablar con un abogado o la Clínica Jurídica Derecho UC. [Qué guarda esta página](#privacidad)", opciones: ["Hablar con una persona"]},
    {id: "persona", re: [/ (hablar con (una )?persona|abogad[oa]|clinica|atencion|contacto|telefono|correo|direccion|asesoria|ayuda personal)/], fn: contactoMd},
    {id: "etapas", re: [/ (etapas?|pasos?|como empiezo|por donde (empiezo|parto)|que tengo que hacer|tramite completo|proceso)/, / (registro civil|conservador|cbr)/], md: "### Las tres etapas\n**Antes de empezar:** conviene estimar el impuesto de toda la familia, porque la solicitud del Registro Civil pregunta si las asignaciones están exentas o afectas.\n1. **Registro Civil:** posesión efectiva, con herederos e inventario valorizado. Reconoce quiénes son herederos, pero todavía no se puede vender un inmueble.\n2. **SII:** en el formulario F4412 declaras los bienes con más detalle para determinar el impuesto. Si todas las asignaciones son exentas y así se marcó, la declaración se da por cumplida, pero igual se completa el F4412 para obtener el **certificado de exención**.\n3. **Conservador de Bienes Raíces:** con la resolución y el certificado del SII se inscriben las propiedades. Desde ahí los herederos pueden vender o hipotecar.\n\nSi la familia quedó en el paso 1, el Conservador no inscribe porque falta el certificado del SII. [Ver etapas](#viaje)"},
    {id: "cero", re: [/ (no pago|no pagar|exento|exenta|exentos|aunque no|igual (hay que|tengo que) declarar|tengo que declarar|obligatori)/], md: "**Puede que no pagues, pero igual vas a necesitar ir al SII.** Muchos herederos quedan exentos porque la exención de los parientes cercanos es alta. Si **todas** las asignaciones de la familia quedan exentas y así se marca en la solicitud del Registro Civil, la ley da por cumplida la obligación de declarar (art. 60 de la Ley 16.271).\n\nPero para inscribir los bienes en el Conservador o retirarlos del banco se necesita el **certificado de exención** del SII (arts. 44 y 54), y se obtiene completando el **F4412**.\n\nOjo: si un solo heredero supera su exención, corresponde marcar \"afectas algunas\" y declarar. [Por qué ir al SII aunque no pagues impuesto](#cero)"},
    {id: "plazo", re: [/ (plazo|plazos|cuanto tiempo tengo|dos anos|2 anos|vence|atrasad[oa]|intereses|multa)/], md: "**Plazo: dos años** desde que se defiere la herencia, que por regla general es la **fecha del fallecimiento**. Si había impuesto, pasado ese plazo se deben **intereses** (art. 50 de la Ley 16.271 y art. 53 del Código Tributario). Además, el SII tiene **tres años** para revisar y cobrar desde que vencen esos dos, o **seis** si no se presentó declaración (art. 200 del Código Tributario). Si en el intertanto falleció otro familiar, hay que reconstruir la cadena de herederos. [Dudas frecuentes](#dudas-usuario)"},
    {id: "antiguo", re: [/ (hace (muchos|varios|\d+) anos|nunca se hizo|nunca hicimos|anos atras|fallecio hace)/], md: "**Sí, todavía se puede.** La posesión efectiva se puede pedir en cualquier momento. Lo que cambia con el tiempo es el impuesto:\n- Si había impuesto, se deben **intereses** desde que se cumplen dos años del fallecimiento.\n- El SII tiene **tres años** para revisar y cobrar desde que vencen esos dos, o **seis** si no se presentó declaración. Según el SII, si esos plazos ya corrieron, el F4412 emite un **certificado de vencimiento de los plazos legales**.\n\nLos plazos pueden interrumpirse, y si murieron otras personas de la familia en el intertanto hay que reconstruir la cadena de herederos (representación o transmisión). Es un caso para revisar con un abogado o la Clínica Jurídica Derecho UC antes de dar nada por hecho. [Ver dónde pedir ayuda](#ayuda)", opciones: ["Hablar con una persona"]},
    {id: "costos", re: [/ (cuesta|costo|costos|cobran|arancel|gratis|precio|cuanto sale|pagar el tramite|privilegio de pobreza)/], md: "### Cuánto cuesta\n| Concepto | Quién cobra | Referencia |\n|---|---|---|\n| Posesión efectiva | Registro Civil | Gratis hasta 15 UTA de inventario; 1,6 UTM hasta 45 UTA; 2,5 UTM sobre eso |\n| Certificados de defunción, nacimiento, matrimonio | Registro Civil | Gratis en línea con ClaveÚnica |\n| Certificado de avalúo fiscal | SII | Gratis |\n| Impuesto | SII | $0 si tu parte no supera la exención |\n| Inscripción de herencia | Conservador | Liberado si la masa no supera 15 UTA; 50% de rebaja hasta 45 UTA; sobre eso, el arancel de cada Conservador |\n\nEsta guía es gratuita, y también la ayuda de las clínicas jurídicas universitarias, pero el **impuesto**, si corresponde, se paga igual. Sobre el arancel del Registro Civil hay un fallo reciente que lo discute para personas patrocinadas por clínicas jurídicas: si no puedes pagarlo, coméntalo con quien te asiste antes de pagar. [Ver costos](#costos)"},
    {id: "descuentos", re: [/ (descontar|descuento|descuentos|rebajar|restar|bajas generales|gastos que|pagar menos)/], md: "### Lo que se descuenta antes de repartir\nPara el impuesto rige el **art. 4 de la Ley 16.271**:\n- **Última enfermedad:** lo que quedó **adeudado** al fallecimiento, o lo que la familia pagó antes, si se acredita. No lo que cubrió un seguro, isapre o Fonasa.\n- **Entierro:** funeral, sepultura, cremación.\n- **Gastos del trámite:** los de la posesión efectiva y de la partición.\n- **Deudas del fallecido:** créditos, tarjetas, casas comerciales, deudas tributarias. **No** las que paga un seguro de desgravamen, ni las contraídas para comprar bienes exentos (como una casa DFL 2).\n- **Pensiones de alimentos** que la persona debía pagar por ley.\n\n**Sin boletas o certificados no se pueden descontar**, aunque el gasto haya existido. Cuando una parte queda cerca de la exención, esto puede ser la diferencia entre pagar y quedar exento. [Ver descuentos](#descuentos) · [Qué entra a la herencia y cómo se valora](#que-entra)"},
    {id: "exencion", re: [/ (exencion|exenciones|parentesco|cuanto puedo recibir|sin pagar|600 utm|60 utm|recargo)/], md: "### Exención y recargo según parentesco\n| Heredero | Exención | Recargo |\n|---|---|---|\n| Hijo, cónyuge o conviviente civil, padres/abuelos | 600 UTM (≈ " + pesos(600 * cfg.utm) + ") | 0% |\n| Hermano o medio hermano | 60 UTM (≈ " + pesos(60 * cfg.utm) + ") | 20% |\n| Tío, sobrino, primo (3.º y 4.º grado) | 60 UTM | 20% |\n| Parientes más lejanos | 0 | 40% |\n\nLa exención se resta de **tu** parte antes de calcular; no es un descuento sobre el impuesto. Pesos con la UTM de " + cfg.utmMes + ". Si me dices tu parentesco y cuánto te toca, te hago una estimación. [Parentesco y exenciones](#parentesco)"},
    {id: "tablas", re: [/ (tabla|tablas|tramo|tramos|tasa|tasas|deduccion|progresiv)/], md: "### Cómo se calcula (por cada heredero)\n1. Tu parte en UTM (con la UTM del mes del fallecimiento) **menos la exención** = base imponible.\n2. **Base × tasa del tramo − deducción** = impuesto bruto.\n3. **Impuesto bruto × (1 + recargo)** = impuesto total.\n\n| Base (UTM) | Tasa | Deducción |\n|---|---|---|\n| hasta 960 | 1% | 0 |\n| hasta 1.920 | 2,5% | 14,4 |\n| hasta 3.840 | 5% | 62,4 |\n| hasta 5.760 | 7,5% | 158,4 |\n| hasta 7.680 | 10% | 302,4 |\n| hasta 9.600 | 15% | 686,4 |\n| hasta 14.400 | 20% | 1.166,4 |\n| más de 14.400 | 25% | 1.886,4 |\n\nEjemplo: un hijo con 3.000 UTM → base 2.400 → 2.400 × 5% − 62,4 = **57,6 UTM**. [Tablas del impuesto](#tablas) · [Guía 3 en PDF](#guias)"},
    {id: "ordenes", re: [/ (quien hereda|quienes heredan|cuanto le toca|cuanto me toca|reparte|reparto|repartir|ordenes? sucesori|partes iguales)/], md: "### Quién hereda (sin testamento)\n- **1.er orden, hay hijos:** heredan los hijos y el cónyuge. Con 2 a 6 hijos, el cónyuge lleva **el doble** que cada hijo; con 1 hijo, mitad y mitad; con 7 o más, el cónyuge lleva un cuarto.\n- **2.º orden, no hay hijos:** cónyuge (2 partes) y padres o abuelos más cercanos (1 parte).\n- **3.º orden:** hermanos (los medio hermanos llevan la mitad).\n- **4.º orden:** otros colaterales hasta el 6.º grado.\n- **5.º:** el Fisco.\n\nSe reparte el **acervo líquido** (ya restadas las bajas). Si me dices el monto y cuántos hijos hay, te muestro el reparto. Ej.: \"herencia de 80 millones, cónyuge y 3 hijos\". [Quién hereda y cuánto le toca](#ordenes)"},
    {id: "utm", re: [/ (utm|uta|unidad tributaria)/], md: "### Dos UTM distintas\n- **UTM del mes del fallecimiento:** para convertir tu parte a UTM, aplicar la exención y ubicar el tramo.\n- **UTM del mes en que se paga:** para pasar a pesos el impuesto ya calculado (art. 2). Las cuotas llevan además reajuste e interés.\n- Los bienes se valorizan **en pesos a la fecha del fallecimiento**, sin UTM.\n\nValor usado en la guía: 1 UTM = " + pesos(cfg.utm) + " (" + cfg.utmMes + "). La [calculadora](#calculadora) trae la UTM de cada mes desde enero de 2019 y usa la que corresponde a la fecha. Revisa el valor oficial en la tabla UTM de sii.cl. [UTM del fallecimiento y UTM de la declaración](#dos-utm)"},
    {id: "documentos", re: [/ (documentos?|papeles|certificados?|que necesito|que debo (llevar|reunir|tener)|requisitos)/], md: DOCUMENTOS},
    {id: "pago", re: [/ (pago|pagar el impuesto|pagarlo|giro|giros|cuotas?|anualidades|certificado de pago|comprobante|despues de enviar|despues (del sii|de declarar|de la declaracion))/], md: PAGO},
    {id: "testamento", re: [/ (testamento|testada|testamentaria|legatario|legado)/], md: TESTAMENTO},
    {id: "rectificar", re: [/ (olvide|me equivoque|error\b|rectific\w*|corregir|cambiar la declaracion|falto declarar)/], md: "**Se puede rectificar.** El sistema del SII tiene la opción de **rectificatoria**, que permite partir de los datos vigentes o de un formulario nuevo. Es mejor corregir que dejarlo así: el SII puede fiscalizar más adelante. Ojo: si el error está en el nombre, el RUT o la fecha de fallecimiento que trae el sistema, hay que regularizarlo en una unidad del SII."},
    {id: "online", re: [/ (en linea|online|internet|presencial\w*|ir al sii|oficina|clave unica|clave tributaria|sucursal)/], md: "Se hace **en línea**, en el formulario F4412, con la **ClaveÚnica o clave tributaria** del heredero, que es **personal** y no se presta. También puede presentarla un **mandatario o representante electrónico** autorizado previamente ante el SII. Si el sistema no deja avanzar, por ejemplo porque no tiene registrada la fecha de defunción o porque un parentesco no coincide con sus bases, hay que regularizar ese dato con el SII."},
    {id: "otra", re: [/ (otra persona|por mi|en mi nombre|mandato|representar|puede hacerlo (mi|un))/], md: "La declaración la presenta un heredero, y quien la envía firma una **declaración jurada** sobre los datos. Según las instrucciones del F4412, también puede presentarla un **mandatario** o un **representante electrónico** autorizado previamente ante el SII. Si alguien te ayuda (un abogado o la Clínica Jurídica Derecho UC), puede acompañarte y ayudarte a completar el formulario, pero la responsabilidad es de quien lo envía. Si estás pensando en dar un mandato, coméntalo antes con quien te ayuda."},
    {id: "regimen", re: [/ (sociedad conyugal|gananciales|separacion de bienes|regimen|casad[oa]s?|matrimonio|50 por ciento|la mitad)/], md: "### Si estaba casado: revisa el régimen\n- **Sociedad conyugal:** a la herencia entra la parte del fallecido en los bienes sociales (en general, la mitad, después de las recompensas) más sus bienes propios. En el **inventario del Registro Civil** se anota esa parte: anotar el 100% infla la masa y el arancel. En el **F4412** es distinto: según sus instrucciones, un bien que pertenece completo a la sociedad conyugal se anota al **100%** y el régimen se descuenta en líneas propias. Verifícalo al llenarlo.\n- **Participación en los gananciales:** cada uno tenía su patrimonio; puede haber un crédito a favor del que ganó menos.\n- **Separación total de bienes:** todo lo que estaba a nombre del fallecido es herencia.\n- **Acuerdo de unión civil:** cada conviviente conserva lo suyo, salvo que al celebrarlo hayan pactado comunidad (Ley 20.830, art. 15).\n\nSi no sabes cuál era, revisa la libreta o el certificado de matrimonio. El cónyuge **además** es heredero sobre la parte del fallecido. [Qué entra a la herencia: el régimen matrimonial](#que-entra#regimen-matrimonial)"},
    {id: "representacion", re: [/ (representacion|transmision|niet[oa]s?|murio antes|fallecio antes|murio despues|fallecio despues|cadena)/], md: "### Representación o transmisión: depende de quién murió primero\n- **Representación:** si el hijo murió **antes** que su padre, los nietos ocupan su lugar en la herencia del abuelo.\n- **Transmisión:** si el hijo murió **después** sin alcanzar a aceptar, a los nietos les llega su derecho de opción; normalmente hay **dos posesiones efectivas encadenadas**.\n\nPara el impuesto, los que heredan por representación pagan el que le habría correspondido a su padre o madre, con **una sola exención** para todos (art. 3 de la Ley 16.271). En el F4412 se agrega al heredero fallecido y, dentro de su ficha, a sus representantes. Conviene revisarlo con un abogado o la Clínica Jurídica Derecho UC. [Quién hereda y cuánto le toca](#ordenes) · [Ver dónde pedir ayuda](#ayuda)", opciones: ["Hablar con una persona"]},
    {id: "repudio", re: [/ (repudi\w*|renunciar|no quiero (la herencia|heredar)|ceder|cesion|vender (mi|los) derechos)/], md: "- **Repudiar** es rechazar la herencia: es un acto formal (con inmuebles, por escritura pública) y ese heredero se entiende que nunca lo fue. **No** se marca solo porque alguien no quiere hacer el trámite.\n- **Ceder el derecho real de herencia** es traspasar a un tercero la cuota en la herencia, no bienes específicos.\n\nAmbos se marcan en las opciones avanzadas del asignatario, solo si existen de verdad. Son temas para revisar con un abogado o la Clínica Jurídica Derecho UC. [Ver dónde pedir ayuda](#ayuda)", opciones: ["Hablar con una persona"]},
    {id: "trampas", re: [/ (errores|trampas?|equivocaciones|cuidado|consejos|tips)/], md: "### Errores frecuentes\n- Usar una sola UTM (son dos).\n- Usar el avalúo fiscal **actual** en vez del vigente al fallecimiento.\n- Usar la misma regla de **sociedad conyugal** en los dos formularios: en el Registro Civil va la parte del fallecido; en el F4412, el 100% y el régimen se descuenta aparte.\n- Marcar «exentas todas» mirando solo tu parte: la casilla es por **toda la familia**.\n- Cambiar el **estado civil** a mitad de camino (borra los bienes).\n- Escribir el valor y **no apretar agregar**.\n- Decir que \"no había muebles\": rige la presunción del 20% del menaje.\n- Olvidar los **gastos y deudas que se descuentan** y no guardar boletas.\n- Dejar pasar el **plazo de dos años**.\n\n[Ver todas las trampas](#trampas)"},
    {id: "posesion", re: [/ (posesion efectiva)/], md: "La **posesión efectiva** es el reconocimiento oficial de quiénes son los herederos. Sin testamento la concede el **Registro Civil**; con testamento, un tribunal. Es para **toda** la herencia, no para un bien. Se presenta con el inventario valorizado a la fecha del fallecimiento; guarda ese inventario, porque se reutiliza en el SII. Aún no permite vender: falta el SII y el Conservador. [Etapas del trámite](#viaje)"}
  ];

  /* ---------- Búsqueda en la propia guía (respaldo) ---------- */
  var VACIAS = " a al algo como con cual cuando de del desde donde el ella en entre es esa ese esta este hay la las le lo los mas me mi mis muy no o para pero por que se si sin sobre su sus te tengo tiene un una uno y ya yo tu cuanto puedo debo hacer quiero saber necesito impuesto impuestos herencia herencias paga pagar pago ";
  var indice = null;
  function palabras(t){
    return norm(t).trim().split(" ").filter(function(w){ return w.length > 2 && VACIAS.indexOf(" " + w + " ") < 0; });
  }
  // Raíz simple: "sepulturas" y "sepultación" quedan como "sepult"
  function raiz(w){ return w.length > 6 ? w.slice(0, 6) : w.replace(/(es|s)$/, ""); }
  function construirIndice(){
    indice = [];
    Array.prototype.forEach.call(document.querySelectorAll(SELECTOR_SECCIONES), function(sec){
      if(/^(inicio|menu-)/.test(sec.id)) return;
      var titulo = (sec.querySelector("h1") || {}).textContent || "";
      Array.prototype.forEach.call(sec.querySelectorAll("p, li, details"), function(el){
        if(el.closest(".sia-panel")) return;
        var txt = el.tagName === "DETAILS" ? el.textContent : el.textContent;
        txt = txt.replace(/\s+/g, " ").trim();
        if(txt.length < 40) return;
        var sum = el.tagName === "DETAILS" ? ((el.querySelector("summary") || {}).textContent || "") : "";
        indice.push({id: sec.id, titulo: titulo.trim(), resumen: sum.trim(), texto: txt, raices: palabras(sum + " " + txt).map(raiz)});
      });
    });
  }
  function citar(e){
    var txt = e.resumen ? e.texto.replace(e.resumen, "**" + e.resumen + ":**") : e.texto;
    if(txt.length > 650) txt = txt.slice(0, 650).replace(/\s\S*$/, "") + "…";
    return "Esto dice la guía en **" + e.titulo + "**:\n\n" + txt + "\n\n[Abrir " + e.titulo + "](#" + e.id + ")";
  }
  function buscarEnGuia(texto){
    if(!indice) construirIndice();
    // Un término del diccionario nombrado tal cual gana directamente
    var termino = norm(texto).replace(/^ (que es|que son|que significa|a que se refiere|define|definicion de)( el| la| los| las| un| una)? /, " ").trim();
    if(termino.length > 3){
      for(var k = 0; k < indice.length; k++){
        if(indice[k].id === "conceptos" && indice[k].resumen && norm(indice[k].resumen).indexOf(" " + termino + " ") >= 0) return citar(indice[k]);
      }
    }
    var q = palabras(texto).map(raiz);
    if(!q.length) return null;
    var mejor = null, puntos = 0, distintas = 0;
    indice.forEach(function(e){
      var p = 0, d = 0;
      q.forEach(function(w){ if(e.raices.indexOf(w) >= 0){ p += w.length > 6 ? 2 : 1; d++; } });
      if(e.resumen && q.some(function(w){ return w.length > 3 && norm(e.resumen).indexOf(w) >= 0; })) p += 3;
      if(p > puntos){ puntos = p; mejor = e; distintas = d; }
    });
    if(!mejor || puntos < 4 || (distintas < 2 && q.length > 1)) return null;
    return citar(mejor);
  }

  /* ---------- Información extra (bloque oculto #siaInfoExtra) ---------- */
  var infoExtra = null;
  function cargarInfoExtra(){
    infoExtra = [];
    var bloque = document.getElementById("siaInfoExtra");
    if(!bloque) return;
    var actual = null;
    bloque.textContent.replace(/\r/g, "").split("\n").forEach(function(linea){
      if(/^\s*\/\//.test(linea)) return;
      var m = linea.match(/^\s*##\s+(.+)$/);
      if(m){ actual = {titulo: m[1].trim(), claves: [], lineas: []}; infoExtra.push(actual); return; }
      if(!actual) return;
      m = linea.match(/^\s*claves\s*:\s*(.*)$/i);
      if(m && !actual.lineas.length){
        actual.claves = actual.claves.concat(m[1].split(",").map(function(c){ return norm(c).trim(); }).filter(Boolean));
        return;
      }
      actual.lineas.push(linea);
    });
    infoExtra = infoExtra.filter(function(e){ e.respuesta = e.lineas.join("\n").trim(); return e.respuesta; });
  }
  function buscarInfoExtra(t){
    if(!infoExtra) cargarInfoExtra();
    var mejor = null, puntos = 0, q = palabras(t).map(raiz);
    infoExtra.forEach(function(e){
      var p = 0;
      e.claves.forEach(function(c){ if(t.indexOf(" " + c + " ") >= 0) p += 3 + c.split(" ").length; });
      var enTitulo = palabras(e.titulo).map(raiz).filter(function(w){ return q.indexOf(w) >= 0; }).length;
      if(enTitulo >= 2) p += enTitulo;
      if(p > puntos){ puntos = p; mejor = e; }
    });
    return mejor && puntos >= 3 ? mejor.respuesta : null;
  }

  /* ---------- Dictámenes del SII (bloque #siaDictamenes) ---------- */
  var dictamenes = null, dictRevisado = "";
  // Palabras que aparecen en casi todos los dictámenes y no ayudan a distinguirlos
  var COMUNES = ["herencia", "herencias", "asignacion", "asignaciones", "donacion", "donaciones", "impuesto", "impuestos", "ley", "articulo", "oficio", "oficios", "circular", "codigo", "consulta", "sobre", "respecto", "aplicacion", "tributario", "sii", "dictamen", "dictamenes", "jurisprudencia", "criterio", "pronunciamiento", "dicho"].map(raiz);
  function cargarDictamenes(){
    dictamenes = [];
    var bloque = document.getElementById("siaDictamenes");
    try{
      var d = JSON.parse((bloque && bloque.textContent.trim()) || "{}");
      dictRevisado = d.revisado || "";
      dictamenes = (d.dictamenes || []).map(function(x){
        x.raices = palabras(x.materia + " " + x.resumen).map(raiz).filter(function(w){ return COMUNES.indexOf(w) < 0; });
        return x;
      });
    }catch(e){ dictamenes = []; }
  }
  // exigirMinimo: no bajar el mínimo de palabras en común aunque la pregunta tenga menos
  // (así una sola palabra genérica, como "declarar", no trae dictámenes que no vienen al caso)
  function buscarDictamenes(texto, max, minimo, exigirMinimo){
    if(!dictamenes) cargarDictamenes();
    var q = palabras(texto).map(raiz).filter(function(w){ return COMUNES.indexOf(w) < 0; });
    if(!q.length) return [];
    if(!exigirMinimo) minimo = Math.min(minimo, q.length);
    return dictamenes.map(function(d){
      var distintas = q.filter(function(w){ return d.raices.indexOf(w) >= 0; });
      return {d: d, n: distintas.length, p: distintas.reduce(function(s, w){ return s + (w.length > 6 ? 2 : 1); }, 0)};
    }).filter(function(x){ return x.n >= minimo; })
      .sort(function(a, b){ return b.p - a.p || b.d.anio - a.d.anio; })
      .slice(0, max).map(function(x){ return x.d; });
  }
  function mdDictamenes(lista, titulo){
    return "**" + titulo + "**\n" + lista.map(function(d){
      return "- **Oficio N° " + d.oficio + ", de " + d.fecha + ":** " + d.resumen + " [Ver en sii.cl](" + d.url + ")";
    }).join("\n") + "\n\n*Son respuestas del SII a consultas de casos concretos" + (dictRevisado ? " (lista revisada el " + dictRevisado + ")" : "") + ". Sirven de referencia; revisa el texto completo o consulta con un abogado o la Clínica Jurídica Derecho UC.*";
  }
  function conDictamenes(md, texto){
    var rel = buscarDictamenes(texto, 2, 2, true);
    return rel.length ? md + "\n\n" + mdDictamenes(rel, "Dictámenes del SII relacionados") : md;
  }
  function respuestaDictamenes(texto){
    if(!dictamenes) cargarDictamenes();
    if(!dictamenes.length) return "Todavía no tengo cargados los dictámenes del SII. Puedes revisarlos en el [índice de jurisprudencia del SII](https://www.sii.cl/normativa_legislacion/jurisprudencia_administrativa/indice_jadm.htm), sección *Otras Normas*.";
    var lista = buscarDictamenes(texto, 4, 1);
    if(lista.length) return mdDictamenes(lista, "Dictámenes del SII sobre lo que preguntas");
    return mdDictamenes(dictamenes.slice(0, 5), "Dictámenes más recientes del SII sobre herencias") +
      "\n\nTengo " + dictamenes.length + " en total. Pregúntame por un tema, por ejemplo: \"¿hay dictámenes sobre sepulturas?\"";
  }

  /* ---------- Conversaciones guiadas ---------- */
  var flujo = null;   // {tipo, paso, datos}

  var PREGUNTAS_CASO = [
    {clave: "testamento", texto: "Vamos por partes. **¿La persona fallecida dejó testamento?**", opciones: ["No dejó testamento", "Sí, dejó testamento", "No lo sé"]},
    {clave: "posesion", texto: "**¿Ya tienen la posesión efectiva concedida por el Registro Civil?**", opciones: ["Sí, ya la tenemos", "Está en trámite", "Todavía no"]},
    {clave: "plazo", texto: "**¿Cuándo falleció?**", opciones: ["Hace menos de 2 años", "Hace más de 2 años"]},
    {clave: "casado", texto: "**¿Estaba casado o con acuerdo de unión civil al morir?**", opciones: ["Sí", "No", "No lo sé"]},
    {clave: "complejo", texto: "**¿Hay alguno de estos elementos?** Predio agrícola, sociedades o empresas, bienes en el extranjero, donaciones en vida, conflicto entre herederos o algún heredero que murió después.", opciones: ["Ninguno", "Sí, alguno"]}
  ];
  function pasoCaso(t){
    var d = flujo.datos, p = PREGUNTAS_CASO[flujo.paso];
    if(t != null){
      var i = -1;
      for(var k = 0; k < p.opciones.length; k++) if(norm(p.opciones[k]) === t) i = k;
      if(i < 0){
        if(/ (no se|nose|ni idea|no estoy segur)/.test(t)) i = p.opciones.length - 1;
        else if(/ (no|nada|ninguno|ninguna|todavia|aun no) /.test(t)) i = p.clave === "testamento" ? 0 : p.clave === "posesion" ? 2 : p.clave === "plazo" ? 0 : p.clave === "complejo" ? 0 : 1;
        else if(/ (si|ya|tenemos|dejo|hay|alguno|mas de) /.test(t)) i = p.clave === "testamento" ? 1 : p.clave === "plazo" ? 1 : p.clave === "complejo" ? 1 : 0;
        else if(/ (tramite|tramitando) /.test(t) && p.clave === "posesion") i = 1;
      }
      if(i < 0) return {md: "No te entendí. Elige una de las opciones:", opciones: p.opciones};
      d[p.clave] = i;
      if(p.clave === "testamento" && i === 1){ flujo = null; return {md: TESTAMENTO, opciones: ["Hablar con una persona"]}; }
      flujo.paso++;
      if(flujo.paso >= PREGUNTAS_CASO.length) return resumenCaso(d);
      p = PREGUNTAS_CASO[flujo.paso];
    }
    var pre = d.testamento === 2 && flujo.paso === 1 ? "Si no estás seguro, confírmalo con un abogado o la Clínica Jurídica Derecho UC: con testamento la ruta es otra. Sigo suponiendo que no hay.\n\n" : "";
    return {md: pre + p.texto, opciones: p.opciones};
  }
  function resumenCaso(d){
    flujo = null;
    var listo = [], falta = [], paso;
    listo.push("Es una herencia **intestada**" + (d.testamento === 2 ? " (por confirmar)" : "") + ": te sirve esta guía y el formulario de herencias intestadas del SII.");
    if(d.posesion === 0){ listo.push("Tienen la **posesión efectiva**: puedes declarar ante el SII."); }
    else { falta.push("La **posesión efectiva** del Registro Civil" + (d.posesion === 1 ? " (en trámite)" : "") + ". Sin ella no se puede completar el formulario del SII."); }
    if(d.plazo === 1) falta.push("Ojo: pasaron **más de 2 años**: si había impuesto, se deben **intereses**. Revisa también con un abogado o la Clínica Jurídica Derecho UC los plazos del SII para cobrar (3 o 6 años). Conviene hacerlo cuanto antes.");
    if(d.casado === 0) falta.push("Definir el **régimen matrimonial**: en sociedad conyugal, solo la mitad del patrimonio común es herencia.");
    if(d.casado === 2) falta.push("Confirmar el **estado civil** con el certificado de matrimonio: si lo cambias a mitad del formulario, se borran los bienes.");
    falta.push("Reunir las **boletas** y comprobantes de funeral, última enfermedad y deudas para descontarlas.");
    if(d.complejo === 1) falta.push("Tu caso tiene elementos que **requieren asesoría profesional**: pide orientación a un abogado o a la Clínica Jurídica Derecho UC. [Ver dónde pedir ayuda](#ayuda)");
    if(d.posesion !== 0) paso = "Completa la posesión efectiva en el Registro Civil, con el inventario valorizado a la fecha del fallecimiento. Guárdalo: lo vas a reutilizar en el SII.";
    else if(d.complejo === 1) paso = "Pide orientación a un abogado o a la Clínica Jurídica Derecho UC antes de declarar.";
    else paso = "Calcula si te toca pagar con la [calculadora](#calculadora). Después entra al formulario del SII con tu ClaveÚnica.";
    var md = "### Resumen de tu caso\n**Qué tienes listo:**\n" + listo.map(function(x){ return "- " + x; }).join("\n") +
      "\n\n**Qué te falta:**\n" + falta.map(function(x){ return "- " + x; }).join("\n") +
      "\n\n**Próximo paso recomendado:** " + paso + CIERRE_NOTA;
    return {md: md, opciones: d.complejo === 1 ? ["Hablar con una persona"] : ["Guiar Formulario 4412", "¿Cuánto pago?"]};
  }

  function pasoFormulario(t){
    if(t != null){
      if(/ (terminar|salir|listo|basta|no) /.test(t)){ flujo = null; return {md: "Perfecto. Si te quedas en alguna sección, pregúntame por ella. [Ver la explicación completa del formulario](#formulario)"}; }
      flujo.paso++;
    }
    var i = flujo.paso;
    if(i >= FORMULARIO.length){
      flujo = null;
      return {md: "Eso es todo el formulario. Antes de **Enviar**, revisa que los correos coincidan, que las fechas estén en formato dd/mm/aaaa, que cada asignatario tenga parentesco y que cada bien esté en su categoría. Si te falta algo, usa **Guardar** como borrador." + CIERRE_NOTA, opciones: ["Pago y certificado"]};
    }
    var md = (i === 0 ? "Te guío por las **9 secciones** del formulario de herencias intestadas.\n\n" : "") + FORMULARIO[i] + "\n\n*Sección " + (i + 1) + " de 9.*";
    return {md: md, opciones: i < FORMULARIO.length - 1 ? ["Siguiente sección", "Terminar"] : ["Terminar"]};
  }

  /* ---------- Cerebro del asistente ---------- */
  function iniciarAccion(id){
    if(id === "caso"){ flujo = {tipo: "caso", paso: 0, datos: {}}; return pasoCaso(null); }
    if(id === "formulario"){ flujo = {tipo: "formulario", paso: 0}; return pasoFormulario(null); }
    if(id === "definiciones") return {md: DEFINICIONES};
    if(id === "persona") return {md: contactoMd()};
    for(var i = 0; i < TEMAS.length; i++) if(TEMAS[i].id === id) return {md: TEMAS[i].fn ? TEMAS[i].fn() : TEMAS[i].md, opciones: TEMAS[i].opciones};
    return null;
  }

  function responder(texto){
    var t = norm(texto);
    var aviso = "";
    if(/\b\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]\b/.test(texto) || / (contrasena|mi clave es|password|rut es)/.test(t)){
      aviso = "*Por seguridad, no compartas tu RUT completo, claves ni números de cuenta: no los necesito.*\n\n";
    }

    // Botones fijos que funcionan en cualquier momento
    for(var b = 0; b < INICIADORES.length; b++){
      if(norm(INICIADORES[b][0]) === t){ flujo = null; return iniciarAccion(INICIADORES[b][1]); }
    }
    if(t === norm("Hablar con una persona")){ flujo = null; return {md: contactoMd()}; }

    // Conversación guiada en curso
    if(flujo && flujo.tipo === "caso"){ var rc = pasoCaso(t); if(rc.md.indexOf("No te entendí") < 0 || t.split(" ").length < 6) return rc; flujo = null; }
    if(flujo && flujo.tipo === "formulario"){
      if(/ (siguiente|seguir|sigue|continuar|continua|dale|ok|si|terminar|salir|listo|basta|no) /.test(t) && t.split(" ").length < 6) return pasoFormulario(t);
      flujo = null;
    }
    if(flujo && flujo.tipo === "calculo"){
      var pend = flujo; flujo = null;
      var mNuevo = leerMonto(texto), pNuevo = leerParentesco(t);
      // Si la respuesta no trae ni monto ni parentesco, es otra pregunta: se atiende normalmente
      var m2 = mNuevo || pend.monto, p2 = pNuevo || pend.par;
      if(!mNuevo && !pNuevo){ m2 = p2 = null; }
      if(m2 && p2) return {md: aviso + calculo(m2, p2)};
      if(!m2 && p2){ flujo = {tipo: "calculo", par: p2}; return {md: "Ahora dime **cuánto te toca a ti**, en pesos (por ejemplo: \"30 millones\")."}; }
      if(m2 && !p2){ flujo = {tipo: "calculo", monto: m2}; return {md: "¿Qué eras de la persona que falleció?", opciones: PARENTESCOS.map(function(p){ return p.nombre; })}; }
    }

    // Información extra cargada a mano por el equipo: tiene prioridad
    var extra = buscarInfoExtra(t);
    if(extra) return {md: aviso + extra};

    // Pregunta directa por dictámenes u oficios del SII
    if(/ (dictamen\w*|oficios?|jurisprudencia|criterio del sii|que (ha )?dicho el sii|pronunciamientos?|que dice el sii) /.test(t)){
      return {md: aviso + respuestaDictamenes(texto)};
    }

    // "¿Qué es…?" / "¿Qué significa…?": primero el diccionario de la guía
    if(/^ (que es|que son|que significa|a que se refiere|define|definicion de) /.test(t)){
      var def = buscarEnGuia(texto);
      if(def) return {md: aviso + def};
    }

    // Reparto o cálculo con cifras
    var monto = leerMonto(texto);
    var nHijos = leerHijos(t);
    var quiereCalculo = / (cuanto (pago|pagaria|pagamos|tengo que pagar|debo pagar|sale el impuesto)|calcul\w*|impuesto|pagar|pago|me toca|toca|estimacion|exento|exenta)/.test(t) &&
      !/ (cuotas?|anualidades|giros?|comprobante|certificado|plazo|en linea|donde se paga|como (se )?pag)/.test(t);
    if(monto && monto.pesos && nHijos > 0){
      // Quien falleció no cuenta como cónyuge sobreviviente ("murió mi mamá")
      var sinFallecido = t.replace(/ (murio|fallecio|muerte de|herencia de) (mi |el |la )?\w+/g, " ").replace(/ mi \w+ (murio|fallecio)/g, " ");
      var conConyuge = / (conyuge|espos[oa]|viud[oa]|mama|papa|marido|conviviente civil) /.test(sinFallecido) && !/ sin (conyuge|espos)/.test(t);
      return {md: aviso + reparto(monto.pesos, nHijos, conConyuge)};
    }
    if(quiereCalculo || (monto && leerParentesco(t))){
      var par = leerParentesco(t);
      if(monto && par) return {md: aviso + calculo(monto, par)};
      if(monto){ flujo = {tipo: "calculo", monto: monto}; return {md: aviso + "Para estimarlo necesito tu parentesco. **¿Qué eras de la persona que falleció?**", opciones: PARENTESCOS.map(function(p){ return p.nombre; })}; }
      if(par && quiereCalculo){ flujo = {tipo: "calculo", par: par}; return {md: aviso + "Como " + par.nombre.toLowerCase() + " tu exención es de **" + par.exen + " UTM** (≈ " + pesos(par.exen * cfg.utm) + ")" + (par.rec ? " y llevas un recargo de " + (par.rec * 100) + "%" : "") + ". **¿Cuánto te toca a ti**, en pesos? Si solo sabes el total de la herencia, dime el total y cuántos hijos hay."}; }
      if(/ (cuanto|calcul\w*) /.test(t)){ flujo = {tipo: "calculo"}; return {md: aviso + "Te ayudo a estimarlo. **¿Qué eras de la persona que falleció?**", opciones: PARENTESCOS.map(function(p){ return p.nombre; })}; }
    }

    // ¿Dónde se declara un bien?
    var quiereBien = / (declar\w*|categoria|donde (va|van|pongo|ingreso)|valor\w*|avaluo|tasacion|formulario|como (pongo|ingreso))/.test(t);
    var rb = respuestaBienes(t);
    if(rb && (quiereBien || t.split(" ").length <= 6)) return {md: aviso + conDictamenes(rb, texto)};

    // Temas conocidos: gana el que más coincide
    var mejor = null, puntos = 0;
    TEMAS.forEach(function(tema){
      var p = 0;
      tema.re.forEach(function(re){ if(re.test(t)) p++; });
      if(p > puntos){ puntos = p; mejor = tema; }
    });
    if(mejor){
      var mdTema = mejor.fn ? mejor.fn() : mejor.md;
      if(!/^(saludo|gracias|quien|persona)$/.test(mejor.id)) mdTema = conDictamenes(mdTema, texto);
      return {md: aviso + mdTema, opciones: mejor.opciones};
    }
    if(rb) return {md: aviso + conDictamenes(rb, texto)};

    // Diccionario y resto de la guía
    var g = buscarEnGuia(texto);
    if(g) return {md: aviso + conDictamenes(g, texto)};

    // Algún dictamen del SII que calce con la pregunta
    var dic = buscarDictamenes(texto, 3, 2);
    if(dic.length) return {md: aviso + mdDictamenes(dic, "La guía no trata esto, pero el SII se pronunció en estos dictámenes")};

    // Fuera de tema o no entendido
    return {md: aviso + "No encontré eso en la guía. Solo puedo ayudarte con la **posesión efectiva y el impuesto a las herencias**. Prueba preguntando, por ejemplo:\n- \"¿Dónde declaro el auto?\"\n- \"Soy hijo y me tocan 50 millones, ¿cuánto pago?\"\n- \"¿Qué gastos puedo descontar?\"",
      opciones: ["Revisar mi caso", "Hablar con una persona"]};
  }

  /* ---------- Pintar mensajes ---------- */
  function filaBot(html){
    var f = document.createElement("div");
    f.className = "sia-fila bot";
    f.innerHTML = '<span class="sia-mini" aria-hidden="true">' + AVATAR + '</span><div class="sia-msg">' + html + "</div>";
    cuerpo.appendChild(f);
    return f;
  }
  function filaUsuario(t){
    var f = document.createElement("div");
    f.className = "sia-fila usuario";
    var m = document.createElement("div");
    m.className = "sia-msg";
    m.textContent = t;
    f.appendChild(m);
    cuerpo.appendChild(f);
    return f;
  }
  function botones(opciones){
    if(!opciones || !opciones.length) return;
    var cont = document.createElement("div");
    cont.className = "sia-rapidas";
    opciones.forEach(function(texto){
      var b = document.createElement("button");
      b.type = "button";
      b.className = "sia-rapida" + (texto === "Hablar con una persona" ? " sia-persona" : "");
      b.textContent = texto;
      b.addEventListener("click", function(){ enviar(texto); });
      cont.appendChild(b);
    });
    cuerpo.appendChild(cont);
  }
  function alFinal(){ cuerpo.scrollTop = cuerpo.scrollHeight; }
  function alInicioDe(el){ cuerpo.scrollTop = Math.max(0, el.offsetTop - 10); }

  function bienvenida(){
    filaBot("<p>Hola, soy <strong>SIILV-I.A</strong>, el asistente de esta guía. Te oriento para declarar el impuesto a las herencias ante el SII: Formulario 4412, pago y certificado.</p><p>Elige una opción o escribe tu pregunta.</p>");
    botones(INICIADORES.map(function(it){ return it[0]; }).concat(["Hablar con una persona"]));
  }

  function escribiendo(){
    var f = filaBot('<span class="sia-escribiendo" role="img" aria-label="El asistente está escribiendo"><i></i><i></i><i></i></span>');
    alFinal();
    return f;
  }
  function quitar(f){ if(f && f.parentNode) f.parentNode.removeChild(f); }

  function ocupado(si){
    esperando = si;
    btnEnviar.disabled = si;
    Array.prototype.forEach.call(cuerpo.querySelectorAll(".sia-rapida"), function(b){ b.disabled = si; });
  }

  function guardarHistorial(){ guardarSesion(CLAVE_CONVERSACION, JSON.stringify(historial.slice(-30))); }
  function cargarHistorial(){
    try{
      var datos = JSON.parse(leerSesion(CLAVE_CONVERSACION) || "[]");
      if(!Array.isArray(datos)) return;
      historial = datos.filter(function(m){
        return m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string";
      });
    }catch(e){ historial = []; }
  }

  function enviar(texto){
    texto = String(texto || "").trim();
    if(!texto || esperando) return;
    filaUsuario(texto);
    caja.value = "";
    ajustarCaja();
    alFinal();
    historial.push({role: "user", content: texto});
    ocupado(true);
    var miConversacion = conversacion;
    var indicador = escribiendo();
    var r;
    try{ r = responder(texto); }
    catch(e){ r = {md: "Tuve un problema para responder eso. Prueba con otras palabras o usa el botón «Hablar con una persona».", opciones: ["Hablar con una persona"]}; }
    setTimeout(function(){
      if(miConversacion !== conversacion) return;
      quitar(indicador);
      historial.push({role: "assistant", content: r.md});
      guardarHistorial();
      var f = filaBot(markdown(r.md));
      botones(r.opciones);
      ocupado(false);
      alInicioDe(f);
    }, 350 + Math.min(r.md.length, 900) / 3);
  }

  /* ---------- Abrir, cerrar y reiniciar ---------- */
  function iniciar(){
    iniciado = true;
    cargarHistorial();
    bienvenida();
    historial.forEach(function(m){
      if(m.role === "user") filaUsuario(m.content);
      else filaBot(markdown(m.content));
    });
  }
  function abrir(){
    if(!iniciado) iniciar();
    panel.hidden = false;
    lanzador.setAttribute("aria-expanded", "true");
    lanzador.setAttribute("aria-label", "Cerrar el asistente");
    document.documentElement.classList.add("sia-abierto");
    punto.hidden = true;
    guardarSesion(CLAVE_VISTO, "1");
    alFinal();
    if(!esCelular()) setTimeout(function(){ caja.focus(); }, 30);
  }
  function cerrar(devolverFoco){
    panel.hidden = true;
    lanzador.setAttribute("aria-expanded", "false");
    lanzador.setAttribute("aria-label", "Abrir el asistente SIILV-I.A");
    document.documentElement.classList.remove("sia-abierto");
    if(devolverFoco) lanzador.focus();
  }
  function reiniciar(){
    conversacion++;
    historial = [];
    flujo = null;
    guardarHistorial();
    ocupado(false);
    cuerpo.innerHTML = "";
    bienvenida();
    alFinal();
  }

  /* ---------- Caja de texto ---------- */
  function ajustarCaja(){
    caja.style.height = "auto";
    caja.style.height = Math.min(Math.max(caja.scrollHeight + 2, 42), 120) + "px";
  }

  lanzador.addEventListener("click", function(){ panel.hidden ? abrir() : cerrar(false); });
  document.getElementById("siaCerrar").addEventListener("click", function(){ cerrar(true); });
  document.getElementById("siaNueva").addEventListener("click", reiniciar);
  panel.addEventListener("keydown", function(e){ if(e.key === "Escape") cerrar(true); });
  form.addEventListener("submit", function(e){ e.preventDefault(); enviar(caja.value); });
  caja.addEventListener("input", ajustarCaja);
  caja.addEventListener("keydown", function(e){
    if(e.key === "Enter" && !e.shiftKey && !e.isComposing){ e.preventDefault(); enviar(caja.value); }
  });
  /* En el celular, al tocar un enlace a una sección de la guía se cierra la ventana para mostrarla */
  cuerpo.addEventListener("click", function(e){
    var enlace = e.target.closest && e.target.closest(".sia-enlace");
    if(!enlace) return;
    if(typeof cfg.irASeccion === "function") cfg.irASeccion(enlace.getAttribute("data-ir"));
    if(esCelular()) cerrar(false);
  });

  if(leerSesion(CLAVE_VISTO)) punto.hidden = true;

  if(cfg.urlDictamenes && window.fetch){
    fetch(cfg.urlDictamenes).then(function(r){ return r.json(); }).then(function(d){
      var b = document.getElementById("siaDictamenes");
      if(!b){ b = document.createElement("script"); b.type = "application/json"; b.id = "siaDictamenes"; document.body.appendChild(b); }
      b.textContent = JSON.stringify(d);
      dictamenes = null;
    }).catch(function(){});
  }
})();
