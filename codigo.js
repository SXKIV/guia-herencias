(function(){
  "use strict";

  // ===== UTM: este es el único lugar que hay que cambiar cada mes =====
  // valor: en pesos, sin puntos. mes: en minúscula. anio: también arma los links del SII.
  var UTM = {valor: 71721, mes: "septiembre", anio: 2026};
  window.UTM_GUIA = UTM; // el asistente (asistente.js) usa este mismo valor

  // Escribe la UTM, su mes, los montos en pesos y los links del SII en todo el sitio.
  // Los montos se marcan en el HTML con data-utm-por="cuántas UTM" y, si van redondeados,
  // data-redondeo="a qué múltiplo".
  function escribirUTM(){
    var mesTexto = UTM.mes + " de " + UTM.anio;
    var link = "https://www.sii.cl/valores_y_fechas/utm/utm" + UTM.anio + ".htm";
    Array.prototype.forEach.call(document.querySelectorAll('[data-utm="mes"]'), function(el){ el.textContent = mesTexto; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-utm="valor"]'), function(el){ el.textContent = pesos(UTM.valor); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-utm="link"]'), function(el){ el.href = link; });
    Array.prototype.forEach.call(document.querySelectorAll("[data-utm-por]"), function(el){
      var monto = parseFloat(el.getAttribute("data-utm-por")) * UTM.valor;
      var redondeo = parseFloat(el.getAttribute("data-redondeo")) || 1;
      el.textContent = pesos(Math.round(monto / redondeo) * redondeo);
    });
  }
  escribirUTM();

  var pantallas = Array.prototype.slice.call(document.querySelectorAll(".pantalla"));
  var topbar = document.getElementById("topbar");
  var rutaActual = document.getElementById("rutaActual");
  var rutaElegida = null;

  var fBasico = document.getElementById("fBasico");
  var fTodo = document.getElementById("fTodo");
  var notaFiltro = document.getElementById("notaFiltro");

  function aplicarFiltro(modo){
    var entradas = document.querySelectorAll("#glosario details");
    Array.prototype.forEach.call(entradas, function(d){
      d.hidden = (modo === "basico" && d.getAttribute("data-nivel") === "tecnico");
    });
    fBasico.setAttribute("aria-pressed", modo === "basico" ? "true" : "false");
    fTodo.setAttribute("aria-pressed", modo === "todo" ? "true" : "false");
    notaFiltro.textContent = modo === "basico"
      ? "Estás viendo las entradas esenciales. Las técnicas usan lenguaje jurídico y citan las normas; puedes verlas apretando \u201cTodas\u201d."
      : "Estás viendo todas las entradas, incluidas las técnicas, con su norma y su efecto en el formulario.";
  }
  fBasico.addEventListener("click", function(){ aplicarFiltro("basico"); });
  fTodo.addEventListener("click", function(){ aplicarFiltro("todo"); });

  var navItems = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));
  var TITULO_BASE = document.title;
  // enfocar: al navegar con los botones, el foco pasa al título de la
  // sección (para teclado y lector de pantalla). Al cargar la página, no.
  function mostrar(id, enfocar){
    pantallas.forEach(function(p){ p.hidden = (p.id !== id); });
    if(id === "inicio"){
      rutaElegida = null;
      document.documentElement.style.setProperty("--ruta","var(--verde)");
    }
    document.body.setAttribute("data-pantalla", id);
    navItems.forEach(function(n){
      if(n.getAttribute("data-nav") === id) n.setAttribute("aria-current","page");
      else n.removeAttribute("aria-current");
    });
    if(id === "menu-usuario"){ rutaElegida = "usuario"; document.documentElement.style.setProperty("--ruta","var(--verde)"); }
    if(id === "menu-estudiante"){ rutaElegida = "estudiante"; document.documentElement.style.setProperty("--ruta","var(--azul)"); }
    topbar.hidden = (id === "inicio");
    rutaActual.textContent = id === "inicio" ? "" : (rutaElegida === "estudiante" ? "Asistiendo un caso" : "Haciendo el trámite");
    if(id === "conceptos") aplicarFiltro(rutaElegida === "estudiante" ? "todo" : "basico");
    var h1 = document.querySelector("#" + id + " h1");
    document.title = (id === "inicio" || !h1) ? TITULO_BASE : h1.textContent + " · " + TITULO_BASE;
    window.scrollTo(0,0);
    if(enfocar && h1){
      h1.setAttribute("tabindex","-1");
      try{ h1.focus({preventScroll:true}); }catch(e){ h1.focus(); }
    }
  }

  // Cada sección tiene su propia dirección (index.html#calculadora).
  // Cambiar de sección cambia la dirección, y el navegador lo anota en su
  // historial: así el botón atrás del navegador y "Volver" hacen lo mismo.
  // En cada paso del historial se guarda su posición dentro de la guía
  // (0, 1, 2...), para que "Volver" nunca saque a la persona del sitio.
  var posicion = 0;

  function pantallaDeLaDireccion(){
    var id = decodeURIComponent(location.hash.slice(1));
    var existe = pantallas.some(function(p){ return p.id === id; });
    return existe ? id : "inicio";
  }

  function anotarPosicion(nueva){
    var estado = history.state;
    if(estado && typeof estado.posicion === "number"){ posicion = estado.posicion; return; }
    posicion = nueva;
    try { history.replaceState({posicion: posicion}, ""); } catch(err){}
  }

  function ir(id){
    if(location.hash === "#" + id) mostrar(id, true);
    else location.hash = id;
  }

  window.addEventListener("hashchange", function(){
    anotarPosicion(posicion + 1);
    mostrar(pantallaDeLaDireccion(), true);
  });

  document.addEventListener("click", function(e){
    var b = e.target.closest("[data-ir]");
    if(!b) return;
    ir(b.getAttribute("data-ir"));
  });

  document.getElementById("btnVolver").addEventListener("click", function(){
    if(posicion > 0) history.back();
    else ir("inicio");
  });

  function pesos(n){ return "$" + Math.round(n).toLocaleString("es-CL"); }

  /* =========================================================
     CALCULADORA SIIMPLE (v3)
     Una sola función, calcular(), produce TODO lo que se muestra:
     el veredicto, el esquema visual, la tabla de la familia,
     la casilla del Registro Civil y el desglose en texto.
     Así el esquema y las cifras no pueden diferir.
     ========================================================= */
  (function calculadoraSIIMPLE(){
    var app = document.getElementById("calcApp");
    if(!app) return;

    /* ---------- Datos ---------- */
    // UTM mensual en pesos (enero a diciembre). Fuente: sii.cl, valores_y_fechas/utm/utm20XX.htm
    // (2019, 2022, 2023, 2024, 2025 y 2026 contrastados con el SII; 2020, 2021 y diciembre de 2025
    // tomados de calcular.cl). Se llama UTM_MENSUAL para no confundirla con la UTM del
    // comienzo de codigo.js. Cada mes, agregar aquí el valor nuevo (ver más abajo).
    var UTM_MENSUAL = {
      2019:[48353,48305,48353,48353,48595,48741,49033,49033,49131,49229,49229,49623],
      2020:[49673,49723,50021,50221,50372,50372,50322,50272,50322,50372,50674,51029],
      2021:[50978,51131,51489,51592,51798,52005,52161,52213,52631,52842,53476,54171],
      2022:[54442,54878,55537,55704,56762,57557,58248,58772,59595,60310,60853,61157],
      2023:[61769,61954,62450,62388,63074,63263,63326,63199,63452,63515,63960,64216],
      2024:[64666,64343,64793,65182,65443,65770,65967,65901,66362,66561,66628,67294],
      2025:[67429,67294,68034,68306,68648,68785,68923,68647,69265,69265,69542,69542],
      2026:[69751,69611,69889,69889,70588,71506,71649,71649,71721,72151,72440,null]
    };
    // Art. 2 Ley 16.271: escala en UTA convertida a UTM (1 UTA = 12 UTM). [tope, tasa, deducción]
    var TRAMOS = [[960,.01,0],[1920,.025,14.4],[3840,.05,62.4],[5760,.075,158.4],
                  [7680,.10,302.4],[9600,.15,686.4],[14400,.20,1166.4],[Infinity,.25,1886.4]];
    var EXENCION = {hijo:600, conyuge:600, ascendiente:600, hermano:60, medio:60, col34:60, col56:0};
    var RECARGO  = {hijo:0, conyuge:0, ascendiente:0, hermano:20, medio:20, col34:20, col56:40};
    var NOMBRE = {hijo:"hijo o hija", conyuge:"cónyuge o conviviente civil", ascendiente:"padre, madre o abuelo",
                  hermano:"hermano de padre y madre", medio:"medio hermano", col34:"colateral de 3.º o 4.º grado",
                  col56:"colateral de 5.º o 6.º grado"};
    var LEY = "https://www.sii.cl/normativa_legislacion/ley16271.pdf";
    var CIRC33 = "https://www.sii.cl/normativa_legislacion/circulares/2021/circu33.pdf";
    var CC = "https://www.bcn.cl/leychile/navegar?idNorma=172986";
    var MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    // La UTM de la línea "var UTM = ..." del comienzo de codigo.js (window.UTM_GUIA)
    // se escribe en esta tabla, en su año y mes: así, al actualizar esa línea cada mes,
    // la calculadora la recibe sola. Ese valor no queda guardado en la tabla: cuando
    // pase el mes, hay que agregarlo arriba para que siga sirviendo a quienes
    // fallecieron en ese mes.
    (function(){
      var g = window.UTM_GUIA, m = g ? MESES.indexOf(g.mes) : -1;
      if(m < 0 || !g.valor) return;
      if(!UTM_MENSUAL[g.anio]) UTM_MENSUAL[g.anio] = [null,null,null,null,null,null,null,null,null,null,null,null];
      UTM_MENSUAL[g.anio][m] = g.valor;
    })();

    /* ---------- Utilidades ---------- */
    function utmDe(anio, mes){ var a = UTM_MENSUAL[anio]; return (a && a[mes-1]) ? a[mes-1] : null; }
    function ultimaUTM(){
      var anios = Object.keys(UTM_MENSUAL).map(Number).sort(function(a,b){ return a-b; });
      for(var i = anios.length-1; i >= 0; i--){
        for(var m = 11; m >= 0; m--){ if(UTM_MENSUAL[anios[i]][m]) return {valor:UTM_MENSUAL[anios[i]][m], mes:m+1, anio:anios[i]}; }
      }
      return null;
    }
    function utmPago(hoy){
      var v = utmDe(hoy.getFullYear(), hoy.getMonth()+1);
      if(v) return {valor:v, mes:hoy.getMonth()+1, anio:hoy.getFullYear(), exacta:true};
      var u = ultimaUTM(); u.exacta = false; return u;
    }
    function aPesos(txt){
      var t = String(txt == null ? "" : txt).replace(/[\s$]/g, "");
      if(!t) return null;
      if(/[^0-9.,]/.test(t)) return NaN;
      if(t.indexOf(",") >= 0){
        t = t.replace(/\./g, "");
        if(t.split(",").length > 2) return NaN;
        t = t.replace(",", ".");
      } else {
        t = t.replace(/\./g, "");
      }
      var n = parseFloat(t);
      return isFinite(n) ? n : NaN;
    }
    function pesos(n){ return "$" + Math.round(n).toLocaleString("es-CL"); }
    function num(n, d){ return n.toLocaleString("es-CL", {minimumFractionDigits:d, maximumFractionDigits:d}); }
    function utm(n){ return num(n, 2) + " UTM"; }
    function pct(t){ return (t*100).toLocaleString("es-CL", {maximumFractionDigits:1}) + "%"; }
    function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
    function fechaTxt(d){ return d.getDate() + " de " + MESES[d.getMonth()] + " de " + d.getFullYear(); }
    function sumarAnios(d, n){ var x = new Date(d.getTime()); x.setFullYear(x.getFullYear() + n); return x; }
    function norma(t, u){ return {t:t, u:u}; }

    /* ---------- Cálculo del impuesto de UNA asignación (art. 2 Ley 16.271) ---------- */
    function impuestoAsignacion(asigPesos, rel, utmF, conDiscapacidad){
      var u = asigPesos / utmF, ex = EXENCION[rel], base = Math.max(0, u - ex);
      var r = {pesos:asigPesos, utm:u, ex:ex, base:base, tasa:0, ded:0, bruto:0, recargo:RECARGO[rel], conRecargo:0, disc:!!conDiscapacidad, total:0, tramo:null};
      if(base <= 0) return r;
      for(var i = 0; i < TRAMOS.length; i++){
        if(base <= TRAMOS[i][0]){
          r.tasa = TRAMOS[i][1]; r.ded = TRAMOS[i][2];
          r.tramo = [i === 0 ? 0 : TRAMOS[i-1][0], TRAMOS[i][0]];
          r.bruto = Math.max(0, base * r.tasa - r.ded);
          break;
        }
      }
      r.conRecargo = r.bruto * (1 + r.recargo/100);
      r.total = r.conRecargo * (r.disc ? 0.7 : 1);
      return r;
    }

    /* ---------- Preguntas por parentesco ---------- */
    var SI_NO = "sino", NUM = "num", OPC = "opc";
    var P = {
      rep: {tipo:SI_NO, texto:"¿Algún hijo o hija de la persona murió antes que ella y dejó hijos?", ayuda:"Esos nietos heredan en lugar de su padre o madre (representación). Esta calculadora no cubre ese caso."},
      cony:{tipo:SI_NO, texto:"¿Quedó cónyuge o conviviente civil sobreviviente?", ayuda:"Una pareja sin matrimonio ni acuerdo de unión civil no hereda por ley."},
      prev:{tipo:SI_NO, texto:"Al morir, ¿la persona tenía hijos, nietos, cónyuge o conviviente civil, padres o abuelos?", ayuda:"Si dejó a alguno de ellos, heredan antes que los hermanos y demás parientes."},
      hv:  {tipo:SI_NO, texto:"¿Le sobrevivió algún hermano o medio hermano?", ayuda:"Cuenta también a los que murieron después que la persona."},
      ds:  {tipo:SI_NO, texto:"¿Dejó sobrinos o sobrinos nietos (hijos o nietos de sus hermanos)?", ayuda:"Si los hay, pueden heredar en lugar de sus padres. Ese caso tiene reglas discutidas y la calculadora no lo cubre."},
      yodoble:{tipo:SI_NO, texto:"¿Tu parentesco pasa solo por hermanos de padre y madre (doble conjunción)?", ayuda:"Ejemplo: un tío que es hermano de padre y madre del padre de la persona es de doble conjunción. Si en la cadena hay un medio hermano, es de simple conjunción (art. 992 del Código Civil)."},
      cd:  {tipo:NUM, min:0, max:60, texto:"¿Cuántos parientes de tu mismo grado son de doble conjunción?", ayuda:"Contándote a ti si corresponde. Escribe 0 si no hay."},
      cs:  {tipo:NUM, min:0, max:60, texto:"¿Cuántos parientes de tu mismo grado son de simple conjunción?", ayuda:"Contándote a ti si corresponde. Escribe 0 si no hay."}
    };
    function q(base, extra){ var o = {}; var k; for(k in base) o[k] = base[k]; for(k in extra) o[k] = extra[k]; return o; }
    var FORM = {
      hijo: [
        q(P.rep, {id:"rep"}),
        q(P.cony, {id:"cony", si:function(c){ return c.rep === 0; }}),
        {id:"h", tipo:NUM, min:1, max:40, texto:"¿Cuántos hijos e hijas tenía la persona al morir, contándote a ti?", ayuda:"Cuenta también a los que murieron después que ella: su parte pasa a sus propios herederos (transmisión).", si:function(c){ return c.rep === 0; }}
      ],
      conyuge: [
        q(P.rep, {id:"rep"}),
        {id:"h", tipo:NUM, min:0, max:40, texto:"¿Cuántos hijos e hijas tenía la persona al morir?", ayuda:"Cuenta también a los que murieron después que ella. Escribe 0 si no tuvo.", si:function(c){ return c.rep === 0; }},
        {id:"a", tipo:NUM, min:0, max:8, texto:"¿Cuántos padres o abuelos de la persona vivían cuando murió?", ayuda:"Cuenta solo los del grado más cercano: si vivía al menos uno de sus padres, cuenta solo a los padres. Escribe 0 si no había.", si:function(c){ return c.rep === 0 && c.h === 0; }}
      ],
      ascendiente: [
        {id:"desc", tipo:SI_NO, texto:"¿La persona dejó hijos, hijas o nietos?", ayuda:"Si dejó descendientes, los padres y abuelos no heredan."},
        q(P.cony, {id:"cony", si:function(c){ return c.desc === 0; }}),
        {id:"a", tipo:NUM, min:1, max:8, texto:"¿Cuántos ascendientes del grado más cercano vivían cuando murió, contándote a ti?", ayuda:"Si vivía alguno de los padres, los abuelos no heredan.", si:function(c){ return c.desc === 0; }}
      ],
      hermano: [
        q(P.prev, {id:"prev"}),
        {id:"rep", tipo:SI_NO, texto:"¿Algún hermano o medio hermano murió antes que la persona y dejó hijos?", ayuda:"Esos sobrinos heredan en lugar de su padre o madre. La calculadora no cubre ese caso.", si:function(c){ return c.prev === 0; }},
        {id:"n", tipo:NUM, min:1, max:40, texto:"¿Cuántos hermanos de padre y madre le sobrevivieron, contándote a ti?", si:function(c){ return c.prev === 0 && c.rep === 0; }},
        {id:"m", tipo:NUM, min:0, max:40, texto:"¿Cuántos medio hermanos (solo de padre o solo de madre) le sobrevivieron?", ayuda:"Escribe 0 si no hay.", si:function(c){ return c.prev === 0 && c.rep === 0; }}
      ],
      medio: [
        q(P.prev, {id:"prev"}),
        {id:"rep", tipo:SI_NO, texto:"¿Algún hermano o medio hermano murió antes que la persona y dejó hijos?", ayuda:"Esos sobrinos heredan en lugar de su padre o madre. La calculadora no cubre ese caso.", si:function(c){ return c.prev === 0; }},
        {id:"n", tipo:NUM, min:0, max:40, texto:"¿Cuántos hermanos de padre y madre le sobrevivieron?", ayuda:"Escribe 0 si no hay.", si:function(c){ return c.prev === 0 && c.rep === 0; }},
        {id:"m", tipo:NUM, min:1, max:40, texto:"¿Cuántos medio hermanos le sobrevivieron, contándote a ti?", si:function(c){ return c.prev === 0 && c.rep === 0; }}
      ],
      col34: [
        {id:"grado", tipo:OPC, texto:"¿Cuál es tu parentesco?", opciones:[["3","Tío o tía de la persona (3.er grado)"],["4","Primo, prima o tío abuelo (4.º grado)"]]},
        q(P.prev, {id:"prev"}),
        q(P.hv, {id:"hv", si:function(c){ return c.prev === 0; }}),
        q(P.ds, {id:"ds", si:function(c){ return c.prev === 0 && c.hv === 0; }}),
        {id:"tio", tipo:SI_NO, texto:"¿Le sobrevivió algún tío o tía?", ayuda:"Los parientes de 3.er grado excluyen a los de 4.º.", si:function(c){ return c.grado === 4 && c.prev === 0 && c.hv === 0 && c.ds === 0; }},
        q(P.yodoble, {id:"yodoble", si:listosCol}),
        q(P.cd, {id:"cd", si:listosCol}),
        q(P.cs, {id:"cs", si:listosCol})
      ],
      col56: [
        {id:"grado", tipo:OPC, texto:"¿Cuál es tu grado de parentesco?", opciones:[["5","5.º grado (por ejemplo, primo del padre o de la madre de la persona)"],["6","6.º grado (por ejemplo, primo segundo)"]]},
        q(P.prev, {id:"prev"}),
        q(P.hv, {id:"hv", si:function(c){ return c.prev === 0; }}),
        q(P.ds, {id:"ds", si:function(c){ return c.prev === 0 && c.hv === 0; }}),
        {id:"c34", tipo:SI_NO, texto:"¿Le sobrevivió algún tío, tía, primo, prima o tío abuelo?", ayuda:"Los parientes de 3.er y 4.º grado excluyen a los más lejanos.", si:function(c){ return c.prev === 0 && c.hv === 0 && c.ds === 0; }},
        {id:"c5", tipo:SI_NO, texto:"¿Le sobrevivió algún pariente de 5.º grado?", si:function(c){ return c.grado === 6 && c.prev === 0 && c.hv === 0 && c.ds === 0 && c.c34 === 0; }},
        q(P.yodoble, {id:"yodoble", si:listosCol}),
        q(P.cd, {id:"cd", si:listosCol}),
        q(P.cs, {id:"cs", si:listosCol})
      ],
      representante: []
    };
    function listosCol(c){
      if(c.prev !== 0 || c.hv !== 0 || c.ds !== 0) return false;
      if(S.rel === "col34") return c.grado === 3 || (c.grado === 4 && c.tio === 0);
      return c.c34 === 0 && (c.grado === 5 || (c.grado === 6 && c.c5 === 0));
    }

    /* ---------- Estado ---------- */
    var S = {test:null, fecha:null, utmManual:null, rel:null, comp:{}, act:null, exentos:null, deudas:null, gastos:null,
             esp:{extranjero:false, donaciones:false, repudio:false, sociedades:false}, disc:false};
    function v(k){ var x = S.comp[k]; return (x === "" || x == null || (typeof x === "number" && isNaN(x))) ? null : x; }

    /* ---------- Quién hereda y en qué proporción (Código Civil, arts. 988 a 992) ---------- */
    function grupo(clave, nombre, rel, n, num, den, yo){ return {clave:clave, nombre:nombre, rel:rel, n:n, num:num, den:den, yo:!!yo}; }
    function noHeredas(m, n){ return {estado:"no_heredas", motivo:m, norma:n}; }
    function derivar(m, n){ return {estado:"derivar", motivo:m, norma:n}; }
    function falta(m){ return {estado:"incompleto", motivo:m}; }
    function entero(x, min){ return x !== null && Math.floor(x) === x && x >= min; }

    function primerOrden(h, cony, yo){
      // art. 988: el cónyuge lleva el doble que cada hijo; si hay un solo hijo, lo mismo; nunca menos de un cuarto.
      var g = [];
      if(!cony){
        g.push(grupo("hijos", "Hijos e hijas", "hijo", h, 1, h, yo === "hijo"));
        return {estado:"ok", grupos:g, regla:"Sin cónyuge, la herencia se divide en partes iguales entre los " + h + " hijos.", norma:"Código Civil, art. 988"};
      }
      if(h === 1){
        g.push(grupo("hijos", "Hijo o hija", "hijo", 1, 1, 2, yo === "hijo"));
        g.push(grupo("conyuge", "Cónyuge o conviviente civil", "conyuge", 1, 1, 2, yo === "conyuge"));
        return {estado:"ok", grupos:g, regla:"Con un hijo y cónyuge, cada uno recibe la mitad.", norma:"Código Civil, art. 988"};
      }
      if(h <= 6){
        g.push(grupo("hijos", "Hijos e hijas", "hijo", h, 1, h+2, yo === "hijo"));
        g.push(grupo("conyuge", "Cónyuge o conviviente civil", "conyuge", 1, 2, h+2, yo === "conyuge"));
        return {estado:"ok", grupos:g, regla:"El cónyuge lleva el doble que cada hijo: la herencia se divide en " + (h+2) + " partes; cada hijo recibe 1 y el cónyuge 2.", norma:"Código Civil, art. 988"};
      }
      g.push(grupo("hijos", "Hijos e hijas", "hijo", h, 3, 4*h, yo === "hijo"));
      g.push(grupo("conyuge", "Cónyuge o conviviente civil", "conyuge", 1, 1, 4, yo === "conyuge"));
      return {estado:"ok", grupos:g, regla:"Con 7 hijos o más, el doble de un hijo quedaría bajo un cuarto: el cónyuge lleva un cuarto y el resto se divide en partes iguales entre los hijos.", norma:"Código Civil, art. 988"};
    }

    function familia(){
      var r = S.rel;
      if(r === "representante") return derivar("Si tu padre o madre murió antes que la persona, heredas en su lugar (representación): el reparto es por estirpes y el impuesto se calcula como si heredara él o ella. Si murió después, sin alcanzar a aceptar, recibes su derecho a aceptar la herencia (transmisión) y normalmente hay que tramitar dos posesiones efectivas. Si eres sobrino o sobrina y ningún hermano de la persona sobrevive, además hay fallos contradictorios sobre cómo repartir. La calculadora no cubre estos casos: revísalos con la clínica.", "Código Civil, arts. 984 a 986; Ley 16.271, art. 3");
      var c = {};
      (FORM[r] || []).forEach(function(p){ c[p.id] = v(p.id); });
      if(r === "hijo"){
        if(c.rep === null) return falta("Responde si algún hijo murió antes dejando hijos.");
        if(c.rep === 1) return derivar("Si un hijo murió antes dejando hijos, esos nietos heredan por representación: reciben entre todos la parte de su padre o madre y pagan el impuesto que a él le habría correspondido. La calculadora no cubre este caso.", "Código Civil, arts. 984 a 986; Ley 16.271, art. 3");
        if(c.cony === null) return falta("Responde si quedó cónyuge o conviviente civil.");
        if(!entero(c.h, 1)) return falta("Indica cuántos hijos tenía al morir, contándote a ti (un número entero, mínimo 1).");
        return primerOrden(c.h, c.cony === 1, "hijo");
      }
      if(r === "conyuge"){
        if(c.rep === null) return falta("Responde si algún hijo murió antes dejando hijos.");
        if(c.rep === 1) return derivar("Si un hijo murió antes dejando hijos, esos nietos heredan por representación junto contigo. La calculadora no cubre este caso.", "Código Civil, arts. 984 a 986; Ley 16.271, art. 3");
        if(!entero(c.h, 0)) return falta("Indica cuántos hijos dejó (un número entero; 0 si no tuvo).");
        if(c.h >= 1) return primerOrden(c.h, true, "conyuge");
        if(!entero(c.a, 0)) return falta("Indica cuántos padres o abuelos vivían cuando murió (0 si no había).");
        if(c.a === 0) return {estado:"ok", grupos:[grupo("conyuge", "Cónyuge o conviviente civil", "conyuge", 1, 1, 1, true)], regla:"Sin hijos ni ascendientes, el cónyuge recibe toda la herencia.", norma:"Código Civil, art. 989"};
        return {estado:"ok", grupos:[grupo("conyuge", "Cónyuge o conviviente civil", "conyuge", 1, 2, 3, true), grupo("asc", "Padres o abuelos", "ascendiente", c.a, 1, 3*c.a, false)], regla:"Sin hijos, el cónyuge lleva dos tercios y el tercio restante se reparte entre " + c.a + " ascendiente" + (c.a>1?"s":"") + ".", norma:"Código Civil, art. 989"};
      }
      if(r === "ascendiente"){
        if(c.desc === null) return falta("Responde si la persona dejó hijos o nietos.");
        if(c.desc === 1) return noHeredas("Si la persona dejó hijos o nietos, sus padres y abuelos no heredan: la ley llama primero a los descendientes.", "Código Civil, arts. 988 y 989");
        if(c.cony === null) return falta("Responde si quedó cónyuge o conviviente civil.");
        if(!entero(c.a, 1)) return falta("Indica cuántos ascendientes del grado más cercano vivían cuando murió, contándote a ti.");
        if(c.cony === 1) return {estado:"ok", grupos:[grupo("asc", "Padres o abuelos", "ascendiente", c.a, 1, 3*c.a, true), grupo("conyuge", "Cónyuge o conviviente civil", "conyuge", 1, 2, 3, false)], regla:"Sin hijos, el cónyuge lleva dos tercios y el tercio restante se divide entre " + c.a + " ascendiente" + (c.a>1?"s":"") + ".", norma:"Código Civil, art. 989"};
        return {estado:"ok", grupos:[grupo("asc", "Padres o abuelos", "ascendiente", c.a, 1, c.a, true)], regla:"Sin hijos ni cónyuge, la herencia se divide en partes iguales entre los ascendientes del grado más cercano.", norma:"Código Civil, art. 989"};
      }
      if(r === "hermano" || r === "medio"){
        if(c.prev === null) return falta("Responde si quedaron hijos, nietos, cónyuge, padres o abuelos.");
        if(c.prev === 1) return noHeredas("Si la persona dejó hijos, nietos, cónyuge o conviviente civil, padres o abuelos, ellos heredan antes que los hermanos.", "Código Civil, arts. 988 a 990");
        if(c.rep === null) return falta("Responde si algún hermano murió antes dejando hijos.");
        if(c.rep === 1) return derivar("Si un hermano murió antes dejando hijos, esos sobrinos heredan en su lugar (representación). La calculadora no cubre este caso.", "Código Civil, arts. 986 y 990; Ley 16.271, art. 3");
        var minN = r === "hermano" ? 1 : 0, minM = r === "medio" ? 1 : 0;
        if(!entero(c.n, minN)) return falta(r === "hermano" ? "Indica cuántos hermanos de padre y madre le sobrevivieron, contándote a ti." : "Indica cuántos hermanos de padre y madre le sobrevivieron (0 si no hay).");
        if(!entero(c.m, minM)) return falta(r === "medio" ? "Indica cuántos medio hermanos le sobrevivieron, contándote a ti." : "Indica cuántos medio hermanos le sobrevivieron (0 si no hay).");
        var partes = 2*c.n + c.m, g = [];
        if(c.n > 0) g.push(grupo("herm", "Hermanos de padre y madre", "hermano", c.n, 2, partes, r === "hermano"));
        if(c.m > 0) g.push(grupo("medios", "Medio hermanos", "medio", c.m, 1, partes, r === "medio"));
        var regla = (c.n > 0 && c.m > 0) ? "Un medio hermano lleva la mitad que un hermano de padre y madre: la herencia se divide en " + partes + " partes; cada hermano carnal recibe 2 y cada medio hermano 1." : "La herencia se divide en partes iguales entre los hermanos.";
        return {estado:"ok", grupos:g, regla:regla, norma:"Código Civil, art. 990"};
      }
      if(r === "col34" || r === "col56"){
        if(c.grado === null) return falta("Indica tu grado de parentesco.");
        if(c.prev === null) return falta("Responde si quedaron hijos, nietos, cónyuge, padres o abuelos.");
        if(c.prev === 1) return noHeredas("Si la persona dejó hijos, nietos, cónyuge o conviviente civil, padres o abuelos, ellos heredan antes que los demás parientes.", "Código Civil, arts. 988 a 992");
        if(c.hv === null) return falta("Responde si le sobrevivió algún hermano o medio hermano.");
        if(c.hv === 1) return noHeredas("Si a la persona le sobrevivió un hermano o medio hermano, los demás colaterales no heredan.", "Código Civil, arts. 990 y 992");
        if(c.ds === null) return falta("Responde si la persona dejó sobrinos o sobrinos nietos.");
        if(c.ds === 1) return derivar("Si quedaron sobrinos o sobrinos nietos, la Corte Suprema ha resuelto que heredan por representación de sus padres (2025), aunque antes se aplicó otro criterio. Según cuál se siga, tú podrías no heredar o heredar junto con ellos. Revísalo con la clínica.", "Código Civil, arts. 986, 990 y 992");
        if(r === "col34" && c.grado === 4){
          if(c.tio === null) return falta("Responde si le sobrevivió algún tío o tía.");
          if(c.tio === 1) return noHeredas("Los tíos (3.er grado) excluyen a los primos y tíos abuelos (4.º grado).", "Código Civil, art. 992");
        }
        if(r === "col56"){
          if(c.c34 === null) return falta("Responde si le sobrevivió algún tío, primo o tío abuelo.");
          if(c.c34 === 1) return noHeredas("Los parientes de 3.er y 4.º grado excluyen a los de 5.º y 6.º.", "Código Civil, art. 992");
          if(c.grado === 6){
            if(c.c5 === null) return falta("Responde si le sobrevivió algún pariente de 5.º grado.");
            if(c.c5 === 1) return noHeredas("Los parientes de 5.º grado excluyen a los de 6.º.", "Código Civil, art. 992");
          }
        }
        if(c.yodoble === null) return falta("Responde si tu parentesco es de doble o de simple conjunción.");
        if(!entero(c.cd, 0) || !entero(c.cs, 0)) return falta("Indica cuántos parientes de tu grado hay de doble y de simple conjunción.");
        if(c.yodoble === 1 && c.cd < 1) return falta("Si eres de doble conjunción, el número de parientes de doble conjunción debe incluirte (mínimo 1).");
        if(c.yodoble === 0 && c.cs < 1) return falta("Si eres de simple conjunción, el número de parientes de simple conjunción debe incluirte (mínimo 1).");
        var pt = 2*c.cd + c.cs, gc = [];
        if(c.cd > 0) gc.push(grupo("doble", "Parientes de doble conjunción", r, c.cd, 2, pt, c.yodoble === 1));
        if(c.cs > 0) gc.push(grupo("simple", "Parientes de simple conjunción", r, c.cs, 1, pt, c.yodoble === 0));
        var rg = (c.cd > 0 && c.cs > 0) ? "Un pariente de simple conjunción lleva la mitad que uno de doble: la herencia se divide en " + pt + " partes." : "La herencia se divide en partes iguales entre los parientes de tu grado.";
        return {estado:"ok", grupos:gc, regla:rg, norma:"Código Civil, art. 992"};
      }
      return falta("Indica tu parentesco.");
    }

    /* ---------- Cálculo completo ---------- */
    function calcular(hoy){
      hoy = hoy || new Date();
      var R = {estado:"inicial", titulo:"", porque:"", monto:"", pasos:[], avisos:[], familia:null, yo:null, casilla:null, plazos:null, utmF:null};
      if(S.test === 1){
        R.estado = "alto"; R.titulo = "Esta guía no cubre herencias con testamento";
        R.porque = "Si la persona dejó testamento, la posesión efectiva se pide ante un tribunal, con abogado, y la declaración del impuesto sigue otro camino. Pide orientación a la clínica.";
        return R;
      }
      if(!S.rel){ R.titulo = "Todavía no podemos decírtelo"; R.porque = "Empieza por indicar qué eras de la persona que falleció."; return R; }

      var fam = familia();
      R.familia = fam;
      var ex = EXENCION[S.rel];

      if(fam.estado === "no_heredas"){
        R.estado = "alto"; R.titulo = "Con estos datos, no eres heredero";
        R.porque = fam.motivo + " Si crees que hay un error, revisa tus respuestas.";
        R.pasos.push({t:"Quién hereda", e:"Tu parentesco: " + (NOMBRE[S.rel] || "otro"), op:"", r:"No heredas en este orden", m:fam.motivo, n:norma(fam.norma, CC), alto:true});
        return R;
      }
      if(fam.estado === "derivar"){
        R.estado = "alto"; R.titulo = "Este caso necesita revisión";
        R.porque = fam.motivo;
        R.pasos.push({t:"Quién hereda", e:"Tu situación", op:"", r:"La calculadora se detiene aquí", m:fam.motivo, n:norma(fam.norma, CC), alto:true});
        return R;
      }

      // Fecha y UTM
      var fecha = S.fecha, utmF = null, manual = false;
      if(fecha){
        if(fecha > hoy){ R.estado = "revision"; R.titulo = "Revisa la fecha"; R.porque = "La fecha de fallecimiento no puede ser posterior a hoy."; return R; }
        utmF = utmDe(fecha.getFullYear(), fecha.getMonth()+1);
        if(!utmF && S.utmManual > 0){ utmF = S.utmManual; manual = true; }
      }
      var pago = utmPago(hoy);
      R.utmF = utmF;

      if(fam.estado === "incompleto" || !fecha || !utmF || S.act === null){
        R.estado = "revision";
        if(fam.estado === "incompleto"){ R.titulo = "Falta saber cómo se reparte"; R.porque = fam.motivo; }
        else if(!fecha){ R.titulo = "Falta la fecha de fallecimiento"; R.porque = "De esa fecha depende la UTM con que se miden la exención y los tramos."; }
        else if(!utmF){ R.titulo = "Falta la UTM de ese mes"; R.porque = "La tabla interna parte en enero de 2019. Escribe la UTM del mes del fallecimiento; está en la tabla oficial del SII."; }
        else { R.titulo = "Falta el valor de los bienes"; R.porque = "Escribe el valor total de lo que dejó la persona."; }
        var ref = utmF || pago.valor;
        R.porque += " Como " + NOMBRE[S.rel] + ", tu exención es de <b>" + ex + " UTM</b> (" + pesos(ex*ref) + " con la UTM " + (utmF ? "del fallecimiento" : "de este mes") + ").";
        return R;
      }
      var act = S.act, exentos = S.exentos || 0, deudas = S.deudas || 0, gastos = S.gastos || 0;
      if([act, exentos, deudas, gastos].some(function(x){ return isNaN(x) || x < 0; })){
        R.estado = "revision"; R.titulo = "Revisa los montos"; R.porque = "Escribe solo números en pesos, sin letras. Puedes usar puntos para los miles."; return R;
      }
      if(exentos > act){ R.estado = "revision"; R.titulo = "Revisa los bienes exentos"; R.porque = "Los bienes exentos son parte del total: no pueden superarlo."; return R; }
      if(S.esp.extranjero || S.esp.donaciones || S.esp.repudio){
        var cual = [];
        if(S.esp.extranjero) cual.push("bienes en el extranjero");
        if(S.esp.donaciones) cual.push("donaciones en vida a algún heredero");
        if(S.esp.repudio) cual.push("un heredero que repudió o cedió su parte");
        R.estado = "alto"; R.titulo = "Este caso necesita revisión";
        R.porque = "Marcaste " + cual.join(", ") + ". Eso cambia el reparto o la base del impuesto, y la calculadora no lo modela.";
        R.pasos.push({t:"Situaciones especiales", e:cual.join(", "), op:"", r:"La calculadora se detiene aquí", m:"Las donaciones previas se suman a la asignación (art. 23), los bienes en el extranjero tienen reglas propias (art. 1) y el repudio o la cesión cambian quién recibe.", n:norma("Ley 16.271, arts. 1 y 23", LEY), alto:true});
        return R;
      }

      // Pasos comunes
      var conDisc = S.disc && fecha >= new Date(2020, 2, 1);
      R.pasos.push({t:"Fecha de fallecimiento y UTM", e:fechaTxt(fecha), op:manual ? "UTM escrita por ti" : "UTM de " + MESES[fecha.getMonth()] + " de " + fecha.getFullYear(), r:pesos(utmF) + " por UTM", m:"La exención y los tramos se miden con la UTM vigente cuando murió la persona, no con la de hoy.", n:norma("Ley 16.271, art. 2", LEY)});
      R.pasos.push({t:"Lo que dejó la persona", e:"Valor total que escribiste", op:"", r:pesos(act), m:"Cada bien se valora a la fecha del fallecimiento: avalúo fiscal para inmuebles, tasación fiscal para vehículos, saldo para cuentas.", n:norma("Ley 16.271, arts. 46 y 46 bis", LEY)});
      var trasEx = act - exentos;
      if(exentos > 0) R.pasos.push({t:"Bienes exentos", e:pesos(act), op:"− " + pesos(exentos), r:pesos(trasEx), m:"No pagan este impuesto los fondos de AFP hasta 4.000 UF, las viviendas DFL 2 adquiridas en primera transferencia y las de la Ley Pereira, con los requisitos de sus leyes.", n:norma("DL 3.500, art. 72; DFL 2, art. 16; Ley 9.135, art. 3", LEY)});
      var M = Math.max(0, trasEx - deudas - gastos);
      R.pasos.push({t:"Deudas y gastos que se restan", e:pesos(trasEx), op:"− " + pesos(deudas) + " en deudas − " + pesos(gastos) + " en gastos", r:pesos(M) + " de masa líquida", m:"Se restan antes de repartir: deudas sin seguro de desgravamen, gastos de la última enfermedad adeudados, funeral y gastos de la posesión efectiva. La masa líquida es de toda la familia; todavía no es tu parte." + (trasEx - deudas - gastos < 0 ? " Las deudas y gastos superan los bienes: la masa queda en cero." : ""), n:norma("Ley 16.271, art. 4", LEY)});

      // Familia completa (misma función para todos)
      var filas = [], hayPago = false, hayExento = false, yo = null;
      fam.grupos.forEach(function(g){
        var asig = M * g.num / g.den;
        var res = impuestoAsignacion(asig, g.rel, utmF, g.yo && conDisc);
        var fila = {g:g, res:res};
        filas.push(fila);
        if(res.total > 0) hayPago = true; else hayExento = true;
        if(g.yo) yo = fila;
      });
      R.filas = filas; R.yo = yo;
      R.casilla = !hayPago ? "exentas" : (!hayExento ? "afectas_todas" : "afectas_algunas");

      var a = yo.res, g = yo.g;
      R.pasos.push({t:"Reparto: tu parte", e:pesos(M) + " (masa de toda la herencia)", op:"× " + g.num + "/" + g.den, r:pesos(a.pesos) + " es tu asignación", m:fam.regla, n:norma(fam.norma, CC)});
      R.pasos.push({t:"Tu parte en UTM", e:pesos(a.pesos), op:"÷ " + pesos(utmF), r:utm(a.utm), m:"Se convierte a UTM del fallecimiento para comparar con la exención y los tramos.", n:norma("Ley 16.271, art. 2", LEY)});
      R.pasos.push({t:"Exención por parentesco", e:utm(a.utm), op:"− " + a.ex + " UTM", r:a.base > 0 ? utm(a.base) + " de base imponible" : "0 UTM: tu parte queda exenta", m:"Como " + NOMBRE[S.rel] + ", la ley deja fuera del impuesto los primeros " + a.ex + " UTM de tu parte" + (a.ex === 600 ? " (50 UTA)." : a.ex === 60 ? " (5 UTA)." : ": para parientes de 5.º grado o más lejanos no hay exención."), n:norma("Ley 16.271, art. 2", LEY)});
      if(a.base > 0){
        R.pasos.push({t:"Tasa del tramo", e:utm(a.base), op:"× " + pct(a.tasa) + (a.ded ? " − " + num(a.ded, 1) + " UTM" : ""), r:utm(a.bruto), m:"Tu base cae en el tramo de " + num(a.tramo[0], 0) + " a " + (isFinite(a.tramo[1]) ? num(a.tramo[1], 0) : "más") + " UTM. La deducción es fija por tramo: hace que cada porción pague solo su propia tasa.", n:norma("Ley 16.271, art. 2", LEY)});
        R.pasos.push({t:"Recargo por parentesco", e:utm(a.bruto), op:a.recargo ? "× " + num(1 + a.recargo/100, 1) : "× 1 (sin recargo)", r:utm(a.conRecargo), m:a.recargo ? "Los colaterales de 2.º a 4.º grado tienen un recargo de 20% y los más lejanos de 40%, sobre el impuesto ya calculado." : "Hijos, cónyuge o conviviente civil y ascendientes no tienen recargo.", n:norma("Ley 16.271, art. 2", LEY)});
        if(a.disc) R.pasos.push({t:"Rebaja por discapacidad", e:utm(a.conRecargo), op:"× 0,7", r:utm(a.total), m:"Quien está inscrito en el Registro Nacional de la Discapacidad tiene una rebaja de 30% del impuesto (sucesiones abiertas desde el 1 de marzo de 2020; tope anual de 8.000 UF).", n:norma("Ley 16.271, art. 2; Circular SII 33/2021", CIRC33)});
        R.pasos.push({t:"Tu impuesto estimado en pesos", e:utm(a.total), op:"× " + pesos(pago.valor) + " (UTM de " + MESES[pago.mes-1] + " de " + pago.anio + ")", r:pesos(a.total * pago.valor), m:"El impuesto queda fijado en UTM, pero se paga según la UTM del mes en que efectivamente se paga." + (pago.exacta ? "" : " La tabla interna aún no tiene la UTM de este mes: se usó la última disponible."), n:norma("Ley 16.271, art. 2, inciso final", LEY)});
      }
      var casillaTxt = {exentas:"Exentas todas las asignaciones", afectas_algunas:"Afectas algunas de las asignaciones", afectas_todas:"Afectas todas las asignaciones"}[R.casilla];
      R.pasos.push({t:"Toda la familia: qué marcar en el Registro Civil", e:filas.length + (filas.length === 1 ? " grupo de herederos" : " grupos de herederos"), op:"", r:casillaTxt, m:"La solicitud de posesión efectiva pregunta por todas las asignaciones, no solo por la tuya. Por eso se calcula a cada heredero con las mismas reglas.", n:norma("Ley 16.271, art. 60", LEY)});

      // Plazos
      var plazo2 = sumarAnios(fecha, 2), plazo8 = sumarAnios(fecha, 8);
      R.plazos = {plazo2:plazo2, vencido2:hoy > plazo2, plazo8:plazo8, vencido8:hoy > plazo8};

      // Veredicto
      if(a.total > 0){
        R.estado = "paga"; R.titulo = "Con estos datos, sí habría impuesto para ti";
        R.porque = "Tu parte es " + pesos(a.pesos) + " (" + utm(a.utm) + "). Descontada tu exención de " + a.ex + " UTM, quedan " + utm(a.base) + " sobre los que se calcula el impuesto.";
        R.monto = "Estimación de lo que te correspondería pagar<br><b>" + pesos(a.total * pago.valor) + "</b> · " + utm(a.total);
      } else {
        R.estado = "calma"; R.titulo = "Con estos datos, tu parte no paga impuesto";
        R.porque = "Tu parte es " + pesos(a.pesos) + " (" + utm(a.utm) + ") y queda bajo tu exención de " + a.ex + " UTM.";
        if(R.casilla !== "exentas") R.porque += " <b>Ojo:</b> otro heredero de tu familia sí supera su exención. En el Registro Civil corresponde marcar «" + casillaTxt.toLowerCase() + "».";
      }
      if(S.esp.sociedades) R.avisos.push("Marcaste sociedades, empresas o un predio agrícola. Sus reglas de valoración son especiales (art. 46 letras a y f): el resultado es tan bueno como el valor que escribiste.");
      if(S.disc && !conDisc) R.avisos.push("La rebaja por discapacidad rige para sucesiones abiertas desde el 1 de marzo de 2020; no se aplicó.");
      if(R.yo && Math.abs(R.yo.res.utm - R.yo.res.ex) <= R.yo.res.ex * 0.1 && R.yo.res.ex > 0) R.avisos.push("Tu parte queda muy cerca del límite de tu exención. Una diferencia pequeña en el avalúo, en las deudas o en los gastos puede cambiar el resultado: revisa esos valores con tus documentos.");
      return R;
    }

    /* ---------- Dibujo ---------- */
    var $ = function(id){ return document.getElementById(id); };
    function htmlNorma(n){ return n && n.t ? '<span class="esq-norma">Norma: ' + (n.u ? '<a href="' + n.u + '" target="_blank" rel="noopener">' + esc(n.t) + '</a>' : esc(n.t)) + '</span>' : ""; }
    function dibujarEsquema(R){
      return R.pasos.map(function(p, i){
        return '<li class="esq-paso' + (p.alto ? ' alto' : '') + (i === R.pasos.length-1 && !p.alto ? ' final' : '') + '">' +
          '<span class="esq-num" aria-hidden="true">' + (p.alto ? '!' : (i+1)) + '</span>' +
          '<div class="esq-caja"><h3>' + esc(p.t) + '</h3>' +
          '<div class="esq-cuenta">' +
            (p.e ? '<span class="esq-e"><small>Entra</small>' + esc(p.e) + '</span>' : '') +
            (p.op ? '<span class="esq-op"><small>Operación</small>' + esc(p.op) + '</span>' : '') +
            '<span class="esq-r"><small>Resultado</small>' + esc(p.r) + '</span>' +
          '</div>' +
          '<p class="esq-por"><b>Por qué:</b> ' + esc(p.m) + '</p>' + htmlNorma(p.n) +
          '</div></li>';
      }).join("");
    }
    function dibujarTexto(R){
      return '<div class="tabla-scroll"><table class="tabla-desglose"><tbody><tr><th>Paso</th><th>Operación</th><th class="num">Resultado</th></tr>' +
        R.pasos.map(function(p, i){
          return '<tr><td><b>' + (i+1) + '. ' + esc(p.t) + '</b><span class="fuente-linea">' + esc(p.m) + (p.n && p.n.t ? ' (' + esc(p.n.t) + ')' : '') + '</span></td><td>' + esc((p.e ? p.e + ' ' : '') + (p.op || '')) + '</td><td class="num">' + esc(p.r) + '</td></tr>';
        }).join("") + '</tbody></table></div>';
    }
    function dibujarFamilia(R){
      if(!R.filas) return "";
      var filas = R.filas.map(function(f){
        var x = f.res;
        return '<tr' + (f.g.yo ? ' class="yo"' : '') + '><td>' + esc(f.g.nombre) + (f.g.yo ? ' <span class="tag-yo">tú</span>' : '') + '</td><td class="num">' + f.g.n + '</td><td class="num">' + pesos(x.pesos) + '<span class="sub">' + utm(x.utm) + '</span></td><td class="num">' + x.ex + ' UTM</td><td class="num">' + (x.total > 0 ? utm(x.total) : 'Exenta') + '</td></tr>';
      }).join("");
      return '<h3 class="res-sub">Toda la familia, con las mismas reglas</h3><p class="nota-mini">Cada persona de un mismo grupo recibe lo mismo. El impuesto se calcula por persona.</p>' +
        '<div class="tabla-scroll"><table class="tabla-familia"><tbody><tr><th>Herederos</th><th class="num">Personas</th><th class="num">Parte de cada uno</th><th class="num">Exención</th><th class="num">Impuesto por persona</th></tr>' + filas + '</tbody></table></div>';
    }
    function dibujarCasilla(R){
      if(!R.casilla) return "";
      var txt = {exentas:"Exentas todas las asignaciones", afectas_algunas:"Afectas algunas de las asignaciones", afectas_todas:"Afectas todas las asignaciones"}[R.casilla];
      var sig = R.casilla === "exentas"
        ? "La ley da por cumplida la obligación de declarar con esa constancia en la solicitud (art. 60). Igual necesitarás el certificado de exención del SII para inscribir o retirar bienes: se obtiene completando el F4412."
        : "Después de obtener la posesión efectiva, uno de los herederos completa el F4412 en sii.cl. El SII gira el impuesto; cuando se paga, emite el certificado que piden el Conservador y otras instituciones.";
      return '<div class="casilla"><span class="casilla-et">En la solicitud del Registro Civil, la casilla del impuesto sería</span><b>' + txt + '</b><p>' + sig + '</p></div>';
    }
    function dibujarPlazos(R){
      if(!R.plazos) return "";
      var p = R.plazos, t = '<div class="nota plazos"><b>Plazos según la fecha que indicaste.</b> ';
      t += p.vencido2 ? "El plazo de dos años para declarar y pagar sin intereses venció el " + fechaTxt(p.plazo2) + ": si hay impuesto, se adeudan intereses desde esa fecha (art. 50)."
                      : "Hay plazo para declarar y pagar sin intereses hasta el " + fechaTxt(p.plazo2) + " (art. 50).";
      if(p.vencido8) t += " Además, pasaron más de ocho años: es posible que haya vencido el plazo del SII para revisar y cobrar. En ese caso, el F4412 emite un certificado de vencimiento de los plazos legales. Confírmalo con la clínica.";
      return t + '</div>';
    }

    function veredicto(R){
      var caja = $("vvCaja");
      caja.setAttribute("data-estado", R.estado);
      var t = $("vvTitulo"), p = $("vvPorque"), m = $("vvMonto");
      if(t.textContent !== R.titulo) t.textContent = R.titulo;
      if(p.innerHTML !== R.porque) p.innerHTML = R.porque;
      if(R.monto){ m.hidden = false; m.innerHTML = R.monto; } else { m.hidden = true; m.innerHTML = ""; }
    }

    function render(){
      var R = calcular();
      $("calcCompWrap").hidden = !S.rel || S.test === 1 || S.rel === "representante";
      var fam = R.familia;
      var puedeValores = S.rel && S.test !== 1 && fam && fam.estado === "ok";
      $("calcValoresWrap").hidden = !puedeValores;
      veredicto(R);
      var hayPasos = R.pasos.length > 0;
      $("calcResultado").hidden = !hayPasos;
      if(!hayPasos) return;
      $("calcEsquema").innerHTML = dibujarEsquema(R);
      $("calcDesglose").innerHTML = dibujarTexto(R);
      $("calcFamilia").innerHTML = dibujarFamilia(R);
      $("calcCasilla").innerHTML = dibujarCasilla(R);
      $("calcPlazos").innerHTML = dibujarPlazos(R);
      $("calcAvisos").innerHTML = R.avisos.map(function(a){ return '<p class="aviso-amable">' + esc(a) + '</p>'; }).join("");
    }

    /* ---------- Formularios ---------- */
    function htmlPregunta(p){
      var id = "cc-" + p.id, ayuda = p.ayuda ? '<span class="ayuda" id="' + id + '-ay">' + esc(p.ayuda) + '</span>' : "";
      var desc = p.ayuda ? ' aria-describedby="' + id + '-ay"' : "";
      if(p.tipo === NUM){
        return '<div class="campo" data-q="' + p.id + '"><label for="' + id + '">' + esc(p.texto) + '</label>' + ayuda +
          '<input type="number" id="' + id + '" name="' + p.id + '" min="' + p.min + '" max="' + p.max + '" step="1" inputmode="numeric"' + desc + '><span class="error-campo" id="' + id + '-err" role="alert"></span></div>';
      }
      var ops = p.tipo === SI_NO ? [["1","Sí"],["0","No"]] : p.opciones;
      return '<fieldset class="campo" data-q="' + p.id + '"><legend>' + esc(p.texto) + '</legend>' + ayuda +
        '<div class="chips">' + ops.map(function(o){ return '<label class="chip"><input type="radio" name="cc-' + p.id + '" value="' + o[0] + '"><span>' + esc(o[1]) + '</span></label>'; }).join("") + '</div></fieldset>';
    }
    function visibilidad(){
      (FORM[S.rel] || []).forEach(function(p){
        var nodo = app.querySelector('[data-q="' + p.id + '"]');
        if(!nodo) return;
        var ver = !p.si || p.si(leer());
        nodo.hidden = !ver;
        if(!ver && S.comp[p.id] != null){
          S.comp[p.id] = null;
          Array.prototype.forEach.call(nodo.querySelectorAll("input"), function(i){ if(i.type === "radio") i.checked = false; else i.value = ""; });
        }
      });
    }
    function leer(){ var c = {}; (FORM[S.rel] || []).forEach(function(p){ c[p.id] = v(p.id); }); return c; }

    app.addEventListener("change", function(e){
      var t = e.target;
      if(t.name === "calc-test"){ S.test = Number(t.value); render(); return; }
      if(t.name === "calc-rel"){
        S.rel = t.value; S.comp = {};
        $("calcComp").innerHTML = (FORM[S.rel] || []).map(htmlPregunta).join("");
        visibilidad(); render(); return;
      }
      if(t.name && t.name.indexOf("cc-") === 0 && t.type === "radio"){
        S.comp[t.name.slice(3)] = Number(t.value); visibilidad(); render(); return;
      }
      if(t.id && t.id.indexOf("esp-") === 0){ S.esp[t.id.slice(4)] = t.checked; render(); return; }
      if(t.id === "calcDisc"){ S.disc = t.checked; render(); return; }
    });
    app.addEventListener("input", function(e){
      var t = e.target;
      if(t.type === "number" && t.id.indexOf("cc-") === 0){
        var p = null; (FORM[S.rel] || []).forEach(function(x){ if("cc-" + x.id === t.id) p = x; });
        var err = $(t.id + "-err"), n = t.value === "" ? null : Number(t.value);
        var msj = "";
        if(n !== null && (Math.floor(n) !== n)) msj = "Escribe un número entero.";
        else if(n !== null && p && (n < p.min || n > p.max)) msj = "Escribe un número entre " + p.min + " y " + p.max + ".";
        if(err) err.textContent = msj;
        t.setAttribute("aria-invalid", msj ? "true" : "false");
        S.comp[t.name] = msj ? null : n;
        visibilidad(); render(); return;
      }
      var mapa = {calcBienes:"act", calcExentos:"exentos", calcDeudas:"deudas", calcGastos:"gastos"};
      if(mapa[t.id]){
        var val = aPesos(t.value);
        S[mapa[t.id]] = val;
        var e2 = $(t.id + "-err");
        if(e2) e2.textContent = (val !== null && isNaN(val)) ? "Escribe solo el número, por ejemplo 45.000.000." : "";
        render(); return;
      }
      if(t.id === "calcFecha"){
        var f = t.value ? new Date(t.value + "T12:00:00") : null;
        S.fecha = (f && !isNaN(f.getTime())) ? f : null;
        var info = $("calcUtmInfo"), wrap = $("calcUtmManualWrap");
        if(S.fecha){
          var u = utmDe(S.fecha.getFullYear(), S.fecha.getMonth()+1);
          wrap.hidden = !!u;
          info.innerHTML = u ? "UTM de " + MESES[S.fecha.getMonth()] + " de " + S.fecha.getFullYear() + ": <b>" + pesos(u) + "</b> (tabla oficial del SII)." : "";
        } else { wrap.hidden = true; info.innerHTML = ""; }
        render(); return;
      }
      if(t.id === "calcUtmManual"){ var um = aPesos(t.value); S.utmManual = (um && !isNaN(um)) ? um : null; render(); return; }
    });
    // Formato de miles al salir del campo (no mientras se escribe)
    ["calcBienes","calcExentos","calcDeudas","calcGastos","calcUtmManual"].forEach(function(id){
      var el = $(id); if(!el) return;
      el.addEventListener("blur", function(){ var n = aPesos(el.value); if(n !== null && !isNaN(n)) el.value = Math.round(n).toLocaleString("es-CL"); });
    });
    var bImp = $("calcImprimir"); if(bImp) bImp.addEventListener("click", function(){ window.print(); });
    var hoyIso = new Date(); var fEl = $("calcFecha"); if(fEl) fEl.max = hoyIso.getFullYear() + "-" + String(hoyIso.getMonth()+1).padStart(2,"0") + "-" + String(hoyIso.getDate()).padStart(2,"0");

    // Para pruebas automáticas y para el asistente: misma lógica, sin duplicarla.
    window.SIIMPLE_CALC = {calcular:calcular, impuestoAsignacion:impuestoAsignacion, estado:S, utmDe:utmDe, familia:familia};
    render();
  })();

  var BIENES = [
    {q:"casa departamento vivienda inmueble urbano propiedad techo sitio", nombre:"Casa o departamento en ciudad", cat:"Bienes raíces no agrícolas",
     detalle:"Se busca por rol y comuna con el botón Buscar; el sistema trae dirección, destino y avalúo. Pide además la fecha de adquisición.",
     fuente:"Valor: avalúo fiscal vigente al mes del fallecimiento (art. 46 letra a). Si fue comprado dentro de los tres años anteriores, va el precio de compra si es mayor. El certificado de avalúo se obtiene gratis en sii.cl con el rol y la comuna."},
    {q:"agricola no agricola destino urbano rural como saber si es agricola", nombre:"¿Cómo sé si el inmueble es agrícola o no agrícola?", cat:"Cómo distinguirlos",
     detalle:"Determina en qué categoría se declara, porque son dos categorías distintas del formulario.",
     fuente:"Aparece como Destino en el certificado de avalúo fiscal del SII. También lo devuelve la ventana Consultar Propiedad del propio formulario al buscar por rol."},
    {q:"parcela campo predio agricola terreno rural fundo chacra", nombre:"Parcela, campo o predio agrícola", cat:"Bienes raíces agrícolas",
     detalle:"Misma mecánica que el inmueble urbano, pero en la categoría agrícola. Está dentro del botón Otros.",
     fuente:"Valor: avalúo fiscal al mes del fallecimiento. No incluye los bienes excluidos del avalúo, que van aparte."},
    {q:"animales vacas ganado plantaciones maquinaria tractor instalaciones bodega silos construcciones bosques", nombre:"Animales, plantaciones, maquinaria o construcciones del campo", cat:"Bienes excluidos de avalúo fiscal de inmuebles agrícolas",
     detalle:"Se elige el rol del predio y luego el tipo: construcciones, instalaciones, plantaciones, maquinaria, ganado u otros. Hay una casilla para declarar que no tiene.",
     fuente:"Valor corriente en plaza a la fecha del fallecimiento (art. 46 bis). Es la categoría que el SII fiscaliza con más atención en herencias rurales."},
    {q:"auto automovil vehiculo camioneta moto furgon camion patente jeep station", nombre:"Auto, camioneta o moto", cat:"Vehículos",
     detalle:"Se busca por código SII y año de fabricación; el sistema devuelve marca, modelo, versión y monto de tasación.",
     fuente:"El código SII está en el permiso de circulación: una letra según el tipo (A automóvil, C camioneta, S station wagon) más seis dígitos. Valor: tasación vigente a la fecha del fallecimiento (art. 46 letra g)."},
    {q:"muebles menaje living comedor cama refrigerador cosas de la casa electrodomesticos ropa", nombre:"Muebles y cosas de la casa", cat:"Menaje",
     detalle:"Se puede detallar bien por bien, o acogerse a la presunción del 20% buscando el rol del último domicilio del causante.",
     fuente:"La presunción del art. 47 estima el menaje en 20% del valor del inmueble que guarnecía, aunque ese inmueble no fuera del causante. Procede cuando no se justifica la falta de muebles, cuando no son proporcionados a la masa o cuando no se pudieron valorizar."},
    {q:"plata efectivo dinero cuenta corriente cuenta vista ahorro banco libreta", nombre:"Dinero en efectivo o en el banco", cat:"Dinero",
     detalle:"Se elige la institución de un desplegable de veinte opciones, o dinero en efectivo.",
     fuente:"Saldo a la fecha del fallecimiento. Los bancos están obligados a entregar a los herederos y al SII los datos de saldos, cuentas corrientes, garantías y custodias del cliente fallecido (art. 45 de la Ley 16.271)."},
    {q:"afp fondo previsional pension jubilacion cuenta de capitalizacion ahorro previsional", nombre:"Fondos de AFP", cat:"Fondos AFP",
     detalle:"Pide el fondo total en UF, el fondo heredable en UF y el fondo heredable en pesos. No son lo mismo: parte del fondo puede destinarse a pensiones de sobrevivencia y esa parte no se hereda.",
     fuente:"Certificado de saldo de la cuenta de capitalización individual, que emite la AFP a solicitud de los herederos."},
    {q:"deposito a plazo fondo mutuo bonos fondo de inversion efectos publicos", nombre:"Depósito a plazo, fondo mutuo o bonos", cat:"Otros valores mobiliarios",
     detalle:"Un desplegable distingue bonos, depósitos a plazo, fondo mutuo, fondo de inversión privado, efectos públicos y otros.",
     fuente:"Certificado de la institución con el saldo o valor a la fecha del fallecimiento."},
    {q:"acciones bolsa sociedad anonima abierta transadas cotizacion bursatil", nombre:"Acciones que se transan en bolsa", cat:"Acciones transadas en bolsa",
     detalle:"Son las de sociedades anónimas abiertas y otros valores con cotización bursátil. Pide número de acciones y valor promedio.",
     fuente:"El valor es el promedio del precio que tuvieron durante los seis meses anteriores al fallecimiento (art. 46 letra b). Se obtiene del corredor o de la bolsa. Si la sociedad tenía más del 30% de su capital en manos del causante o su familia, se valoriza igualmente a valor corriente en plaza."},
    {q:"acciones spa sociedad anonima cerrada no transadas comandita por acciones", nombre:"Acciones de una SpA o sociedad anónima cerrada", cat:"Acciones no transadas en bolsa",
     detalle:"Comprende sociedades anónimas cerradas, sociedades por acciones y en comandita por acciones. Pide número de acciones y valor corriente en plaza.",
     fuente:"Como no tienen cotización, se valorizan a valor corriente en plaza (art. 46 bis), y en la práctica se estima a partir del último balance. Se declara solo la parte del causante, no el total del capital social."},
    {q:"limitada ltda eirl sociedad empresa negocio participacion derechos sociales socio", nombre:"Participación en una sociedad de responsabilidad limitada o EIRL", cat:"Derechos en sociedades de personas",
     detalle:"Pide RUT y nombre de la entidad, total de activos, total de pasivos exigibles, y una columna llamada Valor sociedad Leg 16.271.",
     fuente:"Esa columna es la aplicación del art. 46 letra f: al negocio o a los derechos se les asigna el valor que resulte de aplicar a los bienes del activo las reglas de ese artículo, incluyendo los intangibles a valor corriente en plaza, con deducción del pasivo acreditado. Sobre ese valor neto se aplica el porcentaje de participación del causante: se declara lo que era suyo, no el 100% de la sociedad. Los datos salen del balance y de la escritura social."},
    {q:"sociedad colectiva civil comandita civil", nombre:"Participación en una sociedad civil", cat:"Sociedades civiles",
     detalle:"Solo dos tipos: sociedad colectiva civil y sociedad en comandita civil. Pide activos, pasivos exigibles y valor neto.",
     fuente:"La sociedad es civil o comercial según su objeto: son comerciales las que se forman para negocios que la ley califica de actos de comercio, y civiles las demás (art. 2059 del Código Civil). Las anónimas son siempre mercantiles. Se declara la participación del causante, no el total."},
    {q:"le debian plata prestamo credito a favor cuenta por cobrar deudor", nombre:"Plata que le debían al fallecido", cat:"Cuentas por cobrar",
     detalle:"Pide descripción, RUT del deudor y valor corriente en plaza. Suma a la herencia, no la resta.",
     fuente:"Documento que acredite el crédito: pagaré, contrato o reconocimiento de deuda."},
    {q:"deudas credito banco tarjeta casa comercial pasivos debia hipoteca", nombre:"Deudas que dejó el fallecido", cat:"Pasivos heredables",
     detalle:"Pide descripción, RUT del acreedor, fecha del contrato y valor de la obligación. Resta de la masa.",
     fuente:"Certificado de deuda con el saldo a la fecha del fallecimiento. No se incluyen las que tenían seguro de desgravamen, porque las paga el seguro."},
    {q:"funeral entierro sepultura ultima enfermedad clinica hospital remedios gastos medicos", nombre:"Funeral y gastos de la última enfermedad", cat:"Gastos de última enfermedad y otros",
     detalle:"Solo pide descripción y valor. Resta de la masa.",
     fuente:"Boletas y facturas de la funeraria, y bonos o boletas médicas. Solo la parte no cubierta por seguros. Son bajas generales de la herencia (art. 959 del Código Civil)."},
    {q:"joyas oro anillos arte cuadros pinturas antiguedades armas colecciones instrumentos vinos alfombras pieles biblioteca", nombre:"Joyas, obras de arte, armas o colecciones", cat:"Joyas, objetos de arte, antigüedades y armas",
     detalle:"Un desplegable ofrece doce tipos: joyas, antigüedades, obras de arte, alfombras y tapices, colecciones, pieles finas, instrumentos musicales, bibliotecas, equipamiento de oficio, vinos y licores, armas y otros.",
     fuente:"Valor corriente en plaza (art. 46 bis). No entran en el menaje, que es solo mobiliario común."},
    {q:"extranjero afuera fuera de chile argentina propiedad en el exterior trust", nombre:"Bienes en el extranjero", cat:"Bienes situados en el extranjero",
     detalle:"Pide el tipo de bien, el país de ubicación, y también los impuestos pagados en el extranjero con su fecha y la UTM de ese momento.",
     fuente:"Deben colacionarse en el inventario. El impuesto pagado afuera sirve de abono contra el que se adeude en Chile, pero el total no puede ser inferior al que habría correspondido considerando solo los bienes situados en Chile (art. 1 de la Ley 16.271)."},
    {q:"derechos de agua mineros marca patente propiedad intelectual industrial", nombre:"Derechos de agua, mineros, marcas o propiedad intelectual", cat:"Activos intangibles",
     detalle:"Un desplegable ofrece derechos de aguas, de minería, propiedad intelectual, propiedad industrial y otros.",
     fuente:"Valor corriente en plaza (art. 46 bis)."},
    {q:"barco lancha bote avion avioneta nave aeronave artefacto naval", nombre:"Embarcaciones o aeronaves", cat:"Naves y aeronaves",
     detalle:"Distingue nave mayor, nave menor, artefacto naval mayor y menor, y aeronave de destino comercial o particular.",
     fuente:"Valor corriente en plaza (art. 46 bis). Deben estar inscritas a nombre del causante."},
    {q:"remate subasta publica vendido licitado", nombre:"Bien vendido en subasta pública", cat:"Bienes en pública subasta",
     detalle:"Aplica si el bien se licitó en subasta pública con admisión de postores extraños dentro de los nueve meses siguientes a la delación.",
     fuente:"En ese caso el bien se valora al precio en que fue subastado, y no por las reglas generales (art. 46 letra d)."},
    {q:"otro otra cosa no se cual ninguna no aparece", nombre:"Algo que no calza en ninguna categoría", cat:"Otros bienes y/o derechos",
     detalle:"Última opción. Antes de usarla, revisa las quince categorías que aparecen al apretar el botón azul Otros.",
     fuente:"Valor corriente en plaza (art. 46 bis)."}
  ];

  var cajaBienes = document.getElementById("resultadoBienes");
  var input = document.getElementById("buscarBien");

  function normaliza(t){
    return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  }
  function pintarBienes(lista){
    if(!lista.length){
      cajaBienes.innerHTML = '<p class="vacio">No hay coincidencias. Prueba con otra palabra, o borra lo escrito para ver la lista completa.</p>';
      return;
    }
    cajaBienes.innerHTML = lista.map(function(b){
      return '<div class="bien"><b>' + b.nombre + '</b>' +
             '<span class="cat">' + b.cat + '</span>' +
             '<span class="detalle">' + b.detalle + '</span>' +
             '<span class="fuente">' + b.fuente + '</span></div>';
    }).join("");
  }
  if(input){
    pintarBienes(BIENES);
    input.addEventListener("input", function(){
      var t = normaliza(input.value.trim());
      if(!t){ pintarBienes(BIENES); return; }
      pintarBienes(BIENES.filter(function(b){
        return normaliza(b.q + " " + b.nombre + " " + b.cat).indexOf(t) !== -1;
      }));
    });
  }

  var DOCS = [
    ["Certificado de defunción del causante", "Lo emite el Registro Civil, en línea o presencialmente"],
    ["Cédula de identidad de quien hace el trámite", "La tuya"],
    ["Certificados de nacimiento o matrimonio que acrediten el parentesco", "Registro Civil, uno por cada heredero"],
    ["Resolución o certificado de posesión efectiva", "Lo entrega el Registro Civil una vez concedida"],
    ["Certificado de avalúo fiscal de cada propiedad", "Se obtiene gratis en el sitio del SII con el rol y la comuna. Debe ser el vigente al fallecimiento"],
    ["Copia de la inscripción de dominio de cada propiedad", "Conservador de Bienes Raíces de la comuna donde está el inmueble"],
    ["Permiso de circulación o padrón de los vehículos", "El permiso trae el código SII que pide el formulario"],
    ["Certificados de saldos bancarios a la fecha del fallecimiento", "Cada banco, que está obligado a entregarlos a los herederos"],
    ["Certificado de saldo de la cuenta de AFP", "La AFP en que estaba afiliado el causante"],
    ["Boletas del funeral", "La funeraria"],
    ["Boletas o bonos de la última enfermedad", "Clínica, hospital, consulta o farmacia"],
    ["Certificados de las deudas pendientes", "Banco o casa comercial, con saldo a la fecha del fallecimiento"],
    ["Escritura y último balance, si había sociedades", "La propia sociedad o su contador"],
    ["Clave única o clave tributaria del heredero", "Registro Civil o SII. Es personal y sirve para entrar al sistema en línea"]
  ];

  var lista = document.getElementById("listaDocs");
  if(lista){
    lista.innerHTML = DOCS.map(function(d,i){
      return '<div class="check"><input type="checkbox" id="doc'+i+'">' +
        '<label for="doc'+i+'">' + d[0] + '<span class="donde">' + d[1] + '</span></label></div>';
    }).join("");

    var cajas = lista.querySelectorAll("input[type=checkbox]");
    var texto = document.getElementById("progresoTexto");
    var barra = document.getElementById("progresoBarra");

    function guardar(){
      try{
        localStorage.setItem("docsHerencia", JSON.stringify(
          Array.prototype.map.call(cajas, function(c){ return c.checked ? 1 : 0; })
        ));
      }catch(e){}
    }
    function cargar(){
      try{
        var crudo = localStorage.getItem("docsHerencia");
        if(!crudo) return;
        var estado = JSON.parse(crudo);
        if(!Array.isArray(estado)) return;
        estado.forEach(function(v,i){ if(cajas[i]) cajas[i].checked = !!v; });
      }catch(e){}
    }
    function actualizar(){
      var n = Array.prototype.filter.call(cajas, function(c){ return c.checked; }).length;
      texto.textContent = n + " de " + cajas.length + " reunidos";
      barra.style.width = (n / cajas.length * 100) + "%";
    }
    Array.prototype.forEach.call(cajas, function(c){
      c.addEventListener("change", function(){ guardar(); actualizar(); });
    });
    cargar();
    actualizar();
  }

  // ===== Tamaño del texto: botones − y + de la lupa en la franja superior =====
  // Cambia el tamaño base de la página; todos los textos se ajustan en proporción.
  // Se recuerda en este navegador para la próxima visita.
  var tamanos = [90, 100, 115, 130, 150];
  var tamanoActual = 1;
  var btnMenos = document.getElementById("textoMenos");
  var btnMas = document.getElementById("textoMas");

  function aplicarTamano(i){
    tamanoActual = Math.max(0, Math.min(tamanos.length - 1, i));
    document.documentElement.style.fontSize = tamanos[tamanoActual] + "%";
    btnMenos.disabled = tamanoActual === 0;
    btnMas.disabled = tamanoActual === tamanos.length - 1;
    try{ localStorage.setItem("tamanoTexto", tamanoActual); }catch(e){}
  }
  btnMenos.addEventListener("click", function(){ aplicarTamano(tamanoActual - 1); });
  btnMas.addEventListener("click", function(){ aplicarTamano(tamanoActual + 1); });
  document.getElementById("textoNormal").addEventListener("click", function(){ aplicarTamano(1); });
  try{
    var guardado = parseInt(localStorage.getItem("tamanoTexto"), 10);
    aplicarTamano(isNaN(guardado) ? 1 : guardado);
  }catch(e){ aplicarTamano(1); }

  aplicarFiltro("basico");
  anotarPosicion(0);
  mostrar(pantallaDeLaDireccion());
})();
