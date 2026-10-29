(function(){
  "use strict";

  // ===== UTM: este es el único lugar que hay que cambiar cada mes =====
  // valor: en pesos, sin puntos. mes: en minúscula. anio: también arma los links del SII.
  var UTM = {valor: 71721, mes: "septiembre", anio: 2026};

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
    var campoUtm = document.getElementById("calcUtm");
    if(campoUtm) campoUtm.value = UTM.valor.toLocaleString("es-CL");
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
  function mostrar(id){
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
    window.scrollTo(0,0);
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
    if(location.hash === "#" + id) mostrar(id);
    else location.hash = id;
  }

  window.addEventListener("hashchange", function(){
    anotarPosicion(posicion + 1);
    mostrar(pantallaDeLaDireccion());
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

  function aNumero(txt){
    var limpio = String(txt).replace(/[^0-9]/g,"");
    return limpio ? parseInt(limpio,10) : 0;
  }
  function pesos(n){ return "$" + Math.round(n).toLocaleString("es-CL"); }
  function utmFmt(n){ return n.toLocaleString("es-CL",{minimumFractionDigits:2, maximumFractionDigits:2}) + " UTM"; }
  ["calcActivo","calcPasivo","calcUtm"].forEach(function(id){
    var el = document.getElementById(id);
    if(!el) return;
    el.addEventListener("input", function(){
      var n = aNumero(el.value);
      el.value = n ? n.toLocaleString("es-CL") : "";
    });
  });

  (function calculadoraViva(){
    var TRAMOS_C = [[960,.01,0],[1920,.025,14.4],[3840,.05,62.4],[5760,.075,158.4],
                     [7680,.10,302.4],[9600,.15,686.4],[14400,.20,1166.4],[Infinity,.25,1886.4]];
    var EXENCION_C = {hijo:600, conyuge:600, ascendiente:600, hermano:60, medio:60, col34:60, col56:0};
    var RECARGO_C  = {hijo:0, conyuge:0, ascendiente:0, hermano:20, medio:20, col34:20, col56:40};
    var NOMBRE_C   = {hijo:"hijo o hija", conyuge:"cónyuge o conviviente civil", ascendiente:"ascendiente",
                       hermano:"hermano o hermana", medio:"medio hermano", col34:"colateral de 3.º o 4.º grado",
                       col56:"colateral de 5.º o 6.º grado"};

    var elRel = document.getElementById("calcRel");
    if(!elRel) return; // esta sección no está en la página actual

    var S = {rel:null, comp:{}, act:null, pas:0, utm:UTM.valor};

    function campo(id,label,sub,val){
      return '<div class="campo"><label for="'+id+'">'+label+'</label>'+
        (sub?'<span class="ayuda">'+sub+'</span>':'')+
        '<input type="number" id="'+id+'" min="0" step="1" inputmode="numeric" value="'+(val==null?"":val)+'"></div>';
    }
    function siNo(id,label,sub){
      return '<div class="campo"><label>'+label+'</label>'+
        (sub?'<span class="ayuda">'+sub+'</span>':'')+
        '<div class="chips" role="radiogroup" aria-label="'+label.replace(/"/g,'')+'">'+
        '<label class="chip"><input type="radio" name="'+id+'" value="1"><span>Sí</span></label>'+
        '<label class="chip"><input type="radio" name="'+id+'" value="0"><span>No</span></label></div></div>';
    }

    var FORMS_C = {
      hijo: siNo("cc-cony","¿Quedó cónyuge o conviviente civil sobreviviente?") +
            campo("cc-h","¿Cuántos hijos dejó en total?","Contándote a ti. Si alguno falleció antes que el causante, revisa la sección de representación."),
      conyuge: campo("cc-h","¿Cuántos hijos dejó?","Escribe 0 si no tuvo hijos.") +
               '<div id="cc-ascWrap" hidden>'+campo("cc-a","¿Cuántos padres o abuelos suyos siguen vivos?","Cuenta solo los del grado más cercano.")+'</div>',
      ascendiente: siNo("cc-hijos0","¿La persona dejó hijos (vivos o representados)?","Si dejó hijos, los ascendientes no heredan en este orden.") +
                   '<div id="cc-ascRest" hidden>'+siNo("cc-cony","¿Quedó cónyuge sobreviviente?")+
                   campo("cc-a","¿Cuántos ascendientes del mismo grado que tú siguen vivos?","Contándote a ti.")+'</div>',
      hermano: siNo("cc-previos0","¿La persona dejó hijos, cónyuge o ascendientes vivos?","Si dejó alguno de ellos, los hermanos no heredan.") +
               '<div id="cc-hermRest" hidden>'+campo("cc-n","¿Cuántos hermanos de padre y madre (contándote a ti)?","")+
               campo("cc-m","¿Cuántos medio hermanos, de solo padre o solo madre?","Escribe 0 si no hay.")+'</div>',
      medio: siNo("cc-previos0","¿La persona dejó hijos, cónyuge o ascendientes vivos?","Si dejó alguno de ellos, los hermanos no heredan.") +
             '<div id="cc-hermRest" hidden>'+campo("cc-n","¿Cuántos hermanos de padre y madre?","Escribe 0 si no hay.")+
             campo("cc-m","¿Cuántos medio hermanos, contándote a ti?","")+'</div>',
      col34: siNo("cc-previos1","¿Quedó algún pariente más cercano?","Hijos, cónyuge, ascendientes, hermanos o medio hermanos.") +
             '<div id="cc-colRest" hidden>'+siNo("cc-yodoble","¿Compartes ambas líneas de parentesco con el causante (doble conjunción)?","Por ejemplo, un primo hijo de dos hermanos entre sí. Si compartes solo una línea, es simple conjunción.")+
             campo("cc-cd","¿Cuántos parientes de tu mismo grado son de doble conjunción?","Contándote a ti si corresponde.")+
             campo("cc-cs","¿Cuántos son de simple conjunción?","Contándote a ti si corresponde.")+'</div>',
      col56: siNo("cc-previos1","¿Quedó algún pariente más cercano?","Hijos, cónyuge, ascendientes, hermanos o medio hermanos.") +
             '<div id="cc-colRest" hidden>'+siNo("cc-yodoble","¿Compartes ambas líneas de parentesco con el causante (doble conjunción)?","Por ejemplo, un primo hijo de dos hermanos entre sí. Si compartes solo una línea, es simple conjunción.")+
             campo("cc-cd","¿Cuántos parientes de tu mismo grado son de doble conjunción?","Contándote a ti si corresponde.")+
             campo("cc-cs","¿Cuántos son de simple conjunción?","Contándote a ti si corresponde.")+'</div>'
    };

    function reparto(M){
      var r = S.rel, c = S.comp;
      var g = function(k){ var v = c[k]; return (v==="" || v==null || isNaN(v)) ? null : Number(v); };

      if(r === "hijo"){
        var cony = g("cony"), h = g("h");
        if(cony===null || h===null || h<1) return null;
        if(!cony) return {asig:M/h, regla:"Sin cónyuge, la herencia se divide en partes iguales entre los "+h+" hijos (art. 988 CC)."};
        if(h===1) return {asig:M/2, regla:"Con un hijo y cónyuge, cada uno recibe la mitad (art. 988 CC)."};
        if(h<7)   return {asig:M/(h+2), regla:"Con "+h+" hijos y cónyuge, el cónyuge lleva el doble que cada hijo: la masa se divide en "+(h+2)+" partes y a ti te toca una (art. 988 CC)."};
        return {asig:3*M/(4*h), regla:"Con 7 hijos o más y cónyuge, el cónyuge lleva un cuarto de la herencia y el resto se divide entre los "+h+" hijos (art. 988 CC)."};
      }
      if(r === "conyuge"){
        var h2 = g("h");
        if(h2===null) return null;
        if(h2===0){
          var a = g("a"); if(a===null) return null;
          if(a===0) return {asig:M, regla:"Sin hijos ni ascendientes vivos, el cónyuge recibe toda la herencia (art. 989 CC)."};
          return {asig:2*M/3, regla:"Sin hijos, el cónyuge lleva dos tercios y el tercio restante se reparte entre los ascendientes (art. 989 CC)."};
        }
        if(h2===1) return {asig:M/2, regla:"Con un hijo, el cónyuge recibe la mitad (art. 988 CC)."};
        if(h2<7)   return {asig:2*M/(h2+2), regla:"Con "+h2+" hijos, el cónyuge lleva el doble que cada hijo: dos partes de "+(h2+2)+" (art. 988 CC)."};
        return {asig:M/4, regla:"Con 7 hijos o más, el cónyuge lleva un cuarto de la herencia (art. 988 CC)."};
      }
      if(r === "ascendiente"){
        if(g("hijos0") !== 0) return null;
        var cy = g("cony"), aa = g("a");
        if(cy===null || aa===null || aa<1) return null;
        if(cy) return {asig:M/(3*aa), regla:"Sin hijos, el cónyuge lleva dos tercios y el tercio restante se divide entre los "+aa+" ascendientes (art. 989 CC)."};
        return {asig:M/aa, regla:"Sin hijos ni cónyuge, la herencia se divide en partes iguales entre los "+aa+" ascendientes (art. 989 CC)."};
      }
      if(r === "hermano" || r === "medio"){
        if(g("previos0") !== 0) return null;
        var n = g("n"), m = g("m");
        if(n===null || m===null || (n+m)<1) return null;
        var partes = 2*n + m;
        if(r === "hermano"){
          if(n<1) return null;
          return m===0 ? {asig:M/n, regla:"La herencia se divide en partes iguales entre los "+n+" hermanos (art. 990 CC)."}
                       : {asig:2*M/partes, regla:"Un hermano de padre y madre lleva el doble que un medio hermano (art. 990 CC): la masa se divide en "+partes+" partes y a ti te tocan dos."};
        }
        if(m<1) return null;
        return n===0 ? {asig:M/m, regla:"La herencia se divide en partes iguales entre los "+m+" medio hermanos (art. 990 CC)."}
                     : {asig:M/partes, regla:"Un medio hermano lleva la mitad que un hermano de padre y madre (art. 990 CC): la masa se divide en "+partes+" partes y a ti te toca una."};
      }
      if(r === "col34" || r === "col56"){
        if(g("previos1") !== 0) return null;
        var yoDoble = g("yodoble"), cd = g("cd"), cs = g("cs");
        if(yoDoble===null || cd===null || cs===null) return null;
        if(yoDoble===1 && cd<1) return null;
        if(yoDoble===0 && cs<1) return null;
        var partesC = 2*cd + cs;
        if(partesC<1) return null;
        if(cs===0) return {asig:M/cd, regla:"La herencia se divide en partes iguales entre los "+cd+" parientes de doble conjunción (art. 992 CC)."};
        if(cd===0) return {asig:M/cs, regla:"La herencia se divide en partes iguales entre los "+cs+" parientes de simple conjunción (art. 992 CC)."};
        return yoDoble
          ? {asig:2*M/partesC, regla:"Un pariente de doble conjunción lleva el doble que uno de simple conjunción (art. 992 CC): la masa se divide en "+partesC+" partes y a ti te tocan dos."}
          : {asig:M/partesC, regla:"Un pariente de simple conjunción lleva la mitad que uno de doble conjunción (art. 992 CC): la masa se divide en "+partesC+" partes y a ti te toca una."};
      }
      return null;
    }

    function impuestoUTM(base, rel){
      if(base <= 0) return {utm:0, tasa:0, ded:0, bruto:0};
      for(var i=0;i<TRAMOS_C.length;i++){
        if(base <= TRAMOS_C[i][0]){
          var bruto = Math.max(0, base*TRAMOS_C[i][1] - TRAMOS_C[i][2]);
          return {utm: bruto*(1+RECARGO_C[rel]/100), tasa:TRAMOS_C[i][1], ded:TRAMOS_C[i][2], bruto:bruto};
        }
      }
      return {utm:0, tasa:0, ded:0, bruto:0};
    }

    function fila(k,v,src,clase){
      return '<div class="'+(clase||"")+'"><span>'+k+'</span><span>'+v+'</span></div>' +
             (src ? '<div class="fuente-linea">'+src+'</div>' : '');
    }

    function veredicto(estado, titulo, porque, monto){
      var caja = document.getElementById("vvCaja");
      caja.setAttribute("data-estado", estado);
      document.getElementById("vvTitulo").textContent = titulo;
      document.getElementById("vvPorque").innerHTML = porque;
      var m = document.getElementById("vvMonto");
      if(monto){ m.hidden = false; m.innerHTML = monto; } else { m.hidden = true; }
    }

    function render(){
      document.getElementById("calcCompWrap").hidden = !S.rel;
      var listo2 = S.rel && reparto(1) !== null;
      document.getElementById("calcValoresWrap").hidden = !listo2;

      if(!S.rel){
        veredicto("inicial", "Todavía no podemos decírtelo", "Empieza por indicar qué eras de la persona que falleció.");
        document.getElementById("calcPasos").hidden = true;
        return;
      }

      if(S.rel === "ascendiente" && S.comp.hijos0 === 1){
        veredicto("revision", "En este caso no heredas",
          "Si la persona que falleció dejó hijos, sus padres y abuelos no heredan: la herencia se reparte entre los hijos y, si lo hay, el cónyuge o conviviente civil. Los padres y abuelos solo heredan cuando no hay hijos (art. 989 del Código Civil). Por eso no hay una parte tuya sobre la cual calcular el impuesto.<br><br>Si marcaste “Sí” por error, puedes cambiar la respuesta.");
        document.getElementById("calcPasos").hidden = true;
        return;
      }
      if((S.rel === "hermano" || S.rel === "medio") && S.comp.previos0 === 1){
        veredicto("revision", "En este caso no heredas",
          "Si la persona que falleció dejó hijos, cónyuge o conviviente civil, o padres o abuelos vivos, ellos heredan antes que los hermanos y medio hermanos. Los hermanos solo heredan cuando no queda ninguno de ellos (art. 990 del Código Civil). Por eso no hay una parte tuya sobre la cual calcular el impuesto.<br><br>Si marcaste “Sí” por error, puedes cambiar la respuesta.");
        document.getElementById("calcPasos").hidden = true;
        return;
      }

      var ex = EXENCION_C[S.rel];
      if(!listo2){
        veredicto("revision", "Falta saber cómo se reparte",
          "Como "+NOMBRE_C[S.rel]+", puedes recibir hasta <b>"+ex+" UTM</b> ("+pesos(ex*S.utm)+" con la UTM que tienes puesta) sin pagar impuesto. Falta saber qué parte te toca a ti exactamente.");
        document.getElementById("calcPasos").hidden = true;
        return;
      }

      if(S.act===null || isNaN(S.act) || S.act<=0){
        veredicto("revision", "Falta el valor de los bienes",
          "Tu exención como "+NOMBRE_C[S.rel]+" es de <b>"+ex+" UTM</b>, o sea "+pesos(ex*S.utm)+". Si tu parte de la herencia queda bajo esa cifra, no pagas impuesto.");
        document.getElementById("calcPasos").hidden = true;
        return;
      }

      var M = Math.max(0, S.act - (S.pas||0));
      var rep = reparto(M);
      if(!rep){ document.getElementById("calcPasos").hidden = true; return; }

      var asig = rep.asig;
      var asigU = asig / S.utm;
      var base = Math.max(0, asigU - ex);
      var imp = impuestoUTM(base, S.rel);
      var enPesos = imp.utm * S.utm;

      if(base <= 0){
        veredicto("calma", "Con estos datos, no pagarías impuesto",
          "Te tocan "+pesos(asig)+" ("+utmFmt(asigU)+"). Como "+NOMBRE_C[S.rel]+" tu exención es de "+ex+" UTM, así que tu parte queda bajo el monto en que empieza a cobrarse.<br><br><b>Aun así tienes que declarar</b>, marcando la opción “exentas todas las asignaciones” en el formulario.");
      } else {
        veredicto("paga", "Con estos datos, sí habría impuesto",
          "Te tocan "+pesos(asig)+" ("+utmFmt(asigU)+"). Descontada tu exención de "+ex+" UTM, quedan "+utmFmt(base)+" sobre los que se calcula el impuesto.",
          "Estimación de lo que te correspondería pagar<br><b>"+pesos(enPesos)+"</b> · "+utmFmt(imp.utm));
      }

      var html = "";
      html += fila("Bienes", pesos(S.act), "Suma de todo lo que dejó, según el inventario.");
      if(S.pas>0) html += fila("Menos las deudas", "−"+pesos(S.pas), "Solo las que se pueden acreditar.");
      html += fila("Masa hereditaria", pesos(M), "Bajas generales de la herencia ya aplicadas (art. 959 CC).");
      html += fila("Lo que te toca a ti", pesos(asig), rep.regla);
      html += fila("Convertido a UTM", utmFmt(asigU), "Se divide por la UTM del mes del fallecimiento ("+pesos(S.utm)+").");
      html += fila("Tu exención por parentesco", "−"+ex+" UTM", "Tabla N.°1, fila “"+NOMBRE_C[S.rel]+"”.");
      html += fila("Base imponible", utmFmt(base), base<=0
        ? "La exención cubre toda tu parte, así que la base queda en cero y no se sigue calculando."
        : "Es lo único sobre lo que se aplica la tabla de tasas.");

      if(base > 0){
        html += fila("Tasa del tramo", (imp.tasa*100).toLocaleString("es-CL")+"%", "Tabla N.°2, según el tramo en que cae tu base imponible.");
        html += fila("Menos la deducción del tramo", "−"+imp.ded.toLocaleString("es-CL")+" UTM", "La misma tabla trae una deducción por tramo, para que el impuesto suba de forma gradual.");
        html += fila("Impuesto antes del recargo", utmFmt(imp.bruto));
        html += fila("Recargo por parentesco", RECARGO_C[S.rel]+"%", RECARGO_C[S.rel]===0
          ? "Tabla N.°3. Los hijos, el cónyuge y los ascendientes no tienen recargo."
          : "Tabla N.°3. Se aplica sobre el impuesto ya calculado, no sobre la herencia.");
        html += fila("Impuesto total estimado", utmFmt(imp.utm)+" ("+pesos(enPesos)+")", "Para pagar, el formulario convierte esta cifra usando la UTM del mes de la declaración, que puede ser distinta de la que usamos aquí.", "total");
      } else {
        html += fila("Impuesto estimado", "$0", "La declaración se presenta igual, marcando la asignación como exenta.", "total");
      }

      document.getElementById("calcDesglose").innerHTML = html;
      document.getElementById("calcPasos").hidden = false;
    }

    elRel.addEventListener("change", function(e){
      if(e.target.name !== "calc-rel") return;
      S.rel = e.target.value; S.comp = {};
      document.getElementById("calcComp").innerHTML = FORMS_C[S.rel] || "";
      render();
    });

    document.getElementById("calcComp").addEventListener("input", function(e){
      var t = e.target;
      var key = (t.name || t.id).replace(/^cc-/, "");
      S.comp[key] = t.type === "radio" ? Number(t.value) : (t.value === "" ? "" : Number(t.value));
      var w;
      if((w = document.getElementById("cc-ascWrap"))) w.hidden = !(S.comp.h === 0);
      if((w = document.getElementById("cc-ascRest"))) w.hidden = !(S.comp.hijos0 === 0);
      if((w = document.getElementById("cc-hermRest"))) w.hidden = !(S.comp.previos0 === 0);
      if((w = document.getElementById("cc-colRest"))) w.hidden = !(S.comp.previos1 === 0);
      render();
    });

    function dinero(id, key){
      var el = document.getElementById(id);
      el.addEventListener("input", function(){
        var v = aNumero(this.value);
        S[key] = (key==="pas") ? (v||0) : (v||null);
        render();
      });
    }
    dinero("calcActivo","act");
    dinero("calcPasivo","pas");
    document.getElementById("calcUtm").addEventListener("input", function(){
      var v = aNumero(this.value);
      S.utm = (!v || v<1) ? UTM.valor : v;
      render();
    });

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
