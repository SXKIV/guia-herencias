/* =========================================================
   simulador.js: Simulador de declaración del impuesto a las
   herencias (formulario F4412 del SII) para la guía SIIMPLE.
   Sin librerías. Dibuja todo dentro de <div id="simApp">.
   - Usa la UTM de la guía si existe window.UTM_GUIA (codigo.js)
     y la tabla window.UTM_MENSUAL_GUIA si se expone.
   - Guarda el borrador solo si la persona presiona "Guardar",
     en este navegador, con la clave "simuladorHerencia1".
   - Los casos de ejemplo usan personas y RUT inventados.
   ========================================================= */
(function(){
"use strict";
const DATA_REGIONES=[{"region": "Arica y Parinacota", "comunas": ["ARICA", "CAMARONES", "GENERAL LAGOS", "PUTRE"]}, {"region": "Tarapacá", "comunas": ["ALTO HOSPICIO", "CAMIÑA", "COLCHANE", "HUARA", "IQUIQUE", "PICA", "POZO AL MONTE"]}, {"region": "Antofagasta", "comunas": ["ANTOFAGASTA", "CALAMA", "MARÍA ELENA", "MEJILLONES", "OLLAGÜE", "SAN PEDRO DE ATACAMA", "SIERRA GORDA", "TALTAL", "TOCOPILLA"]}, {"region": "Atacama", "comunas": ["ALTO DEL CARMEN", "CALDERA", "CHAÑARAL", "COPIAPÓ", "DIEGO DE ALMAGRO", "FREIRINA", "HUASCO", "TIERRA AMARILLA", "VALLENAR"]}, {"region": "Coquimbo", "comunas": ["ANDACOLLO", "CANELA", "COMBARBALÁ", "COQUIMBO", "ILLAPEL", "LA HIGUERA", "LA SERENA", "LOS VILOS", "MONTE PATRIA", "OVALLE", "PAIHUANO", "PUNITAQUI", "RÍO HURTADO", "SALAMANCA", "VICUÑA"]}, {"region": "Valparaíso", "comunas": ["ALGARROBO", "CABILDO", "CALLE LARGA", "CARTAGENA", "CASABLANCA", "CATEMU", "CONCÓN", "EL QUISCO", "EL TABO", "HIJUELAS", "ISLA DE PASCUA", "JUAN FERNÁNDEZ", "LA CALERA", "LA CRUZ", "LA LIGUA", "LIMACHE", "LLAY-LLAY", "LOS ANDES", "NOGALES", "OLMUÉ", "PANQUEHUE", "PAPUDO", "PETORCA", "PUCHUNCAVÍ", "PUTAENDO", "QUILLOTA", "QUILPUÉ", "QUINTERO", "RINCONADA", "SAN ANTONIO", "SAN ESTEBAN", "SAN FELIPE", "SANTA MARÍA", "SANTO DOMINGO", "VALPARAISO", "VILLA ALEMANA", "VIÑA DEL MAR", "ZAPALLAR"]}, {"region": "Metropolitana de Santiago", "comunas": ["ALHUÉ", "BUIN", "CALERA DE TANGO", "CERRILLOS", "CERRONAVIA", "COLINA", "CONCHALÍ", "CURACAVÍ", "ELBOSQUE", "ELMONTE", "ESTACIÓN CENTRAL", "HUECHURABA", "INDEPENDENCIA", "ISLA DE MAIPO", "LA CISTERNA", "LA FLORIDA", "LA GRANJA", "LA SCONDES", "LAMPA", "LAP INTANA", "LAREINA", "LO BARNECHEA", "LO ESPEJO", "LOPRADO", "MACUL", "MAIPÚ", "MARÍAPINTO", "MELIPILLA", "PADRE HURTADO", "PAINE", "PEDRO AGUIRRE CERDA", "PEÑAFLOR", "PEÑALOLÉN", "PIRQUE", "PROVIDENCIA", "PUDAHUEL", "PUENTE ALTO", "QUILICURA", "QUINTA NORMAL", "RECOLETA", "RENCA", "SAN BERNARDO", "SAN JOAQUÍN", "SAN JOSÉ DE MAIPO", "SAN MIGUEL", "SAN RAMÓN", "SANPEDRO", "SANTIAGO", "TALAGANTE", "TIL-TIL", "VITACURA", "ÑUÑOA"]}, {"region": "Libertador Gral. Bernardo O'Higgins", "comunas": ["CHIMBARONGO", "CHÉPICA", "CODEGUA", "COINCO", "COLTAUCO", "DOÑIHUE", "GRANEROS", "LAESTRELLA", "LAS CABRAS", "LITUECHE", "LOLOL", "MACHALÍ", "MALLOA", "MARCHIGÜE", "NANCAGUA", "NAVIDAD", "OLIVAR", "PALMILLA", "PAREDONES", "PERALILLO", "PEUMO", "PICHIDEGUA", "PICHILEMU", "PLACILLA", "PUMANQUE", "QUINTA DE TILCOCO", "RANCAGUA", "RENGO", "REQUÍNOA", "SAN FERNANDO", "SAN FRANCISCO DE MOSTAZAL", "SAN VICENTE", "SANTA CRUZ"]}, {"region": "Maule", "comunas": ["CAUQUENES", "CHANCO", "COLBÚN", "CONSTITUCIÓN", "CUREPTO", "CURICÓ", "EMPEDRADO", "HUALAÑÉ", "LICANTÉN", "LINARES", "LONGAVÍ", "MAULE", "MOLINA", "PARRAL", "PELARCO", "PELLUHUE", "PENCAHUE", "RAUCO", "RETIRO", "ROMERAL", "RÍOCLARO", "SAGRADA FAMILIA", "SAN CLEMENTE", "SAN JAVIER", "SAN RAFAEL", "TALCA", "TENO", "VICHUQUÉN", "VILLA ALEGRE", "YERBAS BUENAS"]}, {"region": "Ñuble", "comunas": ["BULNES", "CHILLÁN", "CHILLÁN VIEJO", "COBQUECURA", "COELEMU", "COIHUECO", "EL CARMEN", "NINHUE", "PEMUCO", "PINTO", "PORTEZUELO", "QUILLÓN", "QUIRIHUE", "RÁNQUIL", "SAN CARLOS", "SAN FABIÁN", "SAN IGNACIO", "SAN NICOLÁS", "TREHUACO", "YUNGAY", "ÑIQUÉN"]}, {"region": "Biobío", "comunas": ["ALTO BIOBÍO", "ANTUCO", "ARAUCO", "CABRERO", "CAÑETE", "CHIGUAYANTE", "CONCEPCIÓN", "CONTULMO", "CORONEL", "CURANILAHUE", "FLORIDA", "HUALPÉN", "HUALQUI", "LAJA", "LEBU", "LOS ALAMOS", "LOS ANGELES", "LOTA", "MULCHÉN", "NACIMIENTO", "NEGRETE", "PENCO", "QUILACO", "QUILLECO", "SAN PEDRO DE LA PAZ", "SAN ROSENDO", "SANTA BÁRBARA", "SANTA JUANA", "TALCAHUANO", "TIRÚA", "TOMÉ", "TUCAPEL", "YUMBEL"]}, {"region": "Araucanía", "comunas": ["ANGOL", "CARAHUE", "CHOLCHOL", "COLLIPULLI", "CUNCO", "CURACAUTÍN", "CURARREHUE", "ERCILLA", "FREIRE", "GALVARINO", "GORBEA", "LAUTARO", "LONCOCHE", "LONQUIMAY", "LOS SAUCES", "LUMACO", "MELIPEUCO", "NUEVA IMPERIAL", "PADRE LAS CASAS", "PERQUENCO", "PITRUFQUÉN", "PUCÓN", "PURÉN", "RENAICO", "SAAVEDRA", "TEMUCO", "TEODORO SCHMIDT", "TOLTÉN", "TRAIGUÉN", "VICTORIA", "VILCÚN", "VILLARRICA"]}, {"region": "Los Ríos", "comunas": ["CORRAL", "FUTRONO", "LAGORANCO", "LANCO", "LAUNIÓN", "LOS LAGOS", "MARIQUINA", "MÁFIL", "PAILLACO", "PANGUIPULLI", "RÍOBUENO", "VALDIVIA"]}, {"region": "Los Lagos", "comunas": ["ANCUD", "CALBUCO", "CASTRO", "CHAITÉN", "CHONCHI", "COCHAMÓ", "CURACO DE VÉLEZ", "DALCAHUE", "FRESIA", "FRUTILLAR", "FUTALEUFÚ", "HUALAIHUÉ", "LLANQUIHUE", "LOS MUERMOS", "MAULLÍN", "OSORNO", "PALENA", "PUERTO MONTT", "PUERTO OCTAY", "PUERTO VARAS", "PUQUELDÓN", "PURRANQUE", "PUYEHUE", "QUEILÉN", "QUELLÓN", "QUEMCHI", "QUINCHAO", "RÍONEGRO", "SAN JUAN DE LA COSTA", "SANPABLO"]}, {"region": "Aisén del Gral. Carlos Ibáñez del Campo", "comunas": ["AISÉN", "CHILE CHICO", "CISNES", "COCHRANE", "COYHAIQUE", "GUAITECAS", "LAGO VERDE", "O'HIGGINS", "RÍOIBÁÑEZ", "TORTEL"]}, {"region": "Magallanes y de la Antártica Chilena", "comunas": ["ANTARTICA", "CABO DE HORNOS", "LAGUNA BLANCA", "NATALES", "PORVENIR", "PRIMAVERA", "PUNTA ARENAS", "RÍOVERDE", "SAN GREGORIO", "TIMAUKEL", "TORRES DEL PAINE"]}];
const DATA_PAISES=["Afganistán", "Albania", "Alemania", "Algeria", "Andorra", "Angola", "Anguilla", "Antigua y Barbuda", "Antillas Holandesas", "Arabia Saudita", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaiyán", "Bahamas", "Bahrein", "Bangladesh", "Barbados", "Bélgica", "Belice", "Benín", "Bermudas", "Bielorrusia", "Bolivia", "Bosnia y Herzegovina", "Botsuana", "Brasil", "Brunéi", "Bulgaria", "Burkina Faso", "Burundi", "Bután", "Cabo Verde", "Camboya", "Camerún", "Canadá", "Chad", "Chile", "China", "Chipre", "Colombia", "Comores", "Congo (Brazzaville)", "Congo (Kinshasa)", "Cook, Islas", "Corea del Norte", "Corea del Sur", "Costa de Marfil", "Costa Rica", "Croacia", "Cuba", "Dinamarca", "Djibouti, Yibuti", "Ecuador", "Egipto", "El Salvador", "Emiratos Árabes Unidos", "Eritrea", "Eslovaquia", "Eslovenia", "España", "Estados Unidos", "Estonia", "Etiopía", "Feroe, Islas", "Filipinas", "Finlandia", "Fiyi", "Francia", "Gabón", "Gambia", "Georgia", "Ghana", "Gibraltar", "Granada", "Grecia", "Groenlandia", "Guadalupe", "Guatemala", "Guernsey", "Guinea", "Guinea Ecuatorial", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungría", "India", "Indonesia", "Irak", "Irán", "Irlanda", "Isla Pitcairn", "Islandia", "Islas Salomón", "Islas Turcas y Caicos", "Islas Virgenes Británicas", "Israel", "Italia", "Jamaica", "Japón", "Jersey", "Jordania", "Kazajstán", "Kenia", "Kirguistán", "Kiribati", "Kuwait", "Laos", "Lesotho", "Letonia", "Líbano", "Liberia", "Libia", "Liechtenstein", "Lituania", "Luxemburgo", "Macedonia", "Madagascar", "Malasia", "Malawi", "Maldivas", "Malí", "Malta", "Man, Isla de", "Marruecos", "Martinica", "Mauricio", "Mauritania", "México", "Moldavia", "Mónaco", "Mongolia", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Nicaragua", "Níger", "Nigeria", "Norfolk Island", "Noruega", "Nueva Caledonia", "Nueva Zelanda", "Omán", "Países Bajos, Holanda", "Pakistán", "Panamá", "Papúa-Nueva Guinea", "Paraguay", "Perú", "Polinesia Francesa", "Polonia", "Portugal", "Puerto Rico", "Qatar", "Reino Unido", "República Checa", "República Dominicana", "Reunión", "Ruanda", "Rumanía", "Rusia", "Sáhara Occidental", "Samoa", "San Cristobal y Nevis", "San Marino", "San Pedro y Miquelón", "San Tomé y Príncipe", "San Vincente y Granadinas", "Santa Elena", "Santa Lucía", "Senegal", "Serbia y Montenegro", "Seychelles", "Sierra Leona", "Singapur", "Siria", "Somalia", "Sri Lanka", "Sudáfrica", "Sudán", "Suecia", "Suiza", "Surinam", "Swazilandia", "Tadjikistan", "Tailandia", "Taiwan", "Tanzania", "Timor Oriental", "Togo", "Tokelau", "Tonga", "Trinidad y Tobago", "Túnez", "Turkmenistan", "Turquía", "Tuvalu", "Ucrania", "Uganda", "Uruguay", "Uzbekistán", "Vanuatu", "Venezuela", "Vietnam", "Wallis y Futuna", "Yemen", "Zambia", "Zimbabwe"];
const DATA_NOTARIAS=["CONSERVADOR DE AYSEN", "CONSERVADOR DE BULNES", "CONSERVADOR DE CABRERO", "CONSERVADOR DE CASABLANCA", "CONSERVADOR DE CASTRO", "CONSERVADOR DE CAUQUENES", "CONSERVADOR DE CHIGUAYANTE", "CONSERVADOR DE CON-CON", "CONSERVADOR DE COYHAIQUE", "CONSERVADOR DE CURACAUTIN", "CONSERVADOR DE LA LIGUA", "CONSERVADOR DE LA UNION", "CONSERVADOR DE LAUTARO", "CONSERVADOR DE MOLINA", "CONSERVADOR DE PANGUIPULLI", "CONSERVADOR DE PARRAL", "CONSERVADOR DE PITRUFQUEN", "CONSERVADOR DE POZO ALMONTE", "CONSERVADOR DE PUERTO VARAS", "CONSERVADOR DE QUINTERO", "CONSERVADOR DE SAN JAVIER", "CONSERVADOR DE SAN PEDRO DE LA PAZ", "CONSERVADOR DE VICTORIA", "NOTARIA  JORGE ENRIQUE FIGUEROA HERRERA", "NOTARIA  Nro 7 DE SAN MIGUEL (UGALDE CASTRO)", "NOTARIA 1a (ELGUETA SALDIVIA)", "NOTARIA CERRILLOS (FINALTERI BARRA)", "NOTARIA DE ALTO HOSPICIO (CORTES OLGUIN)", "NOTARIA DE AYSEN (CALDERON AMESTICA)", "NOTARIA DE CABILDO (ZUNIGA REINOSO)", "NOTARIA DE CABRERO (RAMIREZ ALVAREZ)", "NOTARIA DE CARTAGENA (PINA RODRIGUEZ)", "NOTARIA DE CERRO NAVIA (DEL SOLAR SOTO)", "NOTARIA DE CHIGUAYANTE (QUINTANA JARAMILLO)", "NOTARIA DE CHIMBARONGO (CAMIRUAGA MARSHALL)", "NOTARIA DE COLINA (AHUMADA RODRIGUEZ)", "NOTARIA DE CURACAUTIN (SANTOS DIAZ)", "NOTARIA DE CURACAVI (MUNIZAGA PENDOLA)", "NOTARIA DE DIEGO DE ALMAGRO", "NOTARIA DE EL BOSQUE (MUNOZ IGLESIAS)", "NOTARIA DE ESTACION CENTRAL (NAHUEL LOPEZ)", "NOTARIA DE FRESIA (JACOB NUNEZ)", "NOTARIA DE FRUTILLAR (PALOMO TORNVALL)", "NOTARIA DE FUTRONO (HENRIQUEZ VALLEJOS)", "NOTARIA DE GALVARINO ( HUINCA CARILAO)", "NOTARIA DE GRANEROS (PEREZ DIAZ)", "NOTARIA DE HUALPEN (HERNANDEZ MANZANO)", "NOTARIA DE HUECHURABA (BERTOLINO RENDIC)", "NOTARIA DE ILLAPEL (TORO MARANGUNIC)", "NOTARIA DE JUAN FERNANDEZ", "NOTARIA DE LA LIGUA (GOMEZ CORTES)", "NOTARIA DE LA UNION ( ANGULO SANDOVAL)", "NOTARIA DE LAMPA (MIRANDA CORDOVA)", "NOTARIA DE LAUTARO (CRUZ GUTIERREZ)", "NOTARIA DE LIMACHE (FIERRO CIFUENTES)", "NOTARIA DE LLANQUIHUE (SEGURA DONOSO)", "NOTARIA DE LO ESPEJO (LEIVA CARVAJAL)", "NOTARIA DE LOS ALAMOS (BESNIER RIOS)", "NOTARIA DE LOS LAGOS (ROJAS PONTIGO)", "NOTARIA DE LOS VILOS (BARRANTES DIAZ)", "NOTARIA DE MACHALI (SILVA ACHARAN)", "NOTARIA DE MARIQUINA (MENCARINI SOLERVICENS)", "NOTARIA DE MOLINA (DEBEUF PONCE DE LEON)", "NOTARIA DE NIQUEN (FUENTES PARADA)", "NOTARIA DE OLMUE (ESPINOSA SCHIAPPACASE)", "NOTARIA DE PADRE LAS CASAS (ABARZUA VERGARA)", "NOTARIA DE PAINE (YURIN ARAYA)", "NOTARIA DE PANGUIPULLI (FIERRO RUEDLINGER)", "NOTARIA DE PARRAL (PEREZ AGUILERA)", "NOTARIA DE PITRUFQUEN (FERRAND MIRANDA)", "NOTARIA DE PUCHUNCAVI (GARCIA MECHSNER)", "NOTARIA DE PUCON (ESPINOZA GARRIDO)", "NOTARIA DE PUERTO VARAS (ESPINOSA BANCALARI)", "NOTARIA DE QUILLON (NOVOA VALDES)", "NOTARIA DE RENCA (AHUMADA CASTILLO)", "NOTARIA DE RETIRO (ROMERO PARADA)", "NOTARIA DE SALAMANCA (PERALTA MORALES)", "NOTARIA DE SAN CLEMENTE (JARA OPAZO)", "NOTARIA DE SAN ESTEBAN (AYLWIN DOMINGO)", "NOTARIA DE SAN JOAQUIN (ARAVENA ESTOBAR)", "NOTARIA DE SIERRA GORDA (GAJARDO ALCAYAGA)", "NOTARIA DE TOME (MIGUEZ NUNEZ)", "NOTARIA DE TUCAPEL (LARENAS VEGA)", "NOTARIA DE VICTORIA (PEINAN AILLAPAN)", "NOTARIA DE VILLARRICA (MUNOZ FLORES)", "NOTARIA ELIAS JARUFE ROJAS", "NOTARIA JORGE REYES BESSONE", "NOTARIA LA CALERA (ARGANDONA MONTIEL)", "NOTARIA MABEL LLANO DIAZ", "NOTARIA NA  1 PUENTE ALTO (CORTES YAKCICH)", "NOTARIA NA 1 DE QUINTA NORMAL (CARTAGENA SANCHEZ)", "NOTARIA NA 5 DE SAN PEDRO DE ATACAMA (SCHWERTER)", "NOTARIA Nro 1 DE ANGOL (FUENTES CACERES)", "NOTARIA Nro 1 DE ANTOFAGASTA (LEIVA PEREZ)", "NOTARIA Nro 1 DE ARICA (PALMA SOTOMAYOR)", "NOTARIA Nro 1 DE BUIN (ALVAREZ LORCA)", "NOTARIA Nro 1 DE BULNES (GUTIERREZ VALVERDE)", "NOTARIA Nro 1 DE CALAMA ( JIMENEZ SEGURA)", "NOTARIA Nro 1 DE CASABALANCA (ESTRADA ALVARADO)", "NOTARIA Nro 1 DE CASTRO (TORRES AMPUERO)", "NOTARIA Nro 1 DE CAUQUENES (OSORIO RIQUELME)", "NOTARIA Nro 1 DE CHILLAN (PAREDES AGUILERA)", "NOTARIA Nro 1 DE CONCEPCION (SALGADO SEPULVEDA)", "NOTARIA Nro 1 DE CONCHALI (CONTRERAS FUENTES)", "NOTARIA Nro 1 DE CONSTITUCION (MERA CORREA)", "NOTARIA Nro 1 DE COPIAPO (NEHME CARPANETTI)", "NOTARIA Nro 1 DE COQUIMBO (PRELLER ARAYA)", "NOTARIA Nro 1 DE CORONEL (ROJAS JAMETT)", "NOTARIA Nro 1 DE COYHAIQUE (RAND GONZALEZ)", "NOTARIA Nro 1 DE CURICO (ARAYA LOPEZ)", "NOTARIA Nro 1 DE INDEPENDENCIA (GUERRA PINTO)", "NOTARIA Nro 1 DE IQUIQUE (GONZALEZ BARRIGA)", "NOTARIA Nro 1 DE LA CISTERNA (OSSA CUEVAS)", "NOTARIA Nro 1 DE LA FLORIDA (MONJE SILVA)", "NOTARIA Nro 1 DE LA REINA (MARTINEZ LOAIZA)", "NOTARIA Nro 1 DE LA SERENA (VILLARINO KRUMM)", "NOTARIA Nro 1 DE LAS CONDES (SIERRA MEJIA)", "NOTARIA Nro 1 DE LINARES (ULLOA CONCHA)", "NOTARIA Nro 1 DE LO BARNECHEA (SALVADOR CABEZAS)", "NOTARIA Nro 1 DE LO PRADO (ARAVENA GAJARDO)", "NOTARIA Nro 1 DE LOS ANDES (LORIE DABOVIC)", "NOTARIA Nro 1 DE LOS ANGELES (ALI ARCAS)", "NOTARIA Nro 1 DE MACUL (SAAVEDRA MUAOZ)", "NOTARIA Nro 1 DE MAIPU (POZA MATUS)", "NOTARIA Nro 1 DE NUNOA (ROCO CAMPOS)", "NOTARIA Nro 1 DE OSORNO (SADA AZNAR)", "NOTARIA Nro 1 DE OVALLE (LEIVA ILABACA)", "NOTARIA Nro 1 DE PENAFLOR (MIRANDA HIRIART)", "NOTARIA Nro 1 DE PENALOLEN", "NOTARIA Nro 1 DE PROVIDENCIA (RODRIGUEZ BURR)", "NOTARIA Nro 1 DE PUDAHUEL (FARR TAPIA)", "NOTARIA Nro 1 DE PUENTE ALTO (TIZNADO MULLER)", "NOTARIA Nro 1 DE PUERTO MONTT (GOMEZ BROWN)", "NOTARIA Nro 1 DE QUILICURA ( DELGADO GUTIERREZ)", "NOTARIA Nro 1 DE QUILLOTA (ABUYERES JADUE)", "NOTARIA Nro 1 DE QUINTERO (JEANNERET MARTINEZ)", "NOTARIA Nro 1 DE RANCAGUA (CARVALLO CASTILLO)", "NOTARIA Nro 1 DE RENGO (FALCON VALENCIA)", "NOTARIA Nro 1 DE SAN BERNARDO (RUIZ BAHAMONDES)", "NOTARIA Nro 1 DE SAN CARLOS (IRRIBARRA SALAZAR)", "NOTARIA Nro 1 DE SAN FERNANDO (ORTEGA)", "NOTARIA Nro 1 DE SAN MIGUEL (ORTUZAR RODRIGUEZ)", "NOTARIA Nro 1 DE SAN VICENTE (CAMIRUAGA PIZARRO)", "NOTARIA Nro 1 DE SANTIAGO (CAMILLA SANDOVAL)", "NOTARIA Nro 1 DE TALAGANTE (NORDETTI DUMAS)", "NOTARIA Nro 1 DE TALCA (RAMIREZ FUENTES)", "NOTARIA Nro 1 DE TALCAHUANO (BRAVO VENEGAS)", "NOTARIA Nro 1 DE TEMUCO (VALDEBENITO SALGADO)", "NOTARIA Nro 1 DE VALDIVIA (VALENZUELA PEREZ)", "NOTARIA Nro 1 DE VALPARAISO (DE LA CRUZ SERRART)", "NOTARIA Nro 1 DE VILLA ALEMANA (ORDONEZ CORTES)", "NOTARIA Nro 1 DE VINA DEL MAR (HERNANDEZ MUNOZ)", "NOTARIA Nro 1 DE VITACURA (FIGUEROA CARVAJAL)", "NOTARIA Nro 1 DE YUNGAY (ROSSEMBLATT PRADENAS)", "NOTARIA Nro 1 SAN ANTONIO (RICCI)", "NOTARIA Nro 1 de QUILPUE (SILVA VARGAS)", "NOTARIA Nro 1 de SAN RAMON (MEDINA RICCI)", "NOTARIA Nro 10 DE SANTIAGO ( PIRAINO AVELLO)", "NOTARIA Nro 11 DE CONCEPCION (ARRIAGADA BASAUR)", "NOTARIA Nro 11 DE SANTIAGO (BELMONTE AGUIRRE)", "NOTARIA Nro 12 DE CONCEPCION (AVELLO SAN MARTIN)", "NOTARIA Nro 12 DE SANTIAGO (RETAMAL GRIMBERG)", "NOTARIA Nro 13 DE SANTIAGO (HALES BESELER)", "NOTARIA Nro 14 DE SANTIAGO (RODRIGUEZ URIBE)", "NOTARIA Nro 15 DE SANTIAGO (ROJAS ARRIAGADA)", "NOTARIA Nro 16 DE SANTIAGO (MENDOZA ESCALAS)", "NOTARIA Nro 17 DE SANTIAGO (GALAN BAUERLE)", "NOTARIA Nro 18 DE SANTIAGO (GUTIERREZ RIVERA)", "NOTARIA Nro 19 DE SANTIAGO ( REVECO HORMAZABAL)", "NOTARIA Nro 2 DE ANGOL (DE LA HARPE PALMA)", "NOTARIA Nro 2 DE ANTOFAGASTA (CONTRERAS OLIVARES)", "NOTARIA Nro 2 DE ARICA (LAZCANO ARRIAGADA)", "NOTARIA Nro 2 DE BUIN (ESCOBAR DIAZ)", "NOTARIA Nro 2 DE CALAMA (LY VALLOTTON)", "NOTARIA Nro 2 DE CASTRO (ROLACK FUENTES)", "NOTARIA Nro 2 DE CAUQUENES (ELGUETA CANCINO)", "NOTARIA Nro 2 DE CHILLAN (TEJOS HENRIQUEZ)", "NOTARIA Nro 2 DE CONCEPCION (HIDALGO SARZOSA)", "NOTARIA Nro 2 DE COPIAPO (CONTRERAS FUENTES)", "NOTARIA Nro 2 DE COQUIMBO (HENRIQUEZ ENCAMILLA)", "NOTARIA Nro 2 DE CORONEL (TOLEDO MACHUCA)", "NOTARIA Nro 2 DE COYHAIQUE (CONTRERAS PIDERIT)", "NOTARIA Nro 2 DE CURICO (MESSEN CONCHA)", "NOTARIA Nro 2 DE LA CISTERNA  (ARENAS BENONI)", "NOTARIA Nro 2 DE LA FLORIDA (BERNALES LARRAIN)", "NOTARIA Nro 2 DE LA GRANJA (SALAMANCA ORTEGA)", "NOTARIA Nro 2 DE LAS CONDES (SAIZ DEL CAMPO)", "NOTARIA Nro 2 DE LINARES (GONZALEZ DEL RIEGO)", "NOTARIA Nro 2 DE LO BARNECHEA (COROMINAS MELLADO)", "NOTARIA Nro 2 DE LOS ANDES (ORDONEZ URBINA)", "NOTARIA Nro 2 DE LOS ANGELES (CANTUARIAS COSTA)", "NOTARIA Nro 2 DE MAIPU (URENDA BILICIC)", "NOTARIA Nro 2 DE MELIPILLA (MARTINEZ LOAIZA)", "NOTARIA Nro 2 DE OVALLE (CABRERA ALBARRAN)", "NOTARIA Nro 2 DE PENALOLEN (SOLAR PEREZ)", "NOTARIA Nro 2 DE PROVIDENCIA (CELIS URRUTIA)", "NOTARIA Nro 2 DE PUDAHUEL (ESCOBAR CARO)", "NOTARIA Nro 2 DE PUERTO MONTT (SAN MARTIN)", "NOTARIA Nro 2 DE PUNTA ARENAS (MARTINEZ DEMANDES)", "NOTARIA Nro 2 DE QUILLOTA (MONROY FOIX)", "NOTARIA Nro 2 DE RANCAGUA (SCHWENKE ZUNIGA)", "NOTARIA Nro 2 DE RENGO (VALENZUELA VALDES)", "NOTARIA Nro 2 DE SAN BERNARDO (SUAZO VIVANCO)", "NOTARIA Nro 2 DE SAN FELIPE (DE TUDELA VEGA)", "NOTARIA Nro 2 DE SAN FERNANDO (MORENO SANCHEZ)", "NOTARIA Nro 2 DE SAN MIGUEL (DIAZ CONTRERAS)", "NOTARIA Nro 2 DE SAN VICENTE (GARCIA ASTABURUAGA)", "NOTARIA Nro 2 DE SANTA CRUZ (CASTRO GUTIERREZ)", "NOTARIA Nro 2 DE SANTIAGO (LEIVA CARVAJAL)", "NOTARIA Nro 2 DE TALCA (ORTIZ SCHINDLER)", "NOTARIA Nro 2 DE TALCAHUANO (SANTIBANEZ TORRES)", "NOTARIA Nro 2 DE TEMUCO (VIDAL MORAGA)", "NOTARIA Nro 2 DE VALDIVIA (CARDEMIL IBANEZ)", "NOTARIA Nro 2 DE VALLENAR (URQUIETA GARCIA)", "NOTARIA Nro 2 DE VILLA ALEMANA (SOTOMAYOR GRAEPP)", "NOTARIA Nro 2 DE VINA DEL MAR (FUENZALIDA RODRIGU)", "NOTARIA Nro 2 DE VITACURA (MALDONADO CONCHA)", "NOTARIA Nro 2 LA SERENA (OSSES REVECO)", "NOTARIA Nro 2 OSORNO (EISENDECHER BERTIN)", "NOTARIA Nro 2 SAN ANTONIO (LE ROUX PERALTA)", "NOTARIA Nro 2 de IQUIQUE (CAVIERES ARAYA)", "NOTARIA Nro 2 de QUILPUE (GONZALEZ LOPEZ)", "NOTARIA Nro 2 de VALPARAISO (TAVOLARI OLIVEROS)", "NOTARIA Nro 20 DE SANTIAGO (PEREZ ANDUEZA)", "NOTARIA Nro 21 DE SANTIAGO (AMIGO ARANCIBIA)", "NOTARIA Nro 22 DE SANTIAGO (ALARCON LARA)", "NOTARIA Nro 23 DE SANTIAGO (GONZALEZ CARVALLO)", "NOTARIA Nro 24 DE SANTIAGO ( ABARCA ENCINA)", "NOTARIA Nro 25 DE SANTIAGO (SEPULVEDA RIVERA)", "NOTARIA Nro 26 DE SANTIAGO (QUEZADA MORENO)", "NOTARIA Nro 27 DE SANTIAGO (DONOSO GOMIEN)", "NOTARIA Nro 28 DE SANTIAGO (ULLOA OJEDA)", "NOTARIA Nro 29 DE SANTIAGO (REHBEIN UTRERAS)", "NOTARIA Nro 3 DE ANTOFAGASTA (HURTADO PERALTA)", "NOTARIA Nro 3 DE ARICA (SOTO HERNANDEZ)", "NOTARIA Nro 3 DE CALAMA (PINTO RAMOS)", "NOTARIA Nro 3 DE CHILLAN (BUSTOS BONNIARDI)", "NOTARIA Nro 3 DE COLINA (BENEVENTI ALFARO)", "NOTARIA Nro 3 DE CONCEPCION (DONAT GUTIERREZ)", "NOTARIA Nro 3 DE COPIAPO (HERNANDEZ SOTO)", "NOTARIA Nro 3 DE COQUIMBO (MATURANA LEPELEY)", "NOTARIA Nro 3 DE CURICO (FUENTES ACEVEDO)", "NOTARIA Nro 3 DE IQUIQUE (ARAYA  BLAZINA)", "NOTARIA Nro 3 DE LA CISTERNA (SILVA ARRIAGADA)", "NOTARIA Nro 3 DE LA SERENA (BUSTOS MOLINA)", "NOTARIA Nro 3 DE LINARES (ALVAREZ DONOSO)", "NOTARIA Nro 3 DE LOS ANGELES (CARRILLO FLORES)", "NOTARIA Nro 3 DE MELIPILLA ( CONTRERAS MIRANDA)", "NOTARIA Nro 3 DE OSORNO (FERNANDEZ ATUEZ)", "NOTARIA Nro 3 DE OVALLE (CONTRERAS MUNDACA)", "NOTARIA Nro 3 DE PROVIDENCIA (LOYOLA OJEDA)", "NOTARIA Nro 3 DE PUERTO MONTT (RAIL PACHECO)", "NOTARIA Nro 3 DE PUERTO VARAS (CARCAMO VELASQUEZ)", "NOTARIA Nro 3 DE PUNTA ARENAS (MATUS CUEVAS)", "NOTARIA Nro 3 DE RANCAGUA (CHACON CEBALLOS)", "NOTARIA Nro 3 DE SAN BERNARDO (LIZANA ARENAS)", "NOTARIA Nro 3 DE SAN MIGUEL (VILLASENOR PAVEZ )", "NOTARIA Nro 3 DE SANTIAGO (OGALDE RODRIGUEZ)", "NOTARIA Nro 3 DE TALCA (HORMAZABAL ALEGRIA)", "NOTARIA Nro 3 DE TALCAHUANO  (AVILA URRUTIA)", "NOTARIA Nro 3 DE TEMUCO (ABARZUA FERNANDEZ)", "NOTARIA Nro 3 DE VALDIVIA (SALGADO CHAMORRO)", "NOTARIA Nro 3 DE VALPARAISO (BAEZA NAVARRO)", "NOTARIA Nro 3 DE VINA DEL MAR (GERVASIO ZAMUDIO)", "NOTARIA Nro 3 DE VITACURA (ORTIZ CARMONA)", "NOTARIA Nro 3 de QUILPUE (VILLALOBOS PELLEGRINI)", "NOTARIA Nro 30 DE SANTIAGO (GUTIERREZ LOPEZ)", "NOTARIA Nro 31 DE SANTIAGO (PINOCHET CAVIERES)", "NOTARIA Nro 32 DE SANTIAGO (VARAS FERNANDEZ)", "NOTARIA Nro 33 DE SANTIAGO (PINA CUEVAS)", "NOTARIA Nro 34 DE SANTIAGO (DIEZ MORELLO)", "NOTARIA Nro 35 DE SANTIAGO (JOPIA NAVARRO)", "NOTARIA Nro 36 DE SANTIAGO (RIEUTORD ALVARADO)", "NOTARIA Nro 37 DE SANTIAGO (VASQUEZ AVENDANO)", "NOTARIA Nro 38 DE SANTIAGO (LASCAR MERINO)", "NOTARIA Nro 39 DE SANTIAGO (QUINTANILLA LEON)", "NOTARIA Nro 4 DE ANTOFAGASTA (TREUER)", "NOTARIA Nro 4 DE ARICA (VILCHES FUENTES)", "NOTARIA Nro 4 DE CALAMA (NEIRA NOVOA)", "NOTARIA Nro 4 DE CHILLAN (ALVAREZ DIAZ)", "NOTARIA Nro 4 DE CONCEPCION (ROJAS VERGARA)", "NOTARIA Nro 4 DE COPIAPO (MORALES GONZALEZ)", "NOTARIA Nro 4 DE CURICO (ORTEGA ALUL)", "NOTARIA Nro 4 DE IQUIQUE (MENICONI ASFURA)", "NOTARIA Nro 4 DE LA CISTERNA (HERMIDA BREVIS)", "NOTARIA Nro 4 DE LA SERENA (ONATE MIRANDA)", "NOTARIA Nro 4 DE LOS ANGELES (ESPINOZA GUTIERREZ)", "NOTARIA Nro 4 DE OSORNO (VALENZUELA GONZALEZ)", "NOTARIA Nro 4 DE PUENTE ALTO (VEGA ALVARADO)", "NOTARIA Nro 4 DE PUERTO MONTT (MENDEZ GALLARDO)", "NOTARIA Nro 4 DE SAN MIGUEL (HARAMBILLET MELERO)", "NOTARIA Nro 4 DE SANTIAGO (GOMILA GATICA)", "NOTARIA Nro 4 DE TALCA (SILVA SCIBERRAS)", "NOTARIA Nro 4 DE TEMUCO (LEYTON CARVAJAL)", "NOTARIA Nro 4 DE VALDIVIA (RODRIGUEZ RUIZ)", "NOTARIA Nro 4 DE VALPARAISO (CONTRERAS GUERRERO)", "NOTARIA Nro 4 DE VINA DEL MAR (STACK LARA)", "NOTARIA Nro 4 de COQUIMBO (VILLALOBOS PELLEGRINI)", "NOTARIA Nro 40 DE SANTIAGO (SOTOMAYOR GRAEPP)", "NOTARIA Nro 41 DE SANTIAGO (FABRES BORDEU)", "NOTARIA Nro 42 DE SANTIAGO (GONZALEZ SALINAS)", "NOTARIA Nro 43 DE SANTIAGO (REINOSO CIFUENTES)", "NOTARIA Nro 44 DE SANTIAGO (SANCHEZ TAPIA)", "NOTARIA Nro 45 DE SANTIAGO (SAN MARTIN SCHRODER)", "NOTARIA Nro 46 DE SANTIAGO (ITURRA MUNOZ)", "NOTARIA Nro 48 DE SANTIAGO (MANRIQUEZ HUERTA)", "NOTARIA Nro 49 DE SANTIAGO (SCHRAMM LOPEZ)", "NOTARIA Nro 5 DE ANTOFAGASTA (URBINA RESZCZYNSKI)", "NOTARIA Nro 5 DE CHILLAN (SUAREZ SANCHEZ)", "NOTARIA Nro 5 DE CONCEPCION (WUNKHAUS RIGART)", "NOTARIA Nro 5 DE COQUIMBO (MONTESINO BIANCHI)", "NOTARIA Nro 5 DE IQUIQUE (CHACON VICENTELO)", "NOTARIA Nro 5 DE LA CISTERNA (SANHUEZA TASSO)", "NOTARIA Nro 5 DE LA SERENA (TORREALBA ZILIANI)", "NOTARIA Nro 5 DE OVALLE (GALLEGUILLOS CARVAJAL)", "NOTARIA Nro 5 DE PUERTO MONTT (BARRIA GUTIERREZ)", "NOTARIA Nro 5 DE SANTIAGO (LATORRE LARRAIN)", "NOTARIA Nro 5 DE TALCA (DURAN PALMA)", "NOTARIA Nro 5 DE TEMUCO (TADRES HALES)", "NOTARIA Nro 5 DE VALPARISO (WENDT GAGGERO)", "NOTARIA Nro 5 DE VINA DEL MAR (OLATE GONZALEZ)", "NOTARIA Nro 5 SAN MIGUEL (FUENZALIDA ROBLEDO)", "NOTARIA Nro 5 de RANCAGUA (GALVEZ PINO)", "NOTARIA Nro 50 DE SANTIAGO (GOMEZ LUCARES)", "NOTARIA Nro 51 DE SANTIAGO (HOLLMANN OVALLE)", "NOTARIA Nro 6 DE ANTOFAGASTA (MARTINEZ TORRES)", "NOTARIA Nro 6 DE CHILLAN (RODRIGUEZ CORTES)", "NOTARIA Nro 6 DE CONCEPCION (ABURTO CONTARDO)", "NOTARIA Nro 6 DE COQUIMBO (GUTIERREZ GAJARDO)", "NOTARIA Nro 6 DE IQUIQUE (TORO IGLESIAS)", "NOTARIA Nro 6 DE LA SERENA (VIADA OVALLE)", "NOTARIA Nro 6 DE PUENTE ALTO (WOOD ESPINOZA)", "NOTARIA Nro 6 DE PUERTO MONTT (CABEZAS CEPEDA)", "NOTARIA Nro 6 DE SAN MIGUEL (MATURANA PEREZ)", "NOTARIA Nro 6 DE SANTIAGO (ROJAS DAMM)", "NOTARIA Nro 6 DE VALPARAISO (OLGUIN VARGAS)", "NOTARIA Nro 6 DE VINA DEL MAR  EN CONCON", "NOTARIA Nro 7 DE CONCEPCION (FERRADA GARRIDO)", "NOTARIA Nro 7 DE RANCAGUA (DIAZ SUAREZ)", "NOTARIA Nro 7 DE SANTIAGO (AROCA GUERRERO)", "NOTARIA Nro 7 DE TALCA (ALMENDRAS BURGOS)", "NOTARIA Nro 7 DE VALPARAISO (MEZA GALLARDO)", "NOTARIA Nro 7 DE VINA DEL MAR (CERDA SILVA)", "NOTARIA Nro 8 DE SAN MIGUEL (COMTE NARANJO)", "NOTARIA Nro 8 DE SANTIAGO (MANQUEHUAL MERY)", "NOTARIA Nro 8 DE VINA DEL MAR (DIAZ LEON)", "NOTARIA Nro 8 VALPARAISO (SEPULVEDA PONCE)", "NOTARIA Nro 9 DE SANTIAGO (GONZALEZ CAAMANO)", "NOTARIA Nro 9 DE TEMUCO (FALCON CARTES)", "NOTARIA Nro 9 VALPARAISO (SARMIENTO MORENO)", "NOTARIA Nro1 DE SAN FELIPE (CORTES MICHEA)", "NOTARIA PAULA GUERRERO CORTES", "NOTARIA POZO ALMONTE (CORDANO CARRIZO)", "NOTARIA SAN JAVIER (ASTORGA PAEZ)", "NOTARIA SAN PEDRO DE LA PAZ (ROJAS CASTILLO)", "NOTARIA SAVA PILOTO", "NOTARIA TENO (QUIROZ TRUJILLO)", "NOTARIA TIERRA AMARILLA (ZAVALA COURRIOL)", "NOTARIA USO EXCLUSIVO SII", "NOTARIA Y ARCHIVO JUDICIAL SAN MIGUEL (BARRENA E)", "NOTARIA Y CONSERVADOR DE  CANETE", "NOTARIA Y CONSERVADOR DE ANCUD", "NOTARIA Y CONSERVADOR DE ANDACOLLO", "NOTARIA Y CONSERVADOR DE ARAUCO", "NOTARIA Y CONSERVADOR DE CABO DE HORNOS", "NOTARIA Y CONSERVADOR DE CALBUCO", "NOTARIA Y CONSERVADOR DE CALDERA", "NOTARIA Y CONSERVADOR DE CARAHUE", "NOTARIA Y CONSERVADOR DE CHAITEN", "NOTARIA Y CONSERVADOR DE CHANARAL", "NOTARIA Y CONSERVADOR DE CHANCO", "NOTARIA Y CONSERVADOR DE CHILE CHICO", "NOTARIA Y CONSERVADOR DE CHILLAN VIEJO", "NOTARIA Y CONSERVADOR DE CISNES", "NOTARIA Y CONSERVADOR DE COCHRANE", "NOTARIA Y CONSERVADOR DE COELEMU", "NOTARIA Y CONSERVADOR DE COIHUECO", "NOTARIA Y CONSERVADOR DE COLLIPULLI", "NOTARIA Y CONSERVADOR DE COMBARBALA", "NOTARIA Y CONSERVADOR DE CUNCO", "NOTARIA Y CONSERVADOR DE CURANILAHUE", "NOTARIA Y CONSERVADOR DE CUREPTO", "NOTARIA Y CONSERVADOR DE DIEGO DE ALMAGRO", "NOTARIA Y CONSERVADOR DE DONIHUE", "NOTARIA Y CONSERVADOR DE EL MONTE", "NOTARIA Y CONSERVADOR DE FLORIDA", "NOTARIA Y CONSERVADOR DE FREIRINA", "NOTARIA Y CONSERVADOR DE FUTALEUFU", "NOTARIA Y CONSERVADOR DE HUALAIHUE", "NOTARIA Y CONSERVADOR DE ILLAPEL", "NOTARIA Y CONSERVADOR DE ISLA DE PASCUA", "NOTARIA Y CONSERVADOR DE LAJA", "NOTARIA Y CONSERVADOR DE LEBU", "NOTARIA Y CONSERVADOR DE LICANTEN", "NOTARIA Y CONSERVADOR DE LITUECHE", "NOTARIA Y CONSERVADOR DE LLAY LLAY", "NOTARIA Y CONSERVADOR DE LONCOCHE", "NOTARIA Y CONSERVADOR DE LONQUIMAY", "NOTARIA Y CONSERVADOR DE LOS MUERMOS", "NOTARIA Y CONSERVADOR DE LOTA", "NOTARIA Y CONSERVADOR DE MARIA ELENA", "NOTARIA Y CONSERVADOR DE MAULLIN", "NOTARIA Y CONSERVADOR DE MEJILLONES", "NOTARIA Y CONSERVADOR DE MELIPILLA", "NOTARIA Y CONSERVADOR DE MONTE PATRIA", "NOTARIA Y CONSERVADOR DE MULCHEN", "NOTARIA Y CONSERVADOR DE NACIMIENTO", "NOTARIA Y CONSERVADOR DE NATALES", "NOTARIA Y CONSERVADOR DE NUEVA IMPERIAL", "NOTARIA Y CONSERVADOR DE PADRE HURTADO", "NOTARIA Y CONSERVADOR DE PAILLACO", "NOTARIA Y CONSERVADOR DE PEDRO AGUIRRE CERDA", "NOTARIA Y CONSERVADOR DE PENCO", "NOTARIA Y CONSERVADOR DE PERALILLO", "NOTARIA Y CONSERVADOR DE PETORCA", "NOTARIA Y CONSERVADOR DE PEUMO", "NOTARIA Y CONSERVADOR DE PICHILEMU", "NOTARIA Y CONSERVADOR DE PINTO", "NOTARIA Y CONSERVADOR DE PIRQUE", "NOTARIA Y CONSERVADOR DE PORVENIR", "NOTARIA Y CONSERVADOR DE PUREN", "NOTARIA Y CONSERVADOR DE PUTAENDO", "NOTARIA Y CONSERVADOR DE QUELLON", "NOTARIA Y CONSERVADOR DE QUINCHAO", "NOTARIA Y CONSERVADOR DE QUIRIHUE", "NOTARIA Y CONSERVADOR DE RIO BUENO", "NOTARIA Y CONSERVADOR DE RIO NEGRO", "NOTARIA Y CONSERVADOR DE SANTA BARBARA", "NOTARIA Y CONSERVADOR DE SANTA CRUZ", "NOTARIA Y CONSERVADOR DE SANTA JUANA", "NOTARIA Y CONSERVADOR DE TALTAL", "NOTARIA Y CONSERVADOR DE TOCOPILLA", "NOTARIA Y CONSERVADOR DE TOLTEN", "NOTARIA Y CONSERVADOR DE TOME", "NOTARIA Y CONSERVADOR DE TRAIGUEN", "NOTARIA Y CONSERVADOR DE VALLENAR", "NOTARIA Y CONSERVADOR DE VICUNA", "NOTARIA Y CONSERVADOR DE VILCUN", "NOTARIA Y CONSERVADOR DE YUMBEL", "NOTARIA Y CONSERVADOR DE YUNGAY", "NOTARIA Y CONSERVADOR DEL MAULE", "NOTARIO Y CONSERVADOR DE ALTO DEL CARMEN", "NOTARIO Y CONSERVADOR DE EL QUISCO", "NOTARIO Y CONSERVADOR DE LONGAVI"];
// UTM mensual (SII). Si la guía expone window.UTM_MENSUAL_GUIA, se usa esa tabla.
const DATA_UTM={"2019": [48353, 48305, 48353, 48353, 48595, 48741, 49033, 49033, 49131, 49229, 49229, 49623], "2020": [49673, 49723, 50021, 50221, 50372, 50372, 50322, 50272, 50322, 50372, 50674, 51029], "2021": [50978, 51131, 51489, 51592, 51798, 52005, 52161, 52213, 52631, 52842, 53476, 54171], "2022": [54442, 54878, 55537, 55704, 56762, 57557, 58248, 58772, 59595, 60310, 60853, 61157], "2023": [61769, 61954, 62450, 62388, 63074, 63263, 63326, 63199, 63452, 63515, 63960, 64216], "2024": [64666, 64343, 64793, 65182, 65443, 65770, 65967, 65901, 66362, 66561, 66628, 67294], "2025": [67429, 67294, 68034, 68306, 68648, 68785, 68923, 68647, 69265, 69265, 69542, 69542], "2026": [69751, 69611, 69889, 69889, 70588, 71506, 71649, 71649, 71721, 72151, 72440, null]};

/* ===== Catálogos y definiciones (transcritos de la lógica del formulario) ===== */
const BANCOS=["DINERO EN EFECTIVO","OTROS","BANCO DE CHILE","BANCO DEL ESTADO DE CHILE","BANCO SANTANDER-CHILE","BANCO DE CREDITO E INVERSIONES","SCOTIABANK CHILE","BANCO ITAÚ CHILE","BANCO BICE","BANCO SECURITY","BANCO FALABELLA","BANCO RIPLEY","BANCO CONSORCIO","BANCO INTERNACIONAL","HSBC BANK (CHILE)","BANCO BTG PACTUAL CHILE","COOPEUCH","CAJA DE COMPENSACIÓN"];
const OPT={
  H:["Nuda propiedad","Fideicomiso de nuda propiedad","Fideicomiso","Plena propiedad"],
  I:[" ","Construcciones","Instalaciones","Plantaciones","Maquinaria","Ganado","Otros"],
  J:["Perpetua","Temporal","Por tiempo indeterminado","Vitalicia"],
  K:["Derechos de aguas","Derechos de minería","Propiedad intelectual","Propiedad Industrial","Otros"],
  L:["Sociedad anónima abierta","Valor mobiliario o efecto público, con cotización bursátil"],
  N:["Nave mayor","Nave menor","Artefacto naval mayor","Artefacto naval menor","Aeronave destino comercial","Aeronave destino particular"],
  O:["Sociedad Colectiva Civil","Sociedad en Comandita Civil"],
  P:["Inmuebles","Participación societaria","Trust, fundacion interés privado o similares","Capitales mobiliarios","Naves, aeronaves o similares","Intangibles","Otros"],
  Q:["Joyas","Antigüedades","Obras de arte","Alfombras y tapices","Colecciones, en general","Pieles finas","Instrumentos musicales","Bibliotecas","Equipamento de oficio","Vinos y licores","Armas","Otros"],
  R:["Bonos","Depósitos a plazo","Fondo Mutuo","Fondo de inversión privado","Efectos públicos","Otros"],
  S:["Fideicomiso en herencia","Otro"], T:["Otro"]
};
const CALIDADES_HER=["Nuda propiedad","Plena propiedad","Fideicomiso","Fideicomiso de nuda propiedad"];
const CALIDADES_LEG=["Nuda propiedad","Plena propiedad","Fideicomiso","Fideicomiso de nuda propiedad","Usufructo","Derecho de uso o habitación"];
const GRAVAMENES=["Tiempo determinado","Condición o a plazo que signifique condición","Vitalicio"];
const EXENCIONES=["Sin exenciones","DFL2 primera compra","Ley Pereira"];
const COND_ESP=["","Muerte Fiduciario","Otro"];
const ESTADOS_CIVILES=["Soltero","Viudo","Divorciado","Casado","Conviviente civil"];
const REGIMENES=["Sociedad Conyugal","Separación total de bienes","Participación en los gananciales","Comunidad"];
const PAR_T=["Ascendiente","Cónyuge o Conviviente Civil","Nieto o descendiente línea directa","Hijo","Hermano","Medio Hermano","Tio","Colateral 3° grado","Colateral 3° grado, simple conjunción","Colateral 4° grado","Colateral 4° grado, simple conjunción","Colateral 5° grado","Colateral 5° grado, simple conjunción","Colateral 6° grado","Colateral 6° grado, simple conjunción","Colateral +6° grado","Sin parentesco","Exento"];
const PAR_I=["Ascendiente","Cónyuge o Conviviente Civil","Hijo","Hermano","Medio Hermano","Tio","Colateral 3° grado","Colateral 3° grado, simple conjunción","Colateral 4° grado","Colateral 4° grado, simple conjunción","Colateral 5° grado","Colateral 5° grado, simple conjunción","Colateral 6° grado","Colateral 6° grado, simple conjunción"];
const PAR_I_CES=[...PAR_I,"Sin parentesco"];
const PAR_REP=["Nieto o descendiente línea directa","Hijo","Hermano","Medio Hermano","Colateral 3° grado","Colateral 4° grado","Colateral 5° grado","Colateral 6° grado","Sin parentesco"];

/* Campo: k=clave, l=etiqueta, t=tipo. Tipos: sel,text,money,calc,date,rut,decim,int,pais,uf,rol,cod,selrol,check
   base = campo cuyo valor se lleva a "Valor"; calidad = tiene botón Opciones avanzadas; leg = puede legarse (testadas) */
const F=(k,l,t,o={})=>Object.assign({k,l,t},o);
const VAL=F("valor","Valor","calc");
const CAL={calidad:true};
const CATS={};
function cat(name,o){o.name=name;o.tipos=o.tipos||["Testadas","Intestadas"];CATS[name]=o;return o}
/* Principales (bienesPorDefecto) */
cat("dinero",{titulo:"(+) Dinero",desc:"Dinero",base:"monto",...CAL,leg:false,fields:[F("inst","Institución","sel",{o:BANCOS}),F("monto","Monto","money"),VAL],help:"Saldos en cuentas, depósitos a la vista y efectivo a la fecha del fallecimiento. El monto se informa en pesos."});
cat("brna",{titulo:"(+) Bienes raíces no agrícolas",desc:"Bienes raíces no agrícolas",base:"valorLegal",...CAL,leg:true,bbrr:true,fields:[F("rol","Rol","rol"),F("comuna","Comuna","text"),F("fechaAdq","Fecha de adquisición","date"),F("valorLegal","Valor legal / Avalúo fiscal","money",{lock:true}),VAL],help:"Se valoran por su avalúo fiscal vigente. Si el inmueble se adquirió dentro de los 3 años anteriores al fallecimiento, se usa el valor de adquisición (art. 46 Ley 16.271)."});
cat("vehiculos",{titulo:"(+) Vehículos",desc:"Vehículos",base:"tasacion",...CAL,leg:true,fields:[F("cod","Código SII","cod"),F("anio","Año Fabricación","int"),F("marca","Marca","text"),F("modelo","Modelo","text"),F("patente","Patente","text"),F("tasacion","Monto Tasación","money"),VAL],help:"Se valoran según la tasación fiscal de vehículos que publica el SII para el año."});
cat("derechosSociedades",{titulo:"(+) Derechos en sociedades de personas",desc:"Derechos en sociedades de personas",base:"valorSoc",...CAL,leg:false,fields:[F("rut","RUT Entidad de Personas","rut"),F("nombre","Nombre Entidad de Personas","text"),F("activos","Total Activos","money"),F("pasivos","Total Pasivos Exigibles","money"),F("valorSoc","Valor sociedad. Leg 16.271","calc"),VAL],help:"Valor = activos menos pasivos exigibles de la sociedad, en la proporción que correspondía al causante."});
cat("menaje",{titulo:"(+) Menaje",desc:"Menaje",base:"valorPrevio",...CAL,leg:true,menaje:true,fields:[F("rol","Presunción 20% (según ROL)","rol"),F("comuna","Comuna","text"),F("descripcion","Detalle menaje","text"),F("valorPrevio","Valor","money"),F("valor","Valor final","calc")],help:"La ley presume que el menaje (muebles y enseres de la casa) vale el 20% del avalúo del inmueble que servía de residencia al causante. Usa \"Buscar\" con el rol para aplicar la presunción, o detalla el menaje con su valor."});
cat("rebajasLegales",{titulo:"(-) Gastos de última enfermedad y otros",desc:"Rebajas legales art, 4° Ley 16 271 art 959 Código Civil, no señaladas previamente",minus:true,fields:[F("descripcion","Descripción","text"),F("valor","Valor","money")],help:"Bajas generales de la herencia del art. 4° de la Ley 16.271: gastos de última enfermedad, de funeral y de la posesión efectiva, entre otros. El formulario del SII titula esta categoría citando también el art. 959 del Código Civil."});
cat("pasivosHeredables",{titulo:"(-) Pasivos heredables",desc:"Pasivos heredables",minus:true,fields:[F("descripcion","Descripción","text"),F("rutAcreedor","RUT acreedor","rut"),F("fechaContrato","Fecha contrato","date"),F("valor","Valor obligación","money")],help:"Deudas del causante que se transmiten a los herederos, acreditadas por documento."});
const PRINCIPALES=["dinero","brna","vehiculos","derechosSociedades","menaje","rebajasLegales","pasivosHeredables"];
/* Otros (bienesOtrosPorDefecto) */
cat("bra",{titulo:"(+) Bienes raíces agrícolas",desc:"Bienes raíces agrícolas",base:"valorLegal",...CAL,leg:true,bbrr:true,agricola:true,fields:[F("rol","Rol","rol"),F("comuna","Comuna","text"),F("fechaAdq","Fecha de adquisición","date"),F("valorLegal","Valor legal / Avalúo fiscal","money",{lock:true}),VAL]});
cat("bienesAdherencia",{titulo:"(+) Bienes excluidos de avalúo fiscal de inmuebles agrícolas",desc:"Bienes por adherencia y destinación excluidos del avalúo fiscal de bienes raíces agrícolas",base:"valorCorriente",...CAL,leg:true,fields:[F("rolSel","Rol","selrol"),F("noTiene","No tiene","check"),F("comuna","Comuna","calc"),F("descripcion","Descripción","sel",{o:OPT.I}),F("detalle","Detalle","text"),F("valorCorriente","Valor corriente en plaza o comercial","money"),VAL],help:"Por cada rol agrícola declarado debes informar aquí los bienes por adherencia o destinación (construcciones, maquinaria, ganado…), o marcar \"No tiene\"."});
cat("naves",{titulo:"(+) Naves y aeronaves",desc:"Naves y aeronaves",base:"valorPlaza",...CAL,leg:true,fields:[F("tipo","Tipo","sel",{o:OPT.N}),F("matricula","Matrícula","text"),F("marca","Marca","text"),F("modelo","Modelo","text"),F("registro","N° Registro","text"),F("valorPlaza","Valor corriente en plaza","money"),VAL]});
cat("porCobrar",{titulo:"(+) Cuentas por cobrar",desc:"Cuentas por cobrar",base:"valorPlaza",...CAL,leg:true,fields:[F("descripcion","Descripción","text"),F("rutDeudor","Rut Deudor","rut"),F("valorPlaza","Valor corriente en plaza","money"),VAL]});
cat("accionesCon",{titulo:"(+) Acciones transadas en bolsa",desc:"Acciones, valores mobiliarios y efectos públicos, con cotización bursátil",base:"total",...CAL,leg:true,fields:[F("tipo","Tipo","sel",{o:OPT.L}),F("razon","Nombre o Razón Social","text"),F("rut","RUT","rut"),F("nAcc","N° Acciones","decim"),F("precio","Valor promedio","decim"),F("total","Valor total acciones","calc"),VAL],help:"Se valoran al promedio de cotización bursátil del semestre anterior al fallecimiento."});
cat("accionesSin",{titulo:"(+) Acciones no transadas en bolsa",desc:"Acciones sin cotización bursátil",base:"total",...CAL,leg:true,fields:[F("rut","RUT","rut"),F("nAcc","N° Acciones","decim"),F("precio","Valor corriente en plaza","decim"),F("total","Valor total acciones","calc"),VAL]});
cat("valoresMob",{titulo:"(+) Otros valores mobiliarios",desc:"Valores mobiliarios no señalados previamente",base:"valorPlaza",...CAL,leg:true,fields:[F("ident","Identificación activo","sel",{o:OPT.R}),F("detalle","Detalle","text"),F("valorPlaza","Valor","money"),VAL]});
cat("sociedadesCiviles",{titulo:"(+) Sociedades civiles",desc:"Sociedades civiles",base:"valorSoc",...CAL,leg:true,fields:[F("tipo","Tipo de sociedad","sel",{o:OPT.O}),F("rut","RUT","rut"),F("nombre","Nombre o Razón social","text"),F("activos","Total Activos","money"),F("pasivos","Total Pasivos Exigibles","money"),F("valorSoc","Valor neto","calc"),VAL]});
cat("afp",{titulo:"(+) Fondos AFP",desc:"Fondos AFP",base:"pesos",leg:true,fields:[F("descripcion","Descripción","text"),F("ufTotal","Fondo total UF","uf"),F("ufHer","Fondo heredable UF","calc"),F("pesos","Fondo heredable pesos","calc"),VAL],help:"Los fondos de la cuenta de capitalización individual están exentos hasta 4.000 UF; solo el exceso es heredable y se convierte a pesos con la UF del día."});
cat("subasta",{titulo:"(+) Bienes Pública Subasta",desc:"Bienes Pública Subasta",base:"valorSubasta",leg:true,fields:[F("descripcion","Descripción","text"),F("valorSubasta","Valor Subasta","money"),VAL]});
cat("extranjero",{titulo:"(+) Bienes situados en el extranjero",desc:"Bienes en el extranjero",base:"valorPrevio",...CAL,leg:true,fields:[F("descripcion","Descripción","sel",{o:OPT.P}),F("detalle","Detalle","text"),F("paisReg","País de ubicación o registro del bien","pais"),F("paisAct","País de ubicación de mayor parte del activo subyacente","pais"),F("fechaPago","Fecha pago impuesto extranjero","date",{opt:true}),F("utmPago","UTM fecha pago impuesto extranjero","utm",{dateFrom:"fechaPago",opt:true}),F("impPesos","Impuesto pagado en el extranjero Pesos","money",{opt:true}),F("impUTM","Impuesto extranjero pagado UTM","calc",{dec:2}),F("valorPrevio","Valor previo","money"),VAL],help:"El impuesto a la herencia pagado en el extranjero por estos bienes da derecho a crédito (art. 10 Ley 16.271). Si no pagaste impuesto afuera, deja esos campos en blanco."});
cat("joyas",{titulo:"(+) Joyas, objetos de arte, antigüedades, armas, etc.",desc:"Joyas, objetos de arte, antigüedades, etc",base:"valorPlaza",...CAL,leg:true,fields:[F("descripcion","Descripción","sel",{o:OPT.Q}),F("valorPlaza","Valor corriente en plaza","money"),VAL]});
cat("intangibles",{titulo:"(+) Activos intangibles",desc:"Activos intangibles",base:"valorPrevio",...CAL,leg:true,fields:[F("tipo","Tipo","sel",{o:OPT.K}),F("descripcion","Descripción","text"),F("valorPrevio","Valor corriente en plaza","money"),VAL]});
cat("otrosBienes",{titulo:"(+) Otros bienes y/o derechos no considerados en los puntos anteriores",desc:"Otros bienes y/o derechos no considerados en los puntos anteriores",base:"valorPlaza",...CAL,leg:true,fields:[F("descripcion","Descripción","text"),F("valorPlaza","Valor corriente en plaza","money"),VAL]});
cat("ley18985",{titulo:"(+) Donaciones con fines culturales (Ley N° 18.985) y Donaciones efectuadas en caso de catástrofe (Ley N° 20.444)",desc:"Ley N° 18985 y Ley N° 20444",credit:true,fields:[F("ley","Ley","sel",{o:["18.985","20.444"]}),F("folio","Folio certificado","text"),F("fecha","Fecha certificado","date"),F("credito","Crédito","calc"),F("utmFecha","UTM fecha certificado","utm",{dateFrom:"fecha"}),F("creditoUTM","Monto crédito UTM","calc",{dec:2}),F("valor","Monto total donación","money")],help:"Donaciones hechas por el causante con certificado. Dan crédito contra el impuesto: 50% del monto (Ley 18.985) o 40% (Ley 20.444). No suman a la masa hereditaria."});
const OTROS_BASE=["bra","bienesAdherencia","naves","porCobrar","accionesCon","accionesSin","valoresMob","sociedadesCiviles","afp","subasta","extranjero","joyas","intangibles","otrosBienes","ley18985"];
/* Régimen patrimonial (dependen del estado civil del causante) */
const DV=(n,t,d,minus)=>cat(n,{titulo:t,desc:d,minus,fields:[F("descripcion","Descripción","text"),F("valor","Valor","money")]});
const DLV=(n,t,d,extra=[])=>cat(n,{titulo:t,desc:d,base:"valorLegal",...CAL,leg:true,fields:[...extra,F("descripcion","Descripción","text"),F("valorLegal","Valor","money"),F("valor","Valor final","calc")]});
DV("montoObligacion","(-) Monto obligación a Deducir por régimen de Participación en los Gananciales","Monto obligación a Deducir por régimen de Participación en los Gananciales",true);
DV("montoCredito","(+) Crédito participación en los gananciales","Monto Crédito a Agregar por Régimen de Participación en los Gananciales",false);
DV("recompensasAdeudadasSocCon","(-) Recompensas adeudadas a sociedad conyugal","Recompensas adeudadas a sociedad conyugal",true);
DV("recompensasMujerSocCon","(-) Recompensas mujer sociedad conyugal","Recompensas mujer en Sociedad Conyugal",true);
DV("pasivosSC","(-) Pasivos sociedad conyugal/AUC Comunidad","Pasivos sociedad conyugal/AUC Comunidad",true);
DLV("otrosbienessociedad","(+) Otros bienes sociedad conyugal","Otros bienes sociedad conyugal");
DV("recompensasMaridoSocCon","(-) Recompensas marido sociedad conyugal","Recompensas marido en Sociedad Conyugal",true);
DLV("articulo150","(+) Bienes reservados del artículo 150 del Código Civil","Bienes reservados del artículo 150 del Código Civil");
cat("bienespropioscausante",{titulo:"(+) Bienes propios del causante",desc:"(Sociedad conyugal) Bienes propios del causante",base:"valorPlaza",...CAL,leg:true,fields:[F("rol","Rol","text"),F("comuna","Comuna","text"),F("descripcion","Descripción","text"),F("valorPlaza","Valor adquisición/avalúo fiscal","money"),VAL]});
cat("bienespropioscausanteex",{titulo:"(+) Bienes propios del causante, exluidos del avalúo",desc:"(Sociedad conyugal) Bienes propios del causante, exluidos del avalúo",base:"valorPlaza",...CAL,leg:true,fields:[F("rol","Rol","text"),F("comuna","Comuna","text"),F("descripcion","Descripción","text"),F("valorPlaza","Valor corriente en plaza","money"),VAL]});
DV("recompensasCauSocCon","(+) Recompensas del causante en sociedad conyugal","Recompensas del causante en sociedad conyugal",false);
DLV("otroscausante","(+) Otros bienes causante","Otros bienes causante");
DLV("activosConv","(+) Activos Conviviente sobreviviente","Activos Conviviente sobreviviente (comunidad)");
DLV("muebles","(+) Muebles de uso personal necesarios del conviviente fallecido, adquirido durante el régimen","Muebles de uso personal necesarios del conviviente fallecido, adquirido durante el régimen");
DLV("comunidad","(+) Bienes propios causante","(AUC, Comunidad): bienes conviviente causante no incluidos previamente ");
const GRUPO_PA=["montoObligacion","montoCredito"], GRUPO_QA=["recompensasAdeudadasSocCon"], GRUPO_RA=["recompensasMujerSocCon","pasivosSC","otrosbienessociedad"],
 GRUPO_SA=["recompensasMaridoSocCon","recompensasMujerSocCon","articulo150","otrosbienessociedad","pasivosSC","bienespropioscausante","bienespropioscausanteex","recompensasCauSocCon","otroscausante"],
 GRUPO_TA=["activosConv","pasivosSC","muebles","comunidad"];
/* Listas por descripción usadas en el cálculo de la masa */
const L_Na=["Pasivos heredables","Rebajas legales art, 4° Ley 16 271 art 959 Código Civil, no señaladas previamente"],
 L_Oa=["Recompensas adeudadas a sociedad conyugal"],
 L_Pa=["Recompensas del causante en sociedad conyugal","(Sociedad conyugal) Bienes propios del causante","(Sociedad conyugal) Bienes propios del causante, exluidos del avalúo","Otros bienes causante"],
 L_Qa=["Recompensas marido en Sociedad Conyugal","Recompensas mujer en Sociedad Conyugal"],
 L_Ra=["Dinero","Bienes raíces no agrícolas","Bienes raíces agrícolas","Bienes por adherencia y destinación excluidos del avalúo fiscal de bienes raíces agrícolas","Vehículos","Naves y aeronaves","Cuentas por cobrar","Acciones, valores mobiliarios y efectos públicos, con cotización bursátil","Acciones sin cotización bursátil","Valores mobiliarios no señalados previamente","Sociedades civiles","Fondos AFP","Bienes Pública Subasta","Bienes en el extranjero","Menaje","Joyas, objetos de arte, antigüedades, etc","Activos intangibles","Otros bienes y/o derechos no considerados en los puntos anteriores","Bienes reservados del artículo 150 del Código Civil","Otros bienes sociedad conyugal"],
 L_Sa=["Dinero","Bienes raíces no agrícolas","Bienes raíces agrícolas","Bienes por adherencia y destinación excluidos del avalúo fiscal de bienes raíces agrícolas","Vehículos","Naves y aeronaves","Cuentas por cobrar","Acciones, valores mobiliarios y efectos públicos, con cotización bursátil","Acciones sin cotización bursátil","Valores mobiliarios no señalados previamente","Derechos en sociedades de personas","Sociedades civiles","Fondos AFP","Bienes Pública Subasta","Bienes en el extranjero","Menaje","Joyas, objetos de arte, antigüedades, etc","Activos intangibles","Otros bienes y/o derechos no considerados en los puntos anteriores"],
 L_Ta=["Dinero","Bienes raíces no agrícolas","Bienes raíces agrícolas","Bienes por adherencia y destinación excluidos del avalúo fiscal de bienes raíces agrícolas","Vehículos","Naves y aeronaves","Cuentas por cobrar","Acciones, valores mobiliarios y efectos públicos, con cotización bursátil","Acciones sin cotización bursátil","Sociedades civiles","Fondos AFP","Bienes Pública Subasta","Bienes en el extranjero","Menaje","Joyas, objetos de arte, antigüedades, etc","Activos intangibles","Otros bienes y/o derechos no considerados en los puntos anteriores","Activos Conviviente sobreviviente (comunidad)"],
 L_Ua=["Derechos en sociedades de personas","Pasivos sociedad conyugal/AUC Comunidad"],
 L_Va=["Recompensas mujer en Sociedad Conyugal","Pasivos sociedad conyugal/AUC Comunidad"],
 L_Ya=["Muebles de uso personal necesarios del conviviente fallecido, adquirido durante el régimen","(AUC, Comunidad): bienes conviviente causante no incluidos previamente "];

/* Agregados / deducciones por asignatario (camposLegados) */
const DESC={};
function dcat(name,o){o.name=name;DESC[name]=o;return o}
dcat("dinerolibre",{titulo:"Dinero",desc:"Dinero libre",tipos:["Testadas"],fields:[F("valor","Monto","money")],help:"Legado de una suma de dinero (no de una cuenta específica). Se imputa a la cuarta de libre disposición."});
dcat("dpaT",{titulo:"Descuentos particulares",desc:"Descuentos particulares asignatario",tipos:["Testadas"],fields:[F("tipo","Tipo","sel",{o:OPT.S}),F("descripcion","Descripción","text"),F("valor","Valor","money")],help:"Cargas que afectan solo a este asignatario y rebajan su base imponible (art. 4° Ley 16.271)."});
dcat("dpaI",{titulo:"Descuentos particulares",desc:"Descuentos particulares asignatario",tipos:["Intestadas"],fields:[F("tipo","Tipo","sel",{o:OPT.T}),F("descripcion","Descripción","text"),F("valor","Valor","money")],help:"Cargas que afectan solo a este asignatario y rebajan su base imponible (art. 4° Ley 16.271)."});
dcat("ley16271",{titulo:"Exención a favor de los legitimarios de los cónyuges o convivientes civiles (art. 2° Ley 16.271)",desc:"Descuento por causante cónyuge de ascendiente común (artículo N° 2, Ley N° 16.271)",tipos:["Testadas","Intestadas"],soloHijos:true,fields:[F("rut","RUT primer cónyuge o conviviente civil fallecido","rut"),F("fecha","Fecha de fallecimiento","date"),F("folio","Folio impuesto","text"),F("utm1","UTM fecha fallecimiento primer causante","utm",{dateFrom:"fecha"}),F("asig","Monto exención","money"),F("asigUTM","Monto exención en UTM","calc",{dec:2}),F("valor","Monto exención actualizado","calc")],help:"Si el otro progenitor falleció antes y su herencia ya pagó impuesto, los hijos comunes pueden descontar lo que le correspondió al cónyuge sobreviviente (ahora causante), actualizado y dividido entre los hijos."});
const DON_FIELDS=(lbl)=>[F("descripcion","Descripción","text"),F("fecha","Fecha donación","date"),F("utmFecha","UTM fecha donación","utm",{dateFrom:"fecha"}),F("monto",lbl,"money"),F("impuesto","Impuesto pagado","money"),F("impUTM","Impuesto pagado UTM","calc",{dec:2}),F("valor","Valor donación pesos fecha declaración","calc")];
dcat("plena",{titulo:"Donaciones previas",desc:"Donaciones previas plena propiedad",tipos:["Testadas","Intestadas"],fields:DON_FIELDS("Monto donación"),help:"Donaciones que el causante hizo en vida a este asignatario. Se suman a su base (art. 23 Ley 16.271) y el impuesto que pagaron da crédito."});
dcat("nuda",{titulo:"Donaciones previas nuda propiedad",desc:"Donaciones previas nuda propiedad",tipos:["Testadas","Intestadas"],fields:DON_FIELDS("Valor plena propiedad"),help:"Donaciones de nuda propiedad hechas en vida: al consolidarse el dominio se agregan por su valor de plena propiedad."});
dcat("pension",{titulo:"Pensión periódica",desc:"Pensión periódica",tipos:["Testadas"],leg:true,fields:[F("tipo","Tipo","sel",{o:OPT.J}),F("anios","N° años","int",{when:r=>r.tipo==="Temporal"}),F("nacimiento","Fecha nacimiento beneficiario","date",{when:r=>r.tipo==="Vitalicia"}),F("condicion","Condición","text",{when:r=>r.tipo==="Por tiempo indeterminado"}),F("mensual","Monto mensual","money"),F("valor","Valorización legal","calc")],help:"Pensiones dejadas en el testamento. Se capitalizan al 8% anual y se ajustan según sean perpetuas, temporales, indeterminadas o vitalicias (art. 6° Ley 16.271)."});
dcat("asignacionFideicomisario",{titulo:"Asignación fideicomisario",desc:"Asignación fideicomisario",tipos:["Testadas"],fields:[F("descripcion","Descripción","text"),F("valorFid","Valor Fideicomiso","money"),F("fechaDev","Fecha devengo","date"),F("utmDev","UTM fecha devengo","utm",{dateFrom:"fechaDev"}),F("folio","Folio Declaración Original","text"),F("fechaDecl","Fecha declaración original","date"),F("impPagado","Impuesto pagado en declaración original","money"),F("utmDecl","UTM fecha declaración original","utm",{dateFrom:"fechaDecl"}),F("impUTM","Impuesto pagado en UTM","calc",{dec:2})],help:"Cuando se cumple la condición de un fideicomiso, el fideicomisario paga impuesto por el bien; lo pagado antes por el fiduciario da crédito."});
dcat("asignacionCondicional",{titulo:"Asignación condicional",desc:"Asignación condicional",tipos:["Testadas"],fields:[F("descripcion","Descripción","text"),F("valorAsig","Valor asignación","money"),F("fechaDev","Fecha devengo","date"),F("utmDev","UTM fecha devengo","utm",{dateFrom:"fechaDev"}),F("folio","Folio declaración original","text"),F("fechaDecl","Fecha declaración original","date")],help:"Asignaciones sujetas a condición suspensiva: el impuesto se devenga cuando la condición se cumple (art. 11 Ley 16.271)."});
const DESC_ORDER=["dinerolibre","dpaT","dpaI","ley16271","plena","nuda","pension","asignacionFideicomisario","asignacionCondicional"];

const SECCIONES_HELP={
 declarante:"Persona que presenta la declaración: normalmente un heredero o su representante. En el sistema real estos datos vienen precargados desde tu sesión; aquí los escribes tú.",
 contacto:"Opcional. Persona a quien el SII puede contactar por la declaración (contador, abogado u otro).",
 causante:"La persona fallecida. El RUT, nombre y fecha de fallecimiento en el sistema real se obtienen del Registro Civil al presionar \"Consultar Rut\". El estado civil y el régimen patrimonial cambian qué bienes se declaran y cómo se calcula la masa.",
 posesion:"Datos de la resolución de posesión efectiva otorgada por el Registro Civil (herencias intestadas).",
 inventario:"En herencias testadas la posesión efectiva la otorga un tribunal y requiere inventario solemne protocolizado ante notario.",
 testamento:"Datos del testamento: notaría, fecha de otorgamiento e inscripción en el Registro Nacional de Testamentos.",
 abogado:"En la posesión efectiva judicial (testadas) se requiere abogado patrocinante y se identifica el tribunal y la causa.",
 asignatarios:"Personas que reciben la herencia. Debes incluir a todos los herederos con derecho, aunque repudien. Cada asignatario paga su propio impuesto según su cuota y parentesco.",
 bienes:"Todos los bienes y deudas del causante a la fecha del fallecimiento. Los montos se suman para formar la masa hereditaria; las partidas (-) se restan.",
 agregados:"Datos que solo afectan a un asignatario: donaciones que recibió en vida, descuentos particulares y, en testadas, legados.",
 calculo:"El simulador reparte la masa entre los asignatarios, convierte cada cuota a UTM, aplica la exención y la escala progresiva del art. 2° Ley 16.271, el recargo por parentesco y los créditos."
};

/* ===== Utilidades ===== */
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const int=v=>{const n=Number(String(v??"").replace(/[^\d-]/g,""));return isFinite(n)?n:0};
const dec=v=>{let s=String(v??"").trim();if(!s)return 0;if(s.includes(","))s=s.replace(/\./g,"").replace(",",".");const n=Number(s.replace(/[^\d.-]/g,""));return isFinite(n)?n:0};
const pesos=n=>"$"+Math.round(Number(n)||0).toLocaleString("es-CL");
const miles=n=>Math.round(Number(n)||0).toLocaleString("es-CL");
const d2=(n,d=2)=>(Number(n)||0).toLocaleString("es-CL",{minimumFractionDigits:d,maximumFractionDigits:d});
const uid=()=>Math.random().toString(36).slice(2,9);
const todayISO=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const fdate=s=>s?s.split("-").reverse().join("-"):"";
function yearsBetween(a,b){if(!a||!b)return 0;const A=new Date(a),B=new Date(b);let y=B.getFullYear()-A.getFullYear();if(B.getMonth()<A.getMonth()||(B.getMonth()===A.getMonth()&&B.getDate()<A.getDate()))y--;return y}
function rutClean(r){return String(r||"").replace(/[^0-9kK]/g,"").toUpperCase()}
function rutDV(body){let s=0,m=2;for(let i=body.length-1;i>=0;i--){s+=Number(body[i])*m;m=m===7?2:m+1}const r=11-(s%11);return r===11?"0":r===10?"K":String(r)}
function rutValid(r){const c=rutClean(r);if(c.length<2)return false;const b=c.slice(0,-1),d=c.slice(-1);return /^\d+$/.test(b)&&rutDV(b)===d}
function rutFmt(r){const c=rutClean(r);if(c.length<2)return r||"";const b=c.slice(0,-1),d=c.slice(-1);return Number(b).toLocaleString("es-CL")+"-"+d}
(function(){ // integra la UTM de la guía (codigo.js): tabla mensual y valor del mes en curso
 const ext=window.UTM_MENSUAL_GUIA;if(ext&&typeof ext==="object")for(const y in ext)if(Array.isArray(ext[y]))DATA_UTM[y]=ext[y].slice();
 const g=window.UTM_GUIA,MESES=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
 if(g&&g.valor){const m=MESES.indexOf(String(g.mes).toLowerCase());if(m>=0){if(!DATA_UTM[g.anio])DATA_UTM[g.anio]=Array(12).fill(null);DATA_UTM[g.anio][m]=g.valor}}
})();
function utmFor(iso){if(!iso)return null;const [y,m]=iso.split("-").map(Number);const t=DATA_UTM[y];return (t&&t[m-1])||null}
const LAST_UTM=(()=>{const ys=Object.keys(DATA_UTM).sort();for(let i=ys.length-1;i>=0;i--){const t=DATA_UTM[ys[i]];for(let m=11;m>=0;m--)if(t[m])return t[m]}return 0})();

/* ===== Estado ===== */
function blankState(tipo){
 return {tipo,
  declarante:{nombre:"",rut:"",apellidoPaterno:"",apellidoMaterno:"",pais:"Chile",ciudad:"",region:"",comuna:"",calle:"",numero:"",depto:"",telefono:"",correo:"",correo2:""},
  contacto:{activo:false,nombre:"",rut:"",telefono:"",email:""},
  causante:{rut:"",nombre:"",apellidoPaterno:"",apellidoMaterno:"",fechaFallecimiento:"",estadoCivil:"",regimen:"",sexo:"",mujerRenuncia:""},
  posesion:{numeroInscripcion:"",oficina:"",fechaRes:"",folio:""},
  inventario:{fechaProtocolizacion:"",notaria:"",fechaPublicacion:""},
  testamento:{notaria:"",fecha:"",inscripcion:"",pais:"Chile"},
  abogado:{rut:"",nombre:"",apellidoPaterno:"",apellidoMaterno:"",telefono:"",correo:""},
  tribunal:{juzgado:"",rol:"",fechaAuto:""},
  asignatarios:[], bienes:{}, entries:{},
  params:{utmDevengo:"",utmHoy:String((window.UTM_GUIA&&window.UTM_GUIA.valor)||utmFor(todayISO())||LAST_UTM),ufHoy:"41.268,88"},
  ui:{open:{declarante:true,causante:true,asignatarios:true,bienes:true,agregados:true,calculo:true},acc:{},otros:false},
  enviado:null};
}
let S=null;

/* ===== Valorización de calidad de propiedad (opciones avanzadas) ===== */
function edad(nac){return nac?yearsBetween(nac,todayISO()):0}
function tablaNuda(e){return e<30?.1:e<40?.2:e<50?.3:e<60?.5:e<70?.6:.8}
function tablaFidNuda(e){return e<30?.05:e<40?.1:e<50?.15:e<60?.25:e<70?.3:.4}
function tablaUsufructo(e){return e<30?.9:e<40?.8:e<50?.7:e<60?.5:e<70?.4:.2}
function valorCalidad(base,o){
 o=o||{};const pct=(o.porcentaje===""||o.porcentaje==null?100:dec(o.porcentaje))/100;const c=Math.round(base*pct);const n=dec(o.cantAnios);const g=o.tipoGravamen;
 switch(o.calidad){
  case "Nuda propiedad": return Math.max(0,Math.round(g==="Tiempo determinado"?c-c/10*Math.ceil(n/5):g==="Condición o a plazo que signifique condición"?.5*c:c*tablaNuda(edad(o.nacimiento))));
  case "Fideicomiso": return Math.round(.5*c);
  case "Fideicomiso de nuda propiedad": return Math.max(0,Math.round(g==="Tiempo determinado"?(c-c/10*Math.ceil(n/5))/2:g==="Condición o a plazo que signifique condición"?.25*c:c*tablaFidNuda(edad(o.nacimiento))));
  default: return c;
 }
}
function valorLegado(base,o){
 const pct=dec(o.porcentaje)/100;const c=base;const n=dec(o.cantAnios);const g=o.tipoGravamen;const e=edad(o.nacimiento);let v=0;
 switch(o.calidad){
  case "Plena propiedad": case "Fideicomiso": v=c;break;
  case "Nuda propiedad": v=g==="Tiempo determinado"?c-c/10*Math.ceil(n/5):g==="Condición o a plazo que signifique condición"?.5*c:c*tablaNuda(e);break;
  case "Fideicomiso de nuda propiedad": v=g==="Tiempo determinado"?c-c/10*Math.ceil(n/5):g==="Condición o a plazo que signifique condición"?.25*c:c*tablaNuda(e);break;
  case "Usufructo": v=g==="Tiempo determinado"?c/10*Math.ceil(n/5):g==="Condición o a plazo que signifique condición"?.5*c:c*tablaUsufructo(e);break;
  case "Derecho de uso o habitación": v=g==="Tiempo determinado"?c/10*Math.ceil(n/5)/3:g==="Condición o a plazo que signifique condición"?.16666*c:c*tablaUsufructo(e)/3;break;
 }
 return Math.max(0,Math.round(v*pct));
}
const CAL_DEFAULT=()=>({calidad:"Plena propiedad",porcentaje:"100",tipoGravamen:"",cantAnios:"",nacimiento:"",condiciones:"",exencion:"Sin exenciones",fideicomisarios:[]});

/* ===== Cálculo de cada fila (campos automáticos) ===== */
function utmField(row,f){ // valor UTM de un campo tipo utm: tabla o ingreso manual
 const auto=utmFor(row[f.dateFrom]);if(auto){row[f.k]=String(auto);return auto}return dec(row[f.k]);
}
function fallecimiento(){return S.causante.fechaFallecimiento}
function utmDevengo(){return dec(S.params.utmDevengo)||utmFor(fallecimiento())||0}
function utmHoy(){return dec(S.params.utmHoy)||LAST_UTM}
function ufHoy(){return dec(S.params.ufHoy)||0}
function adquiridoReciente(row){const f=fallecimiento();if(!row.fechaAdq||!f)return false;const y=(new Date(f)-new Date(row.fechaAdq))/(365.25*864e5);return y>=0&&y<=3}
function computeRow(c,row){
 const fs=c.fields; for(const f of fs){ if(f.t==="utm") utmField(row,f) }
 switch(c.name){
  case "derechosSociedades": case "sociedadesCiviles": {const v=int(row.activos)-int(row.pasivos);row.valorSoc=v>0?v:0;break}
  case "accionesCon": case "accionesSin": row.total=Math.round(dec(row.nAcc)*dec(row.precio));break;
  case "afp": {const u=dec(row.ufTotal)-4000;row.ufHer=u>0?u:0;row.pesos=Math.round(row.ufHer*ufHoy());break}
  case "extranjero": {const u=dec(row.utmPago);row.impUTM=u?int(row.impPesos)/u:0;break}
  case "ley18985": {const m=int(row.valor);const cr=Math.round((row.ley==="20.444"?.4:.5)*m);row.credito=cr;const u=dec(row.utmFecha);row.creditoUTM=u?cr/u:0;break}
  case "bienesAdherencia": {const b=allRows("bra").find(r=>r.rol===row.rolSel);row.comuna=b?b.comuna:(row.noTiene?"-":"");if(row.noTiene){row.valorCorriente="0"}break}
  case "brna": case "bra": if(!adquiridoReciente(row)&&row.avaluo!=null&&row.avaluo!=="")row.valorLegal=String(row.avaluo);break;
 }
 if(c.base){const b=int(row[c.base]);row._base=b;row.valor=c.calidad?valorCalidad(b,row.cal):b}
 else if(!c.credit){row._base=int(row.valor)}
 return row;
}
function computeDesc(d,row,a){
 for(const f of d.fields){ if(f.t==="utm") utmField(row,f) }
 const uH=utmHoy();
 switch(d.name){
  case "ley16271":{const u1=dec(row.utm1);row.asigUTM=u1?int(row.asig)/u1:0;const h=Math.max(1,counts().hijos);row.valor=Math.round(row.asigUTM*utmDevengo()/h);break}
  case "plena": case "nuda":{const u=dec(row.utmFecha);row.impUTM=u?int(row.impuesto)/u:0;row.valor=u?Math.round(int(row.monto)/u*uH):0;break}
  case "pension":{const m=int(row.mensual),cap=1200*m/8;row.valor=row.tipo==="Perpetua"?Math.ceil(cap):row.tipo==="Temporal"?Math.round(cap*.1*Math.ceil(dec(row.anios)/5)):row.tipo==="Por tiempo indeterminado"?Math.ceil(cap/2):row.tipo==="Vitalicia"?Math.ceil(cap*tablaUsufructo(edad(row.nacimiento))):0;break}
  case "asignacionFideicomisario":{const u=dec(row.utmDecl);row.impUTM=u?int(row.impPagado)/u:0;break}
 }
 return row;
}
function allRows(name){return S.bienes[name]||[]}
function catsVisibles(){ // categorías "Otros" según estado civil / régimen (lógica ua())
 const c=S.causante,out=[...OTROS_BASE];
 if(c.estadoCivil==="Casado"){
  if(c.regimen==="Participación en los gananciales")out.push(...GRUPO_PA);
  else if(c.regimen==="Sociedad Conyugal"){ if(c.mujerRenuncia==="Si"){ if(c.sexo==="Femenino")out.push(...GRUPO_QA); else if(c.sexo==="Masculino")out.push(...GRUPO_RA)} else if(c.mujerRenuncia==="No")out.push(...GRUPO_SA)}
 } else if(c.estadoCivil==="Conviviente civil"&&c.regimen==="Comunidad")out.push(...GRUPO_TA);
 return out;
}
function counts(){const r={hijos:0,conyuge:0,asc:0,by:{}};for(const a of S.asignatarios){if(a.repudia!=="No")continue;r.by[a.parentesco]=(r.by[a.parentesco]||0)+1}r.hijos=r.by["Hijo"]||0;r.conyuge=r.by["Cónyuge o Conviviente Civil"]||0;r.asc=r.by["Ascendiente"]||0;return r}

/* ===== Masa hereditaria ===== */
function netos(){const m={},u={};for(const n of [...PRINCIPALES,...catsVisibles()]){const c=CATS[n];if(c.credit)continue;for(const r of allRows(n)){computeRow(c,r);m[c.desc]=(m[c.desc]||0)+(c.minus?int(r.valor):r.valor);if(n==="extranjero")u[c.desc]=(u[c.desc]||0)+(r.impUTM||0)}}return {m,u}}
function masaHereditaria(M){
 const s=l=>l.reduce((t,d)=>t+(M[d]||0),0),c=S.causante;
 if(c.estadoCivil==="Casado"&&c.regimen&&c.regimen!=="Separación total de bienes"){
  if(c.regimen==="Participación en los gananciales")return s([...L_Sa,"Monto Crédito a Agregar por Régimen de Participación en los Gananciales"])-s(L_Na)-s(["Monto obligación a Deducir por régimen de Participación en los Gananciales"]);
  if(c.regimen==="Sociedad Conyugal"){
   if(c.mujerRenuncia==="Si")return s(L_Sa)-s([...L_Na,...(c.sexo==="Femenino"?L_Oa:c.sexo==="Masculino"?L_Va:[])]);
   if(c.mujerRenuncia==="No"){const a=s(L_Ra)+s(["Derechos en sociedades de personas"])-s(L_Qa),b=s(["Pasivos sociedad conyugal/AUC Comunidad"]);const g=c.sexo==="Femenino"?(b>a?0:a-b):(b>a?a-b:(a-b)/2);return g+s(L_Pa)-s(L_Na)}
  }
  return s(L_Sa)-s(L_Na);
 }
 if(c.estadoCivil==="Conviviente civil"&&c.regimen==="Comunidad")return (s(L_Ta)-s(L_Ua))/2+s(L_Ya)-s(L_Na);
 return s(L_Sa)-s(L_Na);
}

/* ===== Escala del impuesto (art. 2° Ley 16.271), en UTM ===== */
const TRAMOS=[[960,.01,0],[1920,.025,14.4],[3840,.05,62.4],[5760,.075,158.4],[7680,.1,302.4],[9600,.15,686.4],[14400,.2,1166.4],[Infinity,.25,1886.4]];
function impuestoEscala(b){if(b<=0)return 0;for(const [h,t,r] of TRAMOS)if(b<=h)return Math.max(0,b*t-r);return 0}
function exencionRecargo(p){
 const T=S.tipo;
 if(T==="Testadas"){ if(["Ascendiente","Cónyuge o Conviviente Civil","Nieto o descendiente línea directa","Hijo"].includes(p))return{ex:600,rec:1};
  if(["Hermano","Medio Hermano","Tio","Colateral 3° grado","Colateral 3° grado, simple conjunción","Colateral 4° grado","Colateral 4° grado, simple conjunción"].includes(p))return{ex:60,rec:1.2};
  if(p==="Exento")return{ex:0,rec:1}; if(p)return{ex:0,rec:1.4}; return{ex:0,rec:0}}
 if(["Ascendiente","Cónyuge o Conviviente Civil","Hijo"].includes(p))return{ex:600,rec:1};
 if(["Hermano","Medio Hermano","Tio","Colateral 3° grado","Colateral 3° grado, simple conjunción","Colateral 4° grado","Colateral 4° grado, simple conjunción"].includes(p))return{ex:60,rec:1.2};
 if(p==="Exento")return{ex:0,rec:1};
 return{ex:0,rec:1.4};
}
const esLegitimario=p=>["Hijo","Ascendiente","Cónyuge o Conviviente Civil"].includes(p);
const puedeMejoras=p=>esLegitimario(p)||p==="Nieto o descendiente línea directa";

/* Reparto de la legítima entre descendientes, cónyuge y ascendientes (órdenes de sucesión) */
function cuotaLegitimaria(a,C,p){
 const b=C.hijos,d=C.conyuge,asc=C.asc;let hijo=0,cony=0,as=0;
 if(b>1&&b<7&&d){hijo=a/(b+2);cony=2*a/(b+2)}
 else if(b===1&&d){hijo=cony=a/2}
 else if(b>6&&d){cony=a/4;hijo=3*a/(4*b)}
 else if(b>0&&!d){hijo=a/b}
 else if(b===0&&d){if(asc>0){cony=2*a/3;as=a/(3*asc)}else cony=a}
 else if(b===0&&!d&&asc>0){as=a/asc}
 return p==="Hijo"?hijo:p==="Ascendiente"?as:p==="Cónyuge o Conviviente Civil"?cony:0;
}
/* Órdenes siguientes: hermanos (doble conjunción = doble cuota), colaterales hasta 6° grado */
function cuotaColateral(a,C,p){
 if(C.hijos>0||C.conyuge>0||C.asc>0)return 0;
 const g=k=>C.by[k]||0;const H=g("Hermano"),MH=g("Medio Hermano"),T3=g("Tio")+g("Colateral 3° grado"),T3s=g("Tio simple conjunción")+g("Colateral 3° grado, simple conjunción");
 const c4=g("Colateral 4° grado"),c4s=g("Colateral 4° grado, simple conjunción"),c5=g("Colateral 5° grado"),c5s=g("Colateral 5° grado, simple conjunción"),c6=g("Colateral 6° grado"),c6s=g("Colateral 6° grado, simple conjunción");
 const sin=g("Sin parentesco"),nieto=g("Nieto o descendiente línea directa"),mas6=g("Colateral +6° grado");
 const r={};
 if(H>0){if(MH>0){r["Hermano"]=2*a/(2*H+MH);r["Medio Hermano"]=a/(2*H+MH)}else r["Hermano"]=a/H}
 else if(MH>0)r["Medio Hermano"]=a/MH;
 else if(T3>0){if(T3s>0){r.c3=a/(T3+T3s/2);r.c3s=a/(2*T3+T3s)}else r.c3=a/T3}
 else if(T3s>0)r.c3s=a/T3s;
 else if(c4>0){if(c4s>0){r["Colateral 4° grado"]=a/(c4+c4s/2);r["Colateral 4° grado, simple conjunción"]=a/(2*c4+c4s)}else r["Colateral 4° grado"]=a/c4}
 else if(c4s>0)r["Colateral 4° grado, simple conjunción"]=a/c4s;
 else if(c5>0){if(c5s>0){r["Colateral 5° grado"]=a/(c5+c5s/2);r["Colateral 5° grado, simple conjunción"]=a/(2*c5+c5s)}else r["Colateral 5° grado"]=a/c5}
 else if(c5s>0)r["Colateral 5° grado, simple conjunción"]=a/c5s;
 else if(c6>0){if(c6s>0){r["Colateral 6° grado"]=a/(c6+c6s/2);r["Colateral 6° grado, simple conjunción"]=a/(2*c6+c6s)}else r["Colateral 6° grado"]=a/c6}
 else if(c6s>0)r["Colateral 6° grado, simple conjunción"]=a/c6s;
 else if(sin>0)r["Sin parentesco"]=a/sin;
 else if(nieto>0)r["Nieto o descendiente línea directa"]=a/nieto;
 else if(mas6>0)r["Colateral +6° grado"]=a/mas6;
 if(p==="Tio"||p==="Colateral 3° grado")return r.c3||0;
 if(p==="Tio simple conjunción"||p==="Colateral 3° grado, simple conjunción")return r.c3s||0;
 return r[p]||0;
}

/* ===== Cálculo completo ===== */
function sumDesc(a,name,key="valor"){return (a.desc?.[name]||[]).reduce((t,r)=>{computeDesc(DESC[name],r,a);return t+(typeof r[key]==="number"?r[key]:int(r[key]))},0)}
function legadoRows(){const out=[];for(const n of [...PRINCIPALES,...catsVisibles()]){const c=CATS[n];if(!c.leg)continue;for(const r of allRows(n))out.push({cat:n,row:r})}return out}
function findBien(ref){const r=(S.bienes[ref.cat]||[]).find(x=>x.id===ref.id);return r?{c:CATS[ref.cat],r}:null}
function legadosDe(a){let bienes=0;for(const l of a.legados||[]){const b=findBien(l);if(!b){l.valorCalc=0;continue}l.valorCalc=valorLegado(b.r._base??int(b.r[b.c.base]),l);bienes+=l.valorCalc}
 const dinero=S.tipo==="Testadas"?sumDesc(a,"dinerolibre"):0,pension=S.tipo==="Testadas"?sumDesc(a,"pension"):0,cond=S.tipo==="Testadas"?sumDesc(a,"asignacionCondicional","valorAsig"):0;
 return {bienes,dinero,pension,cond,total:bienes+dinero+pension+cond,dos:bienes+dinero}}

function calcular(){
 const R={masa:0,M:{},legitimaRig:0,mejoras:0,libre:0,libreCompleta:0,legadosTotal:0,asig:[],avisos:[],credito18985:0,credito20444:0};
 if(!S)return R;
 const {m:M,u:U}=netos();R.M=M;
 const total=Math.round(masaHereditaria(M)||0);R.masa=total;
 for(const a of S.asignatarios){a._leg=legadosDe(a)}
 const legTot=S.tipo==="Testadas"?S.asignatarios.reduce((t,a)=>t+a._leg.total,0):0;R.legadosTotal=legTot;
 R.legitimaRig=Math.round(.5*total);R.mejoras=Math.round(.25*total);R.libreCompleta=Math.round(.25*total);R.libre=Math.max(0,Math.round(.25*total-legTot));
 for(const r of allRows("ley18985")){computeRow(CATS.ley18985,r);if(r.ley==="20.444")R.credito20444+=r.creditoUTM;else R.credito18985+=r.creditoUTM}
 const C=counts();const hayLeg=C.hijos+C.conyuge+C.asc>0;
 const uD=utmDevengo(),uH=utmHoy(),uf=ufHoy();
 const anios=fallecimiento()?Math.ceil(Math.abs(new Date()-new Date(fallecimiento()))/864e5/365):0;R.prescrita=anios>8;R.aniosDevengo=fallecimiento()?(new Date()-new Date(fallecimiento()))/(365.25*864e5):0;
 const testada=S.tipo==="Testadas";
 // porciones (legítima / mejoras / libre) por asignatario
 const activos=S.asignatarios.filter(a=>a.repudia==="No");
 const sumaLibre=activos.reduce((t,a)=>t+dec(a.libreDisposicion),0);
 const wb=pct=>!hayLeg?(total-legTot)*(pct/100):R.libre*(pct/100);
 let excedente=0;
 if(testada&&hayLeg){let asignado=0;for(const a of activos){asignado+=wb(dec(a.libreDisposicion));if(puedeMejoras(a.parentesco))asignado+=R.mejoras*dec(a.cuartaDeMejoras)/100}excedente=Math.max(0,R.mejoras+R.libre-asignado)}
 R.excedente=excedente;
 for(const a of S.asignatarios){
  const k={legitima:0,libre:0,mejora:0,legados:0,legadosDos:0,pension:0,cond:0,fidei:0,dpa:0,d16271:0,donaciones:0,donPlenaUTM:0,donNudaUTM:0,fideiUTM:0};
  a.calc=k; if(a.repudia!=="No")continue;
  const p=a.parentesco;
  if(esLegitimario(p)) k.legitima=testada?cuotaLegitimaria(R.legitimaRig+excedente,C,p):cuotaLegitimaria(total,C,p);
  else { const base=testada?(hayLeg?R.legitimaRig:wb(100-sumaLibre))+excedente:total; k.legitima=cuotaColateral(base,C,p) }
  k.legitima=Math.round(k.legitima);
  if(testada){k.libre=Math.round(wb(dec(a.libreDisposicion)));k.mejora=puedeMejoras(p)?Math.round(R.mejoras*dec(a.cuartaDeMejoras)/100):0}
  k.legados=testada?a._leg.total:0;k.legadosDos=testada?a._leg.dos:0;k.pension=testada?a._leg.pension:0;k.cond=testada?a._leg.cond:0;
  if(testada){for(const r of a.desc?.asignacionFideicomisario||[]){computeDesc(DESC.asignacionFideicomisario,r,a);const u=dec(r.utmDev);k.fidei+=u?int(r.valorFid)/u*uH:0;k.fideiUTM+=r.impUTM||0}k.fidei=Math.round(k.fidei)}
  k.dpa=sumDesc(a,testada?"dpaT":"dpaI");k.d16271=sumDesc(a,"ley16271");
  k.donaciones=sumDesc(a,"plena")+sumDesc(a,"nuda");k.donPlenaUTM=sumDesc(a,"plena","impUTM");k.donNudaUTM=sumDesc(a,"nuda","impUTM");
 }
 // Exención de bienes raíces (DFL2 / Ley Pereira): se prorratea como descuento particular
 const exentos=[...allRows("brna"),...allRows("bra")].filter(r=>r.cal&&r.cal.exencion&&r.cal.exencion!=="Sin exenciones").reduce((t,r)=>t+r.valor,0);
 R.exentosBBRR=exentos;
 const den=total-legTot;
 for(const a of activos){const k=a.calc;k.factor=den>0?(k.legitima+k.mejora+k.libre)/den:0;k.dpaBBRR=Math.round(k.factor*exentos);k.dpaTotal=k.dpa+k.dpaBBRR}
 const extUTM=U["Bienes en el extranjero"]||0;
 const calcPersona=(k,p,discap)=>{ // k: componentes en pesos; devuelve el detalle del impuesto
  const {ex,rec}=exencionRecargo(p);k.exencion=ex;k.recargo=rec;
  k.prebase=k.legitima+k.libre+k.mejora+k.legados+k.fidei;
  k.prebaseEx=k.legitima+k.libre+k.mejora+k.legados;
  k.baseUTM=uD?Math.max(0,(k.prebase+k.donaciones-k.d16271-(k.dpaTotal??k.dpa))/uD):0;
  k.basePesos=Math.round(k.baseUTM*uD);
  k.netaUTM=Math.max(0,k.baseUTM-ex);
  k.brutoUTM=impuestoEscala(k.netaUTM);
  const gb=k.legitima+k.libre+k.mejora+k.legados;const share=total>0?gb/total:0;
  k.ley20444=R.credito20444*share;
  k.extC=den>0?((k.legitima+k.mejora+k.libre)/den)*extUTM:0;k.extI=k.extI||0;
  k.donB=(k.donPlenaUTM||0)+(k.donNudaUTM||0);k.fideiCred=k.fideiUTM||0;
  k.discap=0;
  if(discap){const h=.3*(k.brutoUTM*rec-(k.donB+k.extC+k.extI+k.fideiCred));const tope=uH?8000*uf/uH:Infinity;k.discap=h<=0?0:Math.min(h,tope)}
  const hb=rec*k.brutoUTM-k.donB-k.extC-k.extI-k.fideiCred-k.discap-k.ley20444;
  const e18=R.credito18985*share;k.ley18985=.4*hb<=0?0:Math.min(.4*hb,e18);
  k.creditos=k.fideiCred+k.discap+k.donB+k.extI+k.extC+k.ley20444+k.ley18985;
  let fin=(k.brutoUTM-k.creditos<=0||anios>8)?0:k.brutoUTM*rec-k.creditos;fin=Math.max(0,Math.round(fin*100)/100);
  k.finalUTM=fin;k.finalPesos=p==="Exento"?0:Math.round(fin*uH);
  return k;
 };
 for(const a of S.asignatarios){
  const k=a.calc;a.subs=a.subs||[];
  if(a.repudia!=="No"){R.asig.push({a,k,subs:[]});continue}
  // bienes en el extranjero legados directamente: crédito individual
  k.extI=(a.legados||[]).reduce((t,l)=>{if(l.cat!=="extranjero")return t;const b=findBien(l);return t+(b?(b.r.impUTM||0)*dec(l.porcentaje)/100:0)},0);
  const subs=[];
  const reparte=(a.cede==="Si"||(a.fallecido&&a.fallecido!=="No"))&&a.subs.length>0;
  if(reparte){
   let pctTot=0;
   const sub=a.subs.map(s=>{let pct=a.fallecido==="Antes"&&a.cede!=="Si"?100/a.subs.length:dec(s.porcentaje);pctTot+=pct;const f=pct/100;
    const ks={legitima:Math.round(k.legitima*f),libre:Math.round(k.libre*f),mejora:Math.round(k.mejora*f),legados:Math.round(k.legados*f),legadosDos:Math.round(k.legadosDos*f),pension:Math.round(k.pension*f),cond:Math.round(k.cond*f),fidei:Math.round(k.fidei*f),dpa:Math.round(k.dpa*f),dpaBBRR:Math.round((k.dpaBBRR||0)*f),d16271:0,donaciones:0,donPlenaUTM:0,donNudaUTM:0,fideiUTM:k.fideiUTM*f,extI:k.extI*f};
    ks.dpaTotal=ks.dpa+ks.dpaBBRR;return {s,k:calcPersona(ks,s.parentesco,false),pct}});
   subs.push(...sub);
   const f=Math.max(0,1-pctTot/100);
   for(const key of ["legitima","libre","mejora","legados","legadosDos","pension","cond","fidei","dpa","dpaBBRR","dpaTotal"])k[key]=Math.round((k[key]||0)*f);
   k.fideiUTM*=f;k.extI*=f;
  }
  calcPersona(k,a.parentesco,!!String(a.discapacidad||"").trim());
  R.asig.push({a,k,subs});
 }
 R.totalImpuesto=R.asig.reduce((t,x)=>t+(x.k.finalPesos||0)+x.subs.reduce((u,s)=>u+s.k.finalPesos,0),0);
 return R;
}

/* ===== Interfaz ===== */
const app=document.getElementById("simApp");if(!app)return;app.classList.add("sim-root");
const DRAFT_KEY="simuladorHerencia1";
const store={get(){try{return JSON.parse(localStorage.getItem(DRAFT_KEY)||"null")}catch(e){return null}},set(v){try{localStorage.setItem(DRAFT_KEY,JSON.stringify(v));return true}catch(e){return false}},del(){try{localStorage.removeItem(DRAFT_KEY)}catch(e){}}};
function getP(o,p){return p.split(".").reduce((x,k)=>x?.[k],o)}
function setP(o,p,v){const ks=p.split(".");let x=o;for(let i=0;i<ks.length-1;i++)x=x[ks[i]];x[ks[ks.length-1]]=v}
function toast(msg){const t=document.createElement("div");t.className="sim-toast";t.setAttribute("role","status");t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2800)}
const opts=(list,sel,ph="Seleccione")=>`<option value="">${ph}</option>`+list.map(o=>`<option${o===sel?" selected":""}>${esc(o)}</option>`).join("");
const comunasDe=reg=>(DATA_REGIONES.find(r=>r.region===reg)||{comunas:[]}).comunas;
const nombreCompleto=a=>[a.nombre,a.apellidoPaterno,a.apellidoMaterno].filter(Boolean).join(" ");

/* ---------- campos de secciones simples ---------- */
function fld(path,label,o={}){
 const v=getP(S,path)??"";const id="f_"+path.replace(/\./g,"_");const req=o.req?` <span class="sim-req" aria-hidden="true">*</span>`:"";
 let ctl;
 if(o.sel) ctl=`<select id="${id}" data-b="${path}"${o.struct?" data-struct":""}${o.dis?" disabled":""}>${opts(o.sel,v)}</select>`;
 else ctl=`<input id="${id}" type="${o.type||"text"}" data-b="${path}" value="${esc(v)}"${o.ph?` placeholder="${esc(o.ph)}"`:""}${o.dis?" disabled":""}${o.rut?" data-rut":""}${o.struct?" data-struct":""}${o.mode?` inputmode="${o.mode}"`:""}>`;
 if(o.btn) ctl=`<div class="sim-inline">${ctl}<button type="button" class="sim-btn sim-sm sim-ghost" data-sim="${o.btn[1]}">${o.btn[0]}</button></div>`;
 return `<div class="sim-f"><label for="${id}">${esc(label)}${req}</label>${ctl}</div>`;
}
function panel(id,step,title,body,st){
 const open=S.ui.open[id]!==false;
 const stc=st==null?"":st.length?`<span class="sim-state sim-todo">${st.length} pendiente${st.length>1?"s":""}</span>`:`<span class="sim-state sim-ok">Completo</span>`;
 return `<section class="sim-panel" id="simsec-${id}"><div class="sim-ph">${step?`<span class="sim-step">${step}</span>`:""}<h2>${title}</h2>${stc}<button type="button" class="sim-help" data-sim="help" data-k="${id}">¿Qué va aquí?</button><button type="button" class="sim-toggle" data-sim="toggle" data-k="${id}" aria-expanded="${open}" aria-label="${open?"Contraer":"Expandir"} ${esc(title)}">${open?"−":"+"}</button></div><div class="sim-pb"${open?"":" hidden"}>${S.ui.help===id?`<div class="sim-hint">${SECCIONES_HELP[id]||""}</div>`:""}${body}</div></section>`;
}

/* ---------- validaciones por sección ---------- */
function faltan(obj,keys){return keys.filter(([k])=>!String(obj[k]??"").trim()).map(([,l])=>l)}
function vDeclarante(){const d=S.declarante;const f=faltan(d,[["nombre","Nombre"],["rut","Rut"],["apellidoPaterno","Apellido Paterno"],["pais","País"],["ciudad","Ciudad"],["calle","Calle"],["numero","Número"],["telefono","Teléfono"],["correo","Email"]]);if(d.pais==="Chile"){if(!d.region)f.push("Región");if(!d.comuna)f.push("Comuna")}if(d.rut&&!rutValid(d.rut))f.push("Rut válido");if(d.correo&&d.correo!==d.correo2)f.push("Reingrese Email (no coincide)");return f}
function vCausante(){const c=S.causante;const f=faltan(c,[["rut","Rut"],["nombre","Nombre"],["apellidoPaterno","Apellido Paterno"],["fechaFallecimiento","Fecha Fallecimiento"],["estadoCivil","Estado Civil"]]);if(c.rut&&!rutValid(c.rut))f.push("Rut válido");if(["Casado","Conviviente civil"].includes(c.estadoCivil)&&!c.regimen)f.push("Régimen");if(c.regimen==="Sociedad Conyugal"){if(!c.mujerRenuncia)f.push("Mujer renuncia gananciales");if(!c.sexo)f.push("Sexo")}if(c.fechaFallecimiento&&!utmDevengo())f.push("UTM fecha de fallecimiento (en Parámetros)");return f}
function vPosesion(){return faltan(S.posesion,[["numeroInscripcion","N° Inscripción / Causa"],["oficina","Oficina Registro Civil / Juzgado"],["fechaRes","Fecha Resolución"],["folio","Folio Certificado / Fojas"]])}
function vInventario(){return faltan(S.inventario,[["fechaProtocolizacion","Fecha Protocolización"],["notaria","Notaría"],["fechaPublicacion","Fecha de publicación legal"]])}
function vTestamento(){return faltan(S.testamento,[["notaria","Notaría"],["fecha","Fecha de otorgamiento"],["inscripcion","Número de inscripción"],["pais","País de otorgamiento"]])}
function vAbogado(){return [...faltan(S.abogado,[["rut","Rut abogado"],["nombre","Nombre abogado"],["telefono","Teléfono"],["correo","Email"]]),...faltan(S.tribunal,[["juzgado","Tribunal"],["rol","Rol"],["fechaAuto","Fecha auto posesión efectiva"]])]}
function vAsignatarios(){const f=[];if(!S.asignatarios.length)f.push("Al menos un asignatario");S.asignatarios.forEach(a=>{if(!a.parentesco)f.push("Parentesco de "+nombreCompleto(a));if(a.cede==="Si"&&!a.subs.length)f.push("Cesionarios de "+nombreCompleto(a));if(a.fallecido&&a.fallecido!=="No"&&a.cede!=="Si"&&!a.subs.length)f.push((a.fallecido==="Antes"?"Representantes de ":"Herederos de ")+nombreCompleto(a))});return f}
function vBienes(){const f=[];const n=[...PRINCIPALES,...catsVisibles()].reduce((t,k)=>t+allRows(k).length,0);if(!n)f.push("Al menos un bien");const sinAdh=allRows("bra").filter(b=>!allRows("bienesAdherencia").some(x=>x.rolSel===b.rol)).map(b=>b.rol);if(sinAdh.length)f.push("Bienes por adherencia de roles agrícolas: "+sinAdh.join(", "));return f}

/* ---------- pantalla inicial ---------- */
function renderStart(){
 const d=store.get();
 app.innerHTML=`<div class="sim-start">
 ${d?`<div class="sim-alert sim-info sim-resume"><span>Tienes un borrador guardado en este navegador: <b>Herencia ${esc(d.tipo)}</b>${d.causante?.nombre?" de "+esc(nombreCompleto(d.causante)):""}.</span><button class="sim-btn sim-sm" data-sim="resume">Retomar borrador</button><button class="sim-btn sim-sm sim-ghost" data-sim="discard">Borrar borrador</button></div>`:""}
 <h2 class="sim-h2">Elige el formulario que quieres practicar</h2>
 <div class="sim-types">
  <div class="sim-type"><span class="sim-etq">Sin testamento</span><b>Herencia intestada</b><span class="sim-desc">La posesión efectiva la otorga el Registro Civil y la herencia se reparte según los órdenes de sucesión de la ley. Es el caso que explica esta guía.</span><div class="sim-row"><button class="sim-btn" data-sim="start" data-t="Intestadas">Comenzar</button><button class="sim-btn sim-ghost" data-sim="example" data-t="Intestadas">Ver caso de ejemplo</button></div></div>
  <div class="sim-type sim-type-osc"><span class="sim-etq">Con testamento</span><b>Herencia testada</b><span class="sim-desc">La posesión efectiva la otorga un tribunal, con inventario solemne. Agrega legados, cuarta de mejoras y cuarta de libre disposición.</span><div class="sim-row"><button class="sim-btn" data-sim="start" data-t="Testadas">Comenzar</button><button class="sim-btn sim-ghost" data-sim="example" data-t="Testadas">Ver caso de ejemplo</button></div></div>
 </div>
 <p class="sim-note">El formulario del SII también tiene una opción "Donaciones", que este simulador no incluye.</p>
 <h2 class="sim-h2">Cómo practicar</h2>
 <ol class="sim-pasos"><li><b>Elige el formulario</b><p>Testadas o Intestadas, igual que en la primera pantalla del SII.</p></li><li><b>Completa a las personas</b><p>Declarante, causante y todos los asignatarios, incluso quienes repudien.</p></li><li><b>Declara los bienes y las deudas</b><p>Cada categoría muestra su subtotal y la masa hereditaria se calcula sola.</p></li><li><b>Revisa el cálculo y envía</b><p>Verás el impuesto de cada asignatario, los giros y un comprobante de práctica sin validez.</p></li></ol>
 </div>`;
}

/* ---------- formulario ---------- */
function render(){
 if(!S){renderStart();return}
 const T=S.tipo,R=calcular();window.__R=R;
 const st={declarante:vDeclarante(),causante:vCausante(),posesion:vPosesion(),inventario:vInventario(),testamento:vTestamento(),abogado:vAbogado(),asignatarios:vAsignatarios(),bienes:vBienes()};
 let n=0;const step=()=>String(++n);
 const sec=[];
 sec.push(panel("declarante",step(),"Datos del Declarante",declaranteHTML(),st.declarante));
 sec.push(panel("contacto",step(),"Contador / Abogado / Contacto tributario",contactoHTML(),null));
 sec.push(panel("causante",step(),"Datos del Causante",causanteHTML(),st.causante));
 if(T==="Intestadas")sec.push(panel("posesion",step(),"Datos de solicitud de posesión efectiva",posesionHTML(),st.posesion));
 if(T==="Testadas"){sec.push(panel("inventario",step(),"Datos del Inventario",inventarioHTML(),st.inventario));sec.push(panel("testamento",step(),"Datos del Testamento",testamentoHTML(),st.testamento));sec.push(panel("abogado",step(),"Datos del Abogado Patrocinante y Tribunal",abogadoHTML(),st.abogado))}
 sec.push(panel("asignatarios",step(),"Lista Asignatarios",asignatariosHTML(R),st.asignatarios));
 sec.push(panel("bienes",step(),"Declaración de Bienes",bienesHTML(R),st.bienes));
 sec.push(panel("agregados",step(),"Agregados/deducciones base imponible",agregadosHTML(R),null));
 sec.push(panel("calculo",step(),"Cálculo de Impuestos",`<div id="sim-calc-out">${calculoHTML(R)}</div>`,null));
 S._st=st;
 app.innerHTML=`<div class="sim-main"><div class="sim-stack">
  <div class="sim-form-title"><h2>Formulario Herencias ${T}</h2><button class="sim-btn sim-sm sim-ghost" data-sim="example" data-t="${T}">Cargar caso de ejemplo</button><button class="sim-btn sim-sm sim-ghost" data-sim="reset">Cambiar formulario</button></div>
  ${sec.join("")}
  <section class="sim-panel" id="simsec-envio"><div class="sim-pb" style="display:grid;gap:14px"><p class="sim-jurada">Declaro bajo juramento que los datos contenidos en la presente declaración son la expresión fiel de la verdad. Los documentos y antecedentes que han servido de base para la determinación del impuesto deberán conservarse y mantenerse a disposición del Servicio de Impuestos Internos para futuras fiscalizaciones, dentro del período de prescripción que establece la ley.</p>
  <div class="sim-actions"><button class="sim-btn sim-ghost" data-sim="reset">Volver</button><button class="sim-btn sim-ghost" data-sim="save">Guardar</button><button class="sim-btn sim-cta" data-sim="send">Enviar</button></div></div></section>
 </div><aside class="sim-rail" id="sim-rail">${railHTML(R)}</aside></div>`;
}
function declaranteHTML(){const d=S.declarante;return `<div class="sim-grid">${fld("declarante.nombre","Nombre",{req:1})}${fld("declarante.rut","Rut",{req:1,rut:1,ph:"12.345.678-9"})}${fld("declarante.apellidoPaterno","Apellido Paterno",{req:1})}${fld("declarante.apellidoMaterno","Apellido Materno")}${fld("declarante.pais","País",{sel:DATA_PAISES,req:1,struct:1})}${fld("declarante.ciudad","Ciudad",{req:1})}${d.pais==="Chile"?fld("declarante.region","Región",{sel:DATA_REGIONES.map(r=>r.region),req:1,struct:1})+fld("declarante.comuna","Comuna",{sel:comunasDe(d.region),req:1}):""}${fld("declarante.calle","Calle",{req:1})}${fld("declarante.numero","Número",{req:1})}${fld("declarante.depto","Block/Depto")}${fld("declarante.telefono","Teléfono",{req:1,mode:"tel"})}${fld("declarante.correo","Email",{req:1,type:"email"})}${fld("declarante.correo2","Reingrese Email",{req:1,type:"email"})}</div>`}
function contactoHTML(){const c=S.contacto;if(!c.activo)return `<p class="sim-note" style="margin:0 0 10px">No hay contacto agregado. Es opcional.</p><button class="sim-btn sim-sm sim-ghost" data-sim="contacto">Agregar contacto</button>`;return `<div class="sim-grid">${fld("contacto.nombre","Nombre")}${fld("contacto.rut","Rut",{rut:1})}${fld("contacto.telefono","Teléfono",{mode:"tel"})}${fld("contacto.email","Email",{type:"email"})}</div><div style="margin-top:10px"><button class="sim-btn sim-sm sim-ghost" data-sim="contacto">Quitar contacto</button></div>`}
function causanteHTML(){const c=S.causante;return `<div class="sim-grid">${fld("causante.rut","Rut",{req:1,rut:1,ph:"12.345.678-9",btn:["Consultar Rut","consultarCausante"]})}${fld("causante.nombre","Nombre",{req:1})}${fld("causante.apellidoPaterno","Apellido Paterno",{req:1})}${fld("causante.apellidoMaterno","Apellido Materno")}${fld("causante.fechaFallecimiento","Fecha Fallecimiento",{req:1,type:"date",struct:1})}${fld("causante.estadoCivil","Estado Civil",{req:1,sel:ESTADOS_CIVILES,struct:1})}
 ${["Casado","Conviviente civil"].includes(c.estadoCivil)?fld("causante.regimen","Régimen",{req:1,sel:REGIMENES.filter(r=>c.estadoCivil==="Casado"?r!=="Comunidad":["Separación total de bienes","Comunidad"].includes(r)),struct:1}):""}
 ${c.regimen==="Sociedad Conyugal"?fld("causante.sexo","Sexo",{req:1,sel:["Masculino","Femenino"],struct:1})+fld("causante.mujerRenuncia","Mujer renuncia gananciales",{req:1,sel:["Si","No"],struct:1}):""}</div>
 <p class="sim-note" style="margin:12px 0 0">* Al editar los campos de estado civil, deberá declarar nuevamente los bienes.</p>
 ${c.regimen==="Sociedad Conyugal"?`<div class="sim-alert sim-warn" style="margin-top:10px">Recuerde que el valor que declare respecto a los bienes debe ser por el total (sin considerar las divisiones que correspondan por la Sociedad Conyugal). El formulario hace automáticamente los cálculos que procedan.</div>`:""}`}
function posesionHTML(){return `<div class="sim-grid">${fld("posesion.numeroInscripcion","N° Inscripción / Causa",{req:1})}${fld("posesion.oficina","Oficina Registro Civil / Juzgado",{req:1})}${fld("posesion.fechaRes","Fecha Resolución",{req:1,type:"date"})}${fld("posesion.folio","Folio Certificado / Fojas",{req:1})}</div>`}
function inventarioHTML(){return `<div class="sim-grid">${fld("inventario.fechaProtocolizacion","Fecha Protocolización",{req:1,type:"date"})}${fld("inventario.notaria","Notaría",{req:1,sel:DATA_NOTARIAS})}${fld("inventario.fechaPublicacion","Fecha de publicación legal",{req:1,type:"date"})}</div>`}
function testamentoHTML(){return `<div class="sim-grid">${fld("testamento.notaria","Notaría",{req:1,sel:DATA_NOTARIAS})}${fld("testamento.fecha","Fecha de otorgamiento",{req:1,type:"date"})}${fld("testamento.inscripcion","Número de inscripción",{req:1})}${fld("testamento.pais","País de otorgamiento",{req:1})}</div>`}
function abogadoHTML(){return `<div class="sim-grid">${fld("abogado.rut","Rut",{req:1,rut:1,btn:["Consultar Rut","consultarAbogado"]})}${fld("abogado.nombre","Nombre",{req:1})}${fld("abogado.apellidoPaterno","Apellido Paterno")}${fld("abogado.apellidoMaterno","Apellido Materno")}${fld("abogado.telefono","Teléfono",{req:1,mode:"tel"})}${fld("abogado.correo","Email",{req:1,type:"email"})}</div><div class="sim-sub">Tribunal</div><div class="sim-grid">${fld("tribunal.juzgado","Tribunal",{req:1,ph:"Ej.: 5° Juzgado Civil de Santiago"})}${fld("tribunal.rol","Rol",{req:1,ph:"V-123-2026"})}${fld("tribunal.fechaAuto","Fecha auto posesión efectiva",{req:1,type:"date"})}</div>`}

/* ---------- asignatarios ---------- */
function asignatariosHTML(R){
 if(!S.asignatarios.length)return `<div class="sim-empty">Aún no hay asignatarios. Agrega a cada heredero, incluso a quienes repudien la herencia.</div><div style="margin-top:12px"><button class="sim-btn" data-sim="addAsig">Agregar nuevo Asignatario</button></div>`;
 return `<div class="sim-cards">${S.asignatarios.map(a=>{const open=S.ui.acc["a"+a.id];
  const flags=[a.repudia==="Si"?`<span class="sim-chip sim-bad">Repudia</span>`:"",a.cede==="Si"?`<span class="sim-chip sim-amber">Cede ${esc(a.porcentajeCede||"")}%</span>`:"",a.fallecido==="Antes"?`<span class="sim-chip sim-amber">Fallecido antes · representación</span>`:a.fallecido==="Después"?`<span class="sim-chip sim-amber">Fallecido después · transmisión</span>`:"",String(a.discapacidad||"").trim()?`<span class="sim-chip">Discapacidad</span>`:""].join("");
  const reparte=a.cede==="Si"||(a.fallecido&&a.fallecido!=="No");
  return `<div class="sim-card"><div class="sim-card-h"><div class="sim-who"><b>${esc(nombreCompleto(a))}</b><span class="sim-note sim-num">${esc(rutFmt(a.rut))}</span></div><span class="sim-chip">${esc(a.parentesco||"Sin parentesco")}</span>${flags}
   <button class="sim-icon-btn" data-sim="editAsig" data-id="${a.id}">Editar</button><button class="sim-icon-btn" data-sim="togAsig" data-id="${a.id}" aria-expanded="${!!open}">${open?"Ocultar":"Ver detalle"}</button><button class="sim-icon-btn sim-del" data-sim="delAsig" data-id="${a.id}">Eliminar</button></div>
   ${open?`<div class="sim-kv">${[["Apellido Paterno",a.apellidoPaterno],["Apellido Materno",a.apellidoMaterno],["Rut",rutFmt(a.rut)],["Calle Domicilio",[a.calle,a.numero].filter(Boolean).join(" ")],["Tipo Domicilio",a.depto],["Comuna",a.comuna],["Ciudad",a.ciudad],["Email",a.email],["Parentesco",a.parentesco],["Cede",a.cede],["Repudia",a.repudia],...(S.tipo==="Testadas"?[["Libre Disposición",(a.libreDisposicion||0)+"%"],["Cuarta de Mejoras",(a.cuartaDeMejoras||0)+"%"]]:[])].map(([k,v])=>`<div><span>${k}</span>${esc(v||"—")}</div>`).join("")}</div>`:""}
   ${reparte?subsHTML(a):""}</div>`}).join("")}</div><div style="margin-top:12px"><button class="sim-btn" data-sim="addAsig">Agregar nuevo Asignatario</button></div>`;
}
function subsHTML(a){
 const tipo=a.cede==="Si"?"Cesionarios":a.fallecido==="Antes"?"Representantes":"Herederos";
 const igual=tipo==="Representantes";const key="sub:"+a.id;const e=S.entries[key]=S.entries[key]||{rut:"",nombre:"",parentesco:"",porcentaje:""};
 const pars=a.cede==="Si"?(S.tipo==="Intestadas"?PAR_I_CES:PAR_T):PAR_REP;
 const txt=tipo==="Cesionarios"?`Este asignatario cede su derecho de herencia. Agrega a quién(es) cede y el porcentaje; cada cesionario paga el impuesto sobre la parte cedida.`:tipo==="Representantes"?`El asignatario falleció antes que el causante. Sus descendientes lo representan y se reparten su cuota en partes iguales.`:`El asignatario falleció después que el causante. Su cuota se transmite a sus herederos según el porcentaje que indiques.`;
 return `<div style="padding:10px 12px;display:grid;gap:8px;border-top:1px solid var(--line)"><b>${tipo}</b><p class="sim-note" style="margin:0">${txt}</p>
 <div class="sim-tbl-wrap"><table><thead><tr><th>Rut</th><th>Nombre</th><th>Parentesco con el causante</th>${igual?"":"<th class=\"sim-r\">%</th>"}<th></th></tr></thead><tbody>
 ${a.subs.map(s=>`<tr><td class="sim-num">${esc(rutFmt(s.rut))}</td><td>${esc(s.nombre)}</td><td>${esc(s.parentesco)}</td>${igual?"":`<td class="sim-r sim-num">${esc(s.porcentaje)}</td>`}<td><button class="sim-icon-btn sim-del" data-sim="delSub" data-id="${a.id}" data-sid="${s.id}">Eliminar</button></td></tr>`).join("")}
 <tr class="sim-entry"><td><input type="text" id="sub_rut_${a.id}" data-e="${key}|rut" value="${esc(e.rut)}" placeholder="Rut" data-rut></td><td><input type="text" id="sub_nom_${a.id}" data-e="${key}|nombre" value="${esc(e.nombre)}" placeholder="Nombre completo"></td><td><select id="sub_par_${a.id}" data-e="${key}|parentesco">${opts(pars,e.parentesco)}</select></td>${igual?"":`<td class="sim-narrow"><input type="text" id="sub_pct_${a.id}" data-e="${key}|porcentaje" value="${esc(e.porcentaje)}" placeholder="%" inputmode="decimal"></td>`}<td><button class="sim-btn sim-sm" data-sim="addSub" data-id="${a.id}">Agregar</button></td></tr>
 </tbody></table></div></div>`;
}

/* ---------- tabla genérica (bienes / descuentos / legados) ---------- */
function fmtCell(f,v){if(v==null||v==="")return "—";if(f.t==="money"||f.k==="valor"||f.t==="calc"&&!f.dec&&f.k!=="comuna")return typeof v==="number"||/^[\d.]+$/.test(String(v))?pesos(typeof v==="number"?v:int(v)):esc(v);if(f.dec)return d2(v,f.dec);if(f.t==="utm"||f.t==="uf"||f.t==="decim")return d2(dec(v),2);if(f.t==="date")return fdate(v);if(f.t==="rut")return rutFmt(v);if(f.t==="check")return v?"Sí":"No";return esc(v)}
function calidadLabel(o){if(!o)return "Plena propiedad";const p=dec(o.porcentaje||100);return `${o.calidad}${p!==100?" · "+p+"%":""}${o.exencion&&o.exencion!=="Sin exenciones"?" · "+o.exencion:""}`}
function entryCtl(key,f,e,def){
 const id=`e_${key.replace(/[^a-z0-9]/gi,"_")}_${f.k}`;const v=e[f.k]??"";const b=`data-e="${key}|${f.k}" id="${id}" aria-label="${esc(f.l)}"`;
 if(f.when&&!f.when(e))return `<input type="text" ${b} value="--" disabled>`;
 switch(f.t){
  case "sel": return `<select ${b}>${opts(f.o,v)}</select>`;
  case "pais": return `<select ${b}>${opts(DATA_PAISES,v)}</select>`;
  case "selrol": {const roles=allRows("bra").map(r=>r.rol);return `<select ${b}>${opts(roles,v,roles.length?"Seleccione":"Sin roles agrícolas")}</select>`}
  case "check": return `<label style="display:flex;gap:6px;align-items:center;font-weight:400"><input type="checkbox" ${b}${v?" checked":""}> No tiene</label>`;
  case "calc": return `<input type="text" ${b} data-calc value="${esc(calcVal(f,v))}" readonly tabindex="-1" class="sim-calc">`;
  case "utm": {const auto=utmFor(e[f.dateFrom]);return auto?`<input type="text" ${b} data-calc value="${d2(auto,0)}" readonly tabindex="-1" class="sim-calc">`:`<input type="text" ${b} value="${esc(v)}" placeholder="${e[f.dateFrom]?"Ingresa UTM":"Elige fecha"}" inputmode="decimal" class="sim-money">`}
  case "date": return `<input type="date" ${b} value="${esc(v)}" data-struct-e>`;
  case "rol": return `<div class="sim-inline"><input type="text" ${b} value="${esc(v)}" placeholder="Rol"><button type="button" class="sim-btn sim-sm sim-ghost" data-sim="buscarRol" data-key="${key}" data-cat="${def.name}">Buscar</button></div>`;
  case "cod": return `<div class="sim-inline"><input type="text" ${b} value="${esc(v)}" placeholder="Código"><button type="button" class="sim-btn sim-sm sim-ghost" data-sim="buscarCod" data-key="${key}">Buscar</button></div>`;
  case "money": {const lock=f.lock&&!adquiridoReciente(e);return `<input type="text" ${b} value="${esc(v?miles(int(v)):"")}" inputmode="numeric" class="sim-money" data-money${lock?" readonly tabindex=\"-1\"":""} placeholder="${lock?"Usa Buscar":"$"}">`}
  case "uf": case "decim": return `<input type="text" ${b} value="${esc(v)}" inputmode="decimal" class="sim-money">`;
  case "int": return `<input type="text" ${b} value="${esc(v)}" inputmode="numeric" class="sim-money">`;
  case "rut": return `<input type="text" ${b} value="${esc(v)}" placeholder="12.345.678-9" data-rut>`;
  default: return `<input type="text" ${b} value="${esc(v)}">`;
 }
}
function calcVal(f,v){if(v===""||v==null)return "";if(f.k==="comuna")return v;if(f.dec)return d2(v,f.dec);if(f.k==="ufHer")return d2(v,2);return miles(v)}
function tablaHTML(key,def,rows,ctx){
 const e=S.entries[key]=S.entries[key]||{cal:CAL_DEFAULT()};
 const fs=def.fields;const cal=!!def.calidad&&!ctx?.desc;
 return `<div class="sim-tbl-wrap"><table><thead><tr>${fs.map(f=>`<th${["money","calc"].includes(f.t)||f.k==="valor"?" class=\"sim-r\"":""}>${esc(f.l)}</th>`).join("")}${cal?"<th>Opciones avanzadas</th>":""}<th>${rows.length?"":"Agregar"}</th></tr></thead><tbody>
 ${rows.map(r=>`<tr>${fs.map(f=>`<td${["money","calc"].includes(f.t)||f.k==="valor"?` class="sim-r sim-num"`:""}>${fmtCell(f,f.when&&!f.when(r)?"":r[f.k])}</td>`).join("")}${cal?`<td>${esc(calidadLabel(r.cal))}</td>`:""}<td style="white-space:nowrap"><button class="sim-icon-btn" data-sim="editRow" data-key="${key}" data-id="${r.id}">Editar</button><button class="sim-icon-btn sim-del" data-sim="delRow" data-key="${key}" data-id="${r.id}">Eliminar</button></td></tr>`).join("")}
 <tr class="sim-entry">${fs.map(f=>`<td${f.t==="int"||f.t==="check"?' class="sim-narrow"':""}>${entryCtl(key,f,e,def)}</td>`).join("")}${cal?`<td><button type="button" class="sim-btn sim-sm sim-ghost" data-sim="calidad" data-key="${key}" data-cat="${def.name}">${esc(calidadLabel(e.cal))}</button></td>`:""}<td><button type="button" class="sim-btn sim-sm" data-sim="addRow" data-key="${key}">Agregar</button></td></tr>
 </tbody></table></div>`;
}

/* ---------- bienes ---------- */
function accHTML(id,title,valor,count,body,minus){const open=!!S.ui.acc[id];return `<div class="sim-acc"><button type="button" class="sim-acc-h${minus?" sim-minus":""}" data-sim="acc" data-k="${id}" aria-expanded="${open}"><span class="sim-t">${esc(title)}</span>${count?`<span class="sim-c">${count}</span>`:""}<span class="sim-v" data-o="acc:${id}">${valor}</span><span class="sim-arr" aria-hidden="true">${open?"▲":"▼"}</span></button>${open?`<div class="sim-acc-b">${body}</div>`:""}</div>`}
function catAcc(n){const c=CATS[n];const rows=allRows(n);const tot=rows.reduce((t,r)=>t+(c.credit?int(r.valor):(computeRow(c,r),c.minus?int(r.valor):r.valor)),0);
 const help=c.help?`<p class="sim-note" style="margin:0">${esc(c.help)}</p>`:"";
 const warn=n==="bienesAdherencia"&&!allRows("bra").length?`<div class="sim-alert sim-info">Primero declara los bienes raíces agrícolas; aquí eliges su rol.</div>`:"";
 return accHTML("b:"+n,c.titulo,pesos(tot),rows.length,help+warn+tablaHTML("b:"+n,c,rows),c.minus)}
function bienesHTML(R){
 const vis=catsVisibles();
 return `${PRINCIPALES.map(catAcc).join("")}
 <div class="sim-sub"><button type="button" class="sim-help" data-sim="otros" aria-expanded="${S.ui.otros}">${S.ui.otros?"Ocultar":"Mostrar"} otros bienes (${vis.length} categorías${vis.some(n=>allRows(n).length)?", con datos":""})</button></div>
 ${S.ui.otros?vis.map(catAcc).join(""):""}
 <div class="sim-total-bar"><span>Masa hereditaria (Total):</span><span class="sim-num" data-o="masa">${pesos(R.masa)}</span></div>
 ${S.tipo==="Testadas"?`<div class="sim-kv" style="padding:6px 0 0"><div><span>Mitad legitimaria (50%)</span><b class="sim-num" data-o="legRig">${pesos(R.legitimaRig)}</b></div><div><span>Cuarta de mejoras (25%)</span><b class="sim-num" data-o="mejoras">${pesos(R.mejoras)}</b></div><div><span>Cuarta de libre disposición disponible</span><b class="sim-num" data-o="libre">${pesos(R.libre)}</b></div><div><span>Total legados</span><b class="sim-num" data-o="legTot">${pesos(R.legadosTotal)}</b></div></div>`:""}`;
}

/* ---------- agregados / deducciones ---------- */
function legadosHTML(a){
 const key="leg:"+a.id;const e=S.entries[key]=S.entries[key]||{ref:"",porcentaje:"100",calidad:"Plena propiedad",tipoGravamen:"",cantAnios:"",nacimiento:""};
 const bienes=legadoRows();
 const label=x=>`${CATS[x.cat].desc}: ${x.row.descripcion||x.row.rol||x.row.patente||x.row.detalle||x.row.razon||x.row.nombre||x.row.inst||x.row.tipo||"bien"} (${pesos(x.row._base??0)})`;
 const g=e.calidad==="Plena propiedad"||e.calidad==="Fideicomiso";
 const legs=a.legados||[];
 return `<p class="sim-note" style="margin:0 0 8px">Asigna a esta persona un bien declarado (o un porcentaje de él). Los legados se pagan con la cuarta de libre disposición.</p>
 <div class="sim-tbl-wrap"><table><thead><tr><th>Bien</th><th class="sim-r">% a legar</th><th>Calidad</th><th>Tipo gravamen</th><th>Cantidad de años</th><th>Fecha nacimiento beneficiario</th><th class="sim-r">Valor legado</th><th></th></tr></thead><tbody>
 ${legs.map(l=>{const b=findBien(l);return `<tr><td>${b?esc(label({cat:l.cat,row:b.r})):"<span class=\"sim-note\">Bien eliminado</span>"}</td><td class="sim-r sim-num">${esc(l.porcentaje)}</td><td>${esc(l.calidad)}</td><td>${esc(l.tipoGravamen||"—")}</td><td>${esc(l.cantAnios||"—")}</td><td>${fdate(l.nacimiento)||"—"}</td><td class="sim-r sim-num">${pesos(l.valorCalc||0)}</td><td><button class="sim-icon-btn sim-del" data-sim="delLeg" data-id="${a.id}" data-lid="${l.lid}">Eliminar</button></td></tr>`}).join("")}
 <tr class="sim-entry"><td><select id="leg_ref_${a.id}" data-e="${key}|ref" aria-label="Bien a legar">${`<option value="">${bienes.length?"Seleccione un bien":"Declara bienes primero"}</option>`+bienes.map(x=>{const v=x.cat+"|"+x.row.id;return `<option value="${v}"${v===e.ref?" selected":""}>${esc(label(x))}</option>`}).join("")}</select></td>
 <td class="sim-narrow"><input type="text" id="leg_pct_${a.id}" data-e="${key}|porcentaje" value="${esc(e.porcentaje)}" inputmode="decimal" aria-label="Porcentaje"></td>
 <td><select id="leg_cal_${a.id}" data-e="${key}|calidad" data-struct-e aria-label="Calidad">${opts(CALIDADES_LEG,e.calidad)}</select></td>
 <td><select id="leg_gra_${a.id}" data-e="${key}|tipoGravamen" data-struct-e aria-label="Tipo gravamen"${g?" disabled":""}>${opts(GRAVAMENES,e.tipoGravamen)}</select></td>
 <td class="sim-narrow"><input type="text" id="leg_an_${a.id}" data-e="${key}|cantAnios" value="${esc(e.cantAnios)}" inputmode="numeric" aria-label="Cantidad de años"${!g&&["Tiempo determinado","Condición o a plazo que signifique condición"].includes(e.tipoGravamen)?"":" disabled"}></td>
 <td><input type="date" id="leg_nac_${a.id}" data-e="${key}|nacimiento" value="${esc(e.nacimiento)}" aria-label="Fecha de nacimiento"${!g&&e.tipoGravamen==="Vitalicio"?"":" disabled"}></td>
 <td class="sim-r sim-num" data-o="legprev:${a.id}">${pesos(previewLegado(e))}</td><td><button class="sim-btn sim-sm" data-sim="addLeg" data-id="${a.id}">Agregar</button></td></tr></tbody></table></div>`;
}
function previewLegado(e){if(!e.ref)return 0;const [cat,id]=e.ref.split("|");const b=findBien({cat,id});return b?valorLegado(b.r._base??0,e):0}
function agregadosHTML(R){
 const act=S.asignatarios.filter(a=>a.repudia==="No");
 if(!act.length)return `<div class="sim-empty">Agrega asignatarios para registrar donaciones previas, descuentos particulares${S.tipo==="Testadas"?" y legados":""}.</div>`;
 return act.map(a=>{a.desc=a.desc||{};const items=DESC_ORDER.filter(n=>DESC[n].tipos.includes(S.tipo));
  const body=(S.tipo==="Testadas"?`<div class="sim-sub">Legados</div>${legadosHTML(a)}<div class="sim-sub">Adiciones/Descuentos/Donaciones</div>`:"")+
   items.map(n=>{const d=DESC[n];const rows=a.desc[n]=a.desc[n]||[];const key=`d:${a.id}:${n}`;const tot=rows.reduce((t,r)=>{computeDesc(d,r,a);const v=n==="asignacionCondicional"?int(r.valorAsig):n==="asignacionFideicomisario"?int(r.valorFid):(typeof r.valor==="number"?r.valor:int(r.valor));return t+v},0);
    return accHTML(key,d.titulo,pesos(tot),rows.length,(d.help?`<p class="sim-note" style="margin:0">${esc(d.help)}</p>`:"")+(d.soloHijos&&a.parentesco!=="Hijo"?`<div class="sim-alert sim-info">Solo los hijos pueden declarar este descuento.</div>`:"")+tablaHTML(key,d,rows,{desc:true,a}))}).join("");
  const open=S.ui.acc["ag:"+a.id]!==false;
  return `<div class="sim-card" style="margin-bottom:10px"><div class="sim-card-h"><div class="sim-who"><b>Asignatario Rut/Run: <span class="sim-num">${esc(rutFmt(a.rut))}</span></b><span class="sim-note">${esc(nombreCompleto(a))}</span></div><span class="sim-chip">${esc(a.parentesco)}</span><button class="sim-icon-btn" data-sim="togAg" data-id="${a.id}" aria-expanded="${open}">${open?"Ocultar":"Mostrar"}</button></div>${open?`<div style="padding:12px;display:grid;gap:0">${body}</div>`:""}</div>`}).join("");
}

/* ---------- cálculo ---------- */
function filas(k,T){
 const r=[];const p=(s,l,v,o={})=>r.push({s,l,v,...o});
 if(T==="Testadas"){p("(+)","Legados",k.legadosDos);p("(+)","Legítima Efectiva",k.legitima);p("(+)","Cuarta de Mejoras",k.mejora);p("(+)","Cuarta Libre",k.libre);p("(+)","Asignación condicional",k.cond);p("(+)","Asignación fideicomisario",k.fidei);p("(-)","Descuentos particulares asignatario (DPA)",k.dpaTotal??k.dpa);p("(+)","Pensión periódica",k.pension)}
 else{p("(+)","Legítima Efectiva",k.legitima);p("(-)","Descuentos particulares asignatario (DPA)",k.dpaTotal??k.dpa)}
 p("(-)","Descuento por causante cónyuge de ascendiente común (artículo N° 2, Ley N° 16.271)",k.d16271);
 p("(+)","Donaciones previas",k.donaciones);
 p("","Base Imponible",k.basePesos,{cls:"sum"});
 p("","Base imponible individual UTM",k.baseUTM,{u:1});
 p("(-)","Exención por parentesco (art. 2°)",k.exencion,{u:0,raw:1,suf:" UTM"});
 p("","Impuesto Bruto (escala art. 2°, UTM)",k.brutoUTM,{u:1,cls:"sum"});
 p("(×)","Recargo por parentesco (art. 2°)",k.recargo,{pct:1});
 p("(-)","Crédito por donaciones previas",k.donB,{u:1});
 p("(-)","Crédito por impuestos pagados en el extranjero (c)",k.extC,{u:1});
 if(T==="Testadas")p("(-)","Crédito por impuestos pagados en el extranjero (i)",k.extI,{u:1});
 if(T==="Testadas")p("(-)","Crédito por fideicomiso",k.fideiCred,{u:1});
 p("(-)","Crédito por discapacidad",k.discap,{u:1});
 p("(-)","Crédito por Donaciones efectuadas en caso de catástrofe (Ley N° 20.444)",k.ley20444,{u:1});
 p("(-)","Crédito por donaciones con fines culturales (Ley N° 18.985)",k.ley18985,{u:1});
 p("","Impuesto neto (UTM)",k.finalUTM,{u:1,cls:"sum"});
 p("","Impuesto neto",k.finalPesos,{cls:"final"});
 return r.map(x=>{const v=x.pct?(x.v?Math.round((x.v-1)*100)+"%":"0%"):x.raw?miles(x.v)+(x.suf||""):x.u?d2(x.v||0):pesos(x.v||0);return `<tr class="${x.cls?"sim-"+x.cls:""}${!x.v&&!x.cls?" sim-zero":""}"><td class="sim-sign">${x.s}</td><td>${esc(x.l)}</td><td>${v}</td></tr>`}).join("");
}
function calculoHTML(R){
 if(!S.asignatarios.length)return `<div class="sim-empty">El cálculo aparece cuando agregas asignatarios y bienes.</div>`;
 const uD=utmDevengo();
 return `<div class="sim-calc">
 ${!uD&&fallecimiento()?`<div class="sim-alert sim-warn">No hay valor de UTM para la fecha de fallecimiento. Ingrésalo en "Parámetros" para calcular.</div>`:""}
 ${R.prescrita?`<div class="sim-alert sim-warn">Han pasado más de 8 años desde el fallecimiento: la acción de cobro está prescrita y el impuesto se calcula en cero.</div>`:""}
 <p class="sim-note" style="margin:0">UTM a la fecha de fallecimiento: <b class="sim-num">${uD?d2(uD,0):"—"}</b> (convierte la base a UTM) · UTM del día: <b class="sim-num">${d2(utmHoy(),0)}</b> (convierte el impuesto a pesos).</p>
 ${R.asig.map(({a,k,subs})=>{
  if(a.repudia!=="No")return `<div class="sim-card"><div class="sim-card-h"><div class="sim-who"><b>${esc(nombreCompleto(a))}</b></div><span class="sim-chip sim-bad">Repudia: no paga impuesto</span></div></div>`;
  return `<div class="sim-card"><div class="sim-card-h"><div class="sim-who"><b>Nombre: ${esc(nombreCompleto(a))}</b><span class="sim-note">${esc(a.parentesco)}${subs.length?" · "+subs.length+(a.cede==="Si"?" cesionario(s)":" heredero(s)"):""}</span></div>${(()=>{const tot=k.finalPesos+subs.reduce((t,s)=>t+s.k.finalPesos,0);return `<span class="sim-veredicto ${tot>0?"sim-paga":"sim-exenta"}">${tot>0?"Paga impuesto":"Exenta: no paga"}</span><b class="sim-num">Total impuesto (pesos): ${pesos(tot)}</b>`})()}</div>
  <div class="sim-tbl-wrap" style="border:none;border-radius:0"><table><tbody>${filas(k,S.tipo)}</tbody></table></div>
  ${subs.map(s=>`<div class="sim-card-h" style="border-top:1px solid var(--line)"><div class="sim-who"><b>${esc(s.s.nombre)}</b><span class="sim-note">${esc(rutFmt(s.s.rut))} · ${esc(s.s.parentesco)} · ${d2(s.pct,2)}%</span></div><b class="sim-num">${pesos(s.k.finalPesos)}</b></div><div class="sim-tbl-wrap" style="border:none;border-radius:0"><table><tbody>${filas(s.k,S.tipo)}</tbody></table></div>`).join("")}</div>`}).join("")}
 <div class="sim-total-bar"><span>Impuesto total de la declaración:</span><span class="sim-num">${pesos(R.totalImpuesto)}</span></div></div>`;
}

/* ---------- panel lateral ---------- */
function railHTML(R){
 const st=S._st||{};const items=[["declarante","Declarante"],["contacto","Contacto tributario"],["causante","Causante"],...(S.tipo==="Intestadas"?[["posesion","Posesión efectiva"]]:[["inventario","Inventario"],["testamento","Testamento"],["abogado","Abogado y tribunal"]]),["asignatarios","Asignatarios"],["bienes","Bienes"],["agregados","Agregados/deducciones"],["calculo","Cálculo"]];
 const fUTM=utmFor(fallecimiento());
 return `<div class="sim-box"><h3>Resumen</h3><div><div class="sim-note">Masa hereditaria</div><div class="sim-big" data-o="masa">${pesos(R.masa)}</div></div>
 <div class="sim-line"><span>Asignatarios</span><span class="sim-num">${S.asignatarios.length}</span></div>
 <div class="sim-line"><span>Impuesto total</span><b class="sim-num" data-o="imp">${pesos(R.totalImpuesto)}</b></div></div>
 <div class="sim-box"><h3>Avance</h3><nav class="sim-nav">${items.map(([k,l])=>{const s=st[k];return `<button type="button" data-sim="goto" data-k="${k}"><span>${l}</span><span class="sim-dot ${s==null?"":s.length?"sim-todo":"sim-ok"}" title="${s==null?"Opcional":s.length?"Pendiente: "+esc(s.join(", ")):"Completo"}"></span></button>`}).join("")}</nav></div>
 <div class="sim-box sim-params"><h3>Parámetros</h3>
 <div class="sim-f"><label for="p_utmD">UTM fecha de fallecimiento</label><input id="p_utmD" type="text" class="sim-money" inputmode="decimal" data-b="params.utmDevengo" value="${esc(S.params.utmDevengo)}" placeholder="${fUTM?d2(fUTM,0)+" (tabla)":fallecimiento()?"Ingresa el valor":"Según fecha"}"></div>
 <div class="sim-f"><label for="p_utmH">UTM del día</label><input id="p_utmH" type="text" class="sim-money" inputmode="decimal" data-b="params.utmHoy" value="${esc(S.params.utmHoy)}"></div>
 <div class="sim-f"><label for="p_uf">UF del día</label><input id="p_uf" type="text" class="sim-money" inputmode="decimal" data-b="params.ufHoy" value="${esc(S.params.ufHoy)}"></div>
 <p class="sim-note" style="margin:0">Valores del SII (UTM desde 2019). Si la fecha no está en la tabla, escribe el valor.</p></div>`;
}

/* ---------- actualización parcial (sin perder el foco) ---------- */
function soft(){
 const R=calcular();window.__R=R;
 document.querySelectorAll("[data-o]").forEach(el=>{const k=el.dataset.o;
  if(k==="masa")el.textContent=pesos(R.masa);else if(k==="imp")el.textContent=pesos(R.totalImpuesto);else if(k==="legRig")el.textContent=pesos(R.legitimaRig);else if(k==="mejoras")el.textContent=pesos(R.mejoras);else if(k==="libre")el.textContent=pesos(R.libre);else if(k==="legTot")el.textContent=pesos(R.legadosTotal);
  else if(k.startsWith("legprev:")){const e=S.entries["leg:"+k.slice(8)];el.textContent=pesos(e?previewLegado(e):0)}});
 const co=document.getElementById("sim-calc-out");if(co)co.innerHTML=calculoHTML(R);
}
function refreshEntry(key){
 const e=S.entries[key];if(!e)return;const def=defForKey(key);if(!def)return;
 const tmp=JSON.parse(JSON.stringify(e));
 if(key.startsWith("b:"))computeRow(def,tmp);else if(key.startsWith("d:"))computeDesc(def,tmp,asigById(key.split(":")[1]));
 for(const f of def.fields){if(f.t==="calc"||f.t==="utm"){const el=document.querySelector(`[data-e="${key}|${f.k}"]`);if(el&&el.hasAttribute("data-calc"))el.value=f.t==="utm"?d2(tmp[f.k],0):calcVal(f,tmp[f.k])}}
 if(def.base&&def.fields.some(f=>f.k==="valor"&&f.t==="calc")){const el=document.querySelector(`[data-e="${key}|valor"]`);if(el)el.value=miles(tmp.valor)}
 if(def.name==="menaje"){}
}
function defForKey(key){if(key.startsWith("b:"))return CATS[key.slice(2)];if(key.startsWith("d:"))return DESC[key.split(":")[2]];return null}
function asigById(id){return S.asignatarios.find(a=>a.id===id)}

/* ===== Modales ===== */
let modalEl=null,modalCtx=null;
function openModal({title,body,foot,size,ctx}){
 closeModal();modalCtx=ctx||null;
 modalEl=document.createElement("div");modalEl.className="sim-modal-bg";
 modalEl.innerHTML=`<div class="sim-modal ${size?"sim-"+size:""}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="sim-ph"><h2>${esc(title)}</h2><button type="button" class="sim-toggle" data-sim="closeModal" aria-label="Cerrar">×</button></div><div class="sim-pb" id="sim-modal-body">${body}</div>${foot?`<div class="sim-foot">${foot}</div>`:""}</div>`;
 document.body.appendChild(modalEl);
 const first=modalEl.querySelector("input:not([readonly]),select,button.sim-btn");if(first)first.focus();
}
function closeModal(){if(modalEl){modalEl.remove();modalEl=null;modalCtx=null}}
function alertModal(lista,titulo="Alerta",mensaje="Se han detectado problemas"){
 openModal({title:titulo,size:"sm",body:`<div class="sim-alert sim-bad">${esc(mensaje)}${lista&&lista.length?`<ol>${lista.map(i=>`<li>${esc(i)}</li>`).join("")}</ol>`:""}</div>`,foot:`<button class="sim-btn" data-sim="closeModal">Aceptar</button>`});
}
function infoModal(titulo,msg){openModal({title:titulo,size:"sm",body:`<div class="sim-alert sim-info">${msg}</div>`,foot:`<button class="sim-btn" data-sim="closeModal">Aceptar</button>`})}

/* ===== Asignatario ===== */
const ASIG_BLANK=()=>({id:uid(),rut:"",nombre:"",apellidoPaterno:"",apellidoMaterno:"",fechaFallecimiento:"",parentesco:"",libreDisposicion:"0",cuartaDeMejoras:"0",pais:"Chile",ciudad:"",region:"",comuna:"",calle:"",numero:"",depto:"",email:"",discapacidad:"",repudia:"No",cede:"No",porcentajeCede:"",fallecido:"No",subs:[],legados:[],desc:{}});
function asigModal(a,err){
 const nuevo=!S.asignatarios.some(x=>x.id===a.id);modalCtx={asig:a};
 const pars=S.tipo==="Testadas"?PAR_T:PAR_I;const m=(k,l,o={})=>{const id="m_"+k;const v=a[k]??"";const req=o.req?` <span class="sim-req">*</span>`:"";
  const ctl=o.sel?`<select id="${id}" data-m="${k}"${o.struct?" data-mstruct":""}>${opts(o.sel,v)}</select>`:`<input id="${id}" type="${o.type||"text"}" data-m="${k}" value="${esc(v)}"${o.ph?` placeholder="${esc(o.ph)}"`:""}${o.struct?" data-mstruct":""}${o.rut?" data-rut":""}>`;
  return `<div class="sim-f"><label for="${id}">${esc(l)}${req}</label>${o.btn?`<div class="sim-inline">${ctl}<button type="button" class="sim-btn sim-sm sim-ghost" data-sim="${o.btn[1]}">${o.btn[0]}</button></div>`:ctl}</div>`};
 const fall=a.fechaFallecimiento?(fallecimiento()&&a.fechaFallecimiento<fallecimiento()?"Antes":"Después"):"No";a.fallecido=fall;
 const body=`${err?`<div class="sim-alert sim-bad" style="margin-bottom:12px">${esc(err)}</div>`:""}
 <div class="sim-grid">${m("rut","Rut",{req:1,rut:1,ph:"12.345.678-9",btn:["Consultar Rut","consultarAsig"]})}${m("nombre","Nombre",{req:1})}${m("apellidoPaterno","Apellido Paterno",{req:1})}${m("apellidoMaterno","Apellido Materno")}${m("fechaFallecimiento","Fecha Fallecimiento (si corresponde)",{type:"date",struct:1})}${m("parentesco","Parentesco",{req:1,sel:pars,struct:1})}
 ${S.tipo==="Testadas"?m("libreDisposicion","Libre Disposición %",{ph:"%"})+(puedeMejoras(a.parentesco)?m("cuartaDeMejoras","Cuarta de Mejoras %",{ph:"%"}):""):""}</div>
 ${fall!=="No"?`<div class="sim-alert sim-warn" style="margin-top:10px">${fall==="Antes"?"Falleció antes que el causante: después de guardar, agrega a sus representantes en la tarjeta del asignatario.":"Falleció después que el causante: después de guardar, agrega a sus herederos (transmisión) en la tarjeta del asignatario."}</div>`:""}
 <div class="sim-sub">Domicilio</div>
 <div class="sim-grid">${m("pais","País",{req:1,sel:DATA_PAISES,struct:1})}${m("ciudad","Ciudad",{req:1})}${a.pais==="Chile"?m("region","Región",{req:1,sel:DATA_REGIONES.map(r=>r.region),struct:1})+m("comuna","Comuna",{req:1,sel:comunasDe(a.region)}):""}${m("calle","Calle",{req:1})}${m("numero","Número",{req:1})}${m("depto","Block/Depto")}${m("email","Email",{type:"email"})}</div>
 <div class="sim-sub">Opciones Avanzadas</div>
 <div class="sim-grid">${m("discapacidad","Registro nacional de Discapacidad",{ph:"N° de inscripción, si tiene"})}${m("repudia","Repudia Asignación",{sel:["Si","No"]})}${fall==="No"?m("cede","Cede Derecho Real de Herencia",{sel:["Si","No"],struct:1}):""}${a.cede==="Si"?m("porcentajeCede","Porcentaje %",{ph:"%"}):""}</div>
 <p class="sim-note" style="margin:12px 0 0">Los campos marcados con * son obligatorios.</p>`;
 openModal({title:nuevo?"Ingresar nuevo asignatario":"Editar asignatario",body,foot:`<button class="sim-btn sim-ghost" data-sim="closeModal">Cancelar</button><button class="sim-btn sim-ghost" data-sim="limpiarAsig">Limpiar</button><button class="sim-btn" data-sim="guardarAsig">Guardar</button>`,ctx:{asig:a}});
}
function guardarAsig(){
 const a=modalCtx.asig;const f=[];
 [["rut","Rut"],["nombre","Nombre"],["apellidoPaterno","Apellido Paterno"],["parentesco","Parentesco"],["pais","País"],["ciudad","Ciudad"],["calle","Calle"],["numero","Número"]].forEach(([k,l])=>{if(!String(a[k]||"").trim())f.push(l)});
 if(a.pais==="Chile"){if(!a.region)f.push("Región");if(!a.comuna)f.push("Comuna")}
 if(f.length)return asigModal(a,`El rut ${a.rut||""} tiene campos obligatorios sin agregar: ${f.join(", ")}`);
 if(!rutValid(a.rut))return asigModal(a,"Rut inválido");
 const otros=S.asignatarios.filter(x=>x.id!==a.id);
 if(otros.some(x=>rutClean(x.rut)===rutClean(a.rut))||rutClean(S.causante.rut)===rutClean(a.rut))return asigModal(a,`El rut ${a.rut} ya se encuentra agregado`);
 if(!S.causante.rut&&!S.causante.fechaFallecimiento)return asigModal(a,"Debe ingresar primero un Causante.");
 if(a.parentesco==="Cónyuge o Conviviente Civil"&&!["Casado","Conviviente civil"].includes(S.causante.estadoCivil))return asigModal(a,`Se ha declarado estado civil del Causante = ${S.causante.estadoCivil||"sin informar"}`);
 if(a.parentesco==="Cónyuge o Conviviente Civil"&&otros.some(x=>x.parentesco==="Cónyuge o Conviviente Civil"))return asigModal(a,"Ya se ha declarado Cónyuge o Conviviente Civil");
 if(S.tipo==="Testadas"){const e=[];const mej=otros.reduce((t,x)=>t+dec(x.cuartaDeMejoras),0),lib=otros.reduce((t,x)=>t+dec(x.libreDisposicion),0);if(!puedeMejoras(a.parentesco))a.cuartaDeMejoras="0";
  if(dec(a.cuartaDeMejoras)+mej>100)e.push(`Cuarta de mejora disponible: ${100-mej}%`);if(dec(a.libreDisposicion)+lib>100)e.push(`Cuarta de libre disposición disponible: ${100-lib}%`);if(e.length)return asigModal(a,e.join(" / "))}
 if(a.cede==="Si"&&!(dec(a.porcentajeCede)>0&&dec(a.porcentajeCede)<=100))return asigModal(a,"Indica el porcentaje cedido (entre 1 y 100).");
 a.rut=rutFmt(a.rut);
 const i=S.asignatarios.findIndex(x=>x.id===a.id);if(i>=0)S.asignatarios[i]=a;else S.asignatarios.push(a);
 closeModal();render();toast(i>=0?"Asignatario actualizado":"Asignatario agregado");
}

/* ===== Opciones avanzadas (calidad de la propiedad) ===== */
function calidadModal(key,catName,err){
 const e=S.entries[key];const draft=modalCtx?.calKey===key?modalCtx.cal:JSON.parse(JSON.stringify(e.cal||CAL_DEFAULT()));
 const c=CATS[catName];const g=draft.tipoGravamen;const fid=draft.calidad==="Fideicomiso"||draft.calidad==="Fideicomiso de nuda propiedad";
 const sinGrav=draft.calidad==="Plena propiedad"||draft.calidad==="Fideicomiso";
 const base=int(computeRow(c,JSON.parse(JSON.stringify(e)))._base);
 const body=`${err?`<div class="sim-alert sim-bad" style="margin-bottom:12px">${esc(err)}</div>`:""}
 <p class="sim-note" style="margin:0 0 12px">Indica si el causante era dueño pleno, nudo propietario o fiduciario del bien, y qué porcentaje le pertenecía. El valor se ajusta según los arts. 6° y 7° de la Ley 16.271.</p>
 <div class="sim-grid">
 <div class="sim-f"><label for="c_cal">Tipo de Propiedad</label><select id="c_cal" data-c="calidad" data-cstruct>${opts(CALIDADES_HER,draft.calidad)}</select></div>
 <div class="sim-f"><label for="c_gra">Tipo Gravamen</label><select id="c_gra" data-c="tipoGravamen" data-cstruct${sinGrav?" disabled":""}>${opts(GRAVAMENES,g)}</select></div>
 <div class="sim-f"><label for="c_pct">Porcentaje</label><input id="c_pct" type="text" data-c="porcentaje" value="${esc(draft.porcentaje)}" inputmode="decimal"${c.name==="dinero"?" disabled":""}></div>
 ${c.bbrr?`<div class="sim-f"><label for="c_exe">Exenciones</label><select id="c_exe" data-c="exencion"${c.agricola?" disabled":""}>${EXENCIONES.map(x=>`<option${x===draft.exencion?" selected":""}>${x}</option>`).join("")}</select></div>`:""}
 <div class="sim-f"><label for="c_an">Cantidad de años</label><input id="c_an" type="text" data-c="cantAnios" value="${esc(draft.cantAnios)}" inputmode="numeric"${!sinGrav&&(g==="Tiempo determinado"||g==="Condición o a plazo que signifique condición")?"":" disabled"}></div>
 <div class="sim-f"><label for="c_nac">Fecha de nacimiento beneficiario</label><input id="c_nac" type="date" data-c="nacimiento" value="${esc(draft.nacimiento)}"${!sinGrav&&g==="Vitalicio"?"":" disabled"}></div>
 <div class="sim-f"><label for="c_con">Condición</label><input id="c_con" type="text" data-c="condiciones" value="${esc(draft.condiciones)}"${!sinGrav&&g==="Condición o a plazo que signifique condición"?"":" disabled"}></div>
 </div>
 ${fid?`<div class="sim-sub">Fideicomisarios</div><div class="sim-tbl-wrap"><table><thead><tr><th>Index</th><th>Rut fideicomisario</th><th>Condición especial</th><th class="sim-r">Porcentaje del Beneficio</th><th></th></tr></thead><tbody>
 ${draft.fideicomisarios.map((x,i)=>`<tr><td>${i+1}</td><td class="sim-num">${esc(rutFmt(x.rut))}</td><td>${esc(x.cond||"—")}</td><td class="sim-r sim-num">${esc(x.pct)}</td><td><button class="sim-icon-btn sim-del" data-sim="delFid" data-i="${i}">Eliminar</button></td></tr>`).join("")}
 <tr class="sim-entry"><td></td><td><input type="text" id="fid_rut" placeholder="Rut" data-rut aria-label="Rut fideicomisario"></td><td><select id="fid_cond" aria-label="Condición especial">${COND_ESP.map(x=>`<option>${x}</option>`).join("")}</select></td><td><input type="text" id="fid_pct" placeholder="%" inputmode="decimal" aria-label="Porcentaje del beneficio"></td><td><button class="sim-btn sim-sm" data-sim="addFid">Aceptar</button></td></tr></tbody></table></div>`:""}
 <div class="sim-total-bar"><span>Valor resultante:</span><span class="sim-num">${pesos(valorCalidad(base,draft))}</span><span class="sim-note">(base ${pesos(base)})</span></div>`;
 openModal({title:"Opciones avanzadas",body,foot:`<button class="sim-btn sim-ghost" data-sim="closeModal">Cancelar</button><button class="sim-btn" data-sim="aceptarCal">Aceptar</button>`,ctx:{calKey:key,catName,cal:draft}});
}

/* ===== Búsquedas simuladas (rol / tasación) ===== */
function buscarRolModal(key,catName){
 const e=S.entries[key];const comunas=[...new Set(DATA_REGIONES.flatMap(r=>r.comunas))].sort();const men=catName==="menaje";
 openModal({title:"Consultar Propiedad",ctx:{key,catName},body:`<div class="sim-alert sim-info" style="margin-bottom:12px">En el formulario real, este botón consulta el catastro de bienes raíces del SII y trae el avalúo fiscal. En el simulador escribes los datos que aparecerían en el certificado de avalúo.</div>
 <div class="sim-grid"><div class="sim-f"><label for="r_com">Comuna</label><select id="r_com">${opts(comunas,e.comuna)}</select></div><div class="sim-f"><label for="r_rol">Rol</label><input id="r_rol" type="text" value="${esc(e.rol||"")}" placeholder="1234-56"></div>
 <div class="sim-f"><label for="r_dir">Dirección</label><input id="r_dir" type="text" value="${esc(e.direccion||"")}"></div><div class="sim-f"><label for="r_des">Destino</label><select id="r_des">${opts(["Habitacional","Comercio","Oficina","Agrícola","Industria","Bodega y almacenaje","Estacionamiento","Sitio eriazo","Otros"],e.destino)}</select></div>
 <div class="sim-f"><label for="r_val">Valor Total (avalúo fiscal)</label><input id="r_val" type="text" class="sim-money" inputmode="numeric" data-money value="${e.avaluo?miles(e.avaluo):""}"></div></div>
 ${men?`<p class="sim-note" style="margin:12px 0 0">Se aplicará la presunción: menaje = 20% del avalúo del inmueble.</p>`:""}`,foot:`<button class="sim-btn sim-ghost" data-sim="closeModal">Salir</button><button class="sim-btn" data-sim="aceptarRol">Agregar</button>`});
}
function aceptarRol(){
 const {key,catName}=modalCtx;const e=S.entries[key];const rol=document.getElementById("r_rol").value.trim(),com=document.getElementById("r_com").value,val=int(document.getElementById("r_val").value);
 if(!rol||!com||!val){alertModal(["Comuna","Rol","Valor Total"].filter((x,i)=>![com,rol,val][i]),"Alerta","Campos obligatorios");return}
 Object.assign(e,{rol,comuna:com,avaluo:val,direccion:document.getElementById("r_dir").value,destino:document.getElementById("r_des").value});
 if(catName==="menaje"){e.valorPrevio=String(Math.round(.2*val));e.descripcion=e.descripcion||"Presunción 20% avalúo rol "+rol}else if(!adquiridoReciente(e))e.valorLegal=String(val);
 closeModal();render();
}
function buscarCodModal(key){
 const e=S.entries[key];
 openModal({title:"Tasación de vehículos",ctx:{key},body:`<div class="sim-alert sim-info" style="margin-bottom:12px">En el formulario real se consulta la tasación fiscal del SII con el código y año. En el simulador ingresas los datos de la tabla de tasación.</div>
 <div class="sim-grid"><div class="sim-f"><label for="v_cod">Código SII</label><input id="v_cod" type="text" value="${esc(e.cod||"")}"></div><div class="sim-f"><label for="v_an">Año Fabricación</label><input id="v_an" type="text" inputmode="numeric" value="${esc(e.anio||"")}"></div><div class="sim-f"><label for="v_ma">Marca</label><input id="v_ma" type="text" value="${esc(e.marca||"")}"></div><div class="sim-f"><label for="v_mo">Modelo</label><input id="v_mo" type="text" value="${esc(e.modelo||"")}"></div><div class="sim-f"><label for="v_ta">Monto tasación</label><input id="v_ta" type="text" class="sim-money" inputmode="numeric" data-money value="${e.tasacion?miles(e.tasacion):""}"></div></div>`,
 foot:`<button class="sim-btn sim-ghost" data-sim="closeModal">Salir</button><button class="sim-btn" data-sim="aceptarCod">Agregar</button>`});
}

/* ===== Agregar filas ===== */
function requeridos(def,e){
 const out=[];
 if(def.name==="menaje"){if(e.rol){if(!int(e.valorPrevio))out.push("Valor")}else{if(!e.descripcion)out.push("Detalle menaje");if(!int(e.valorPrevio))out.push("Valor")}return out}
 if(def.name==="bienesAdherencia"&&e.noTiene){if(!e.rolSel)out.push("Rol");return out}
 for(const f of def.fields){if(f.t==="calc"||f.t==="check"||f.opt)continue;if(f.when&&!f.when(e))continue;if(f.t==="utm"&&utmFor(e[f.dateFrom]))continue;if(f.k==="valor"&&def.base)continue;const v=e[f.k];if(v==null||String(v).trim()==="")out.push(f.l)}
 return out;
}
function capLegados(nuevo){const R=calcular();const C=counts();const cap=C.hijos+C.conyuge+C.asc>0?R.libreCompleta:R.masa;return R.legadosTotal+nuevo>cap}
function addRow(key){
 const def=defForKey(key);const e=S.entries[key];const parts=key.split(":");const a=key.startsWith("d:")?asigById(parts[1]):null;
 const falt=requeridos(def,e);if(falt.length)return alertModal(null,"Alerta","Campos obligatorios: "+falt.join(", "));
 if(def.bbrr){if(!fallecimiento())return alertModal(null,"Alerta","Antes de continuar, debe agregar datos para causante");
  if([...allRows("brna"),...allRows("bra")].some(r=>r.rol===e.rol))return alertModal(null,"Alerta",`El rol: ${e.rol} ya ha sido agregado.`);
  if(adquiridoReciente(e)&&e.avaluo&&.2*int(e.avaluo)>int(e.valorLegal))return alertModal(["Corrija valor ingresado: Valor legal / Avalúo fiscal"])}
 for(const f of def.fields){if(f.t==="rut"&&e[f.k]&&!rutValid(e[f.k]))return alertModal(null,"Alerta",`${f.l}: rut inválido`)}
 if(a){
  if(def.soloHijos&&a.parentesco!=="Hijo")return alertModal(null,"Alerta","Sólo hijos pueden declarar descuento por causante cónyuge de ascendiente común");
  if(def.name==="dpaT"&&e.tipo==="Fideicomiso en herencia"&&int(e.valor)>(a.calc?.libre||0))return alertModal(null,"Alerta",`El fideicomiso en herencia no puede superar la cuarta libre del asignatario (${pesos(a.calc?.libre||0)}).`);
  if(["dinerolibre","pension","asignacionCondicional"].includes(def.name)){const tmp=computeDesc(def,JSON.parse(JSON.stringify(e)),a);const v=def.name==="asignacionCondicional"?int(tmp.valorAsig):int(tmp.valor);if(capLegados(v))return alertModal(null,"Alerta","Ha excedido el maximo disponible para legar")}
 }
 const row=JSON.parse(JSON.stringify(e));row.id=uid();
 if(key.startsWith("b:")){computeRow(def,row);(S.bienes[def.name]=S.bienes[def.name]||[]).push(row)}
 else{computeDesc(def,row,a);a.desc[def.name].push(row)}
 S.entries[key]={cal:CAL_DEFAULT()};render();toast("Registro agregado");
}
function rowsFor(key){if(key.startsWith("b:"))return S.bienes[key.slice(2)]=S.bienes[key.slice(2)]||[];const [,aid,n]=key.split(":");return asigById(aid).desc[n]}
function addLegado(aid){
 const a=asigById(aid);const e=S.entries["leg:"+aid];
 if(!e.ref)return alertModal(null,"Alerta","Selecciona el bien que se lega.");
 const pct=dec(e.porcentaje);if(!(pct>0&&pct<=100))return alertModal(null,"Alerta","porcentaje mal ingresado");
 if(!["Plena propiedad","Fideicomiso"].includes(e.calidad)){if(!e.tipoGravamen)return alertModal(null,"Alerta","Campos obligatorios: Tipo gravamen");if(e.tipoGravamen==="Vitalicio"&&!e.nacimiento)return alertModal(null,"Alerta","Campos obligatorios: Fecha de nacimiento beneficiario");if(e.tipoGravamen!=="Vitalicio"&&!e.cantAnios)return alertModal(null,"Alerta","Campos obligatorios: Cantidad de años")}
 const [cat,id]=e.ref.split("|");
 const usado=S.asignatarios.flatMap(x=>x.legados||[]).filter(l=>l.cat===cat&&l.id===id).reduce((t,l)=>t+dec(l.porcentaje),0);
 if(usado+pct>100)return alertModal(null,"Alerta",`Ha excedido el porcentaje maximo a legar para este bien, disponible: ${100-usado}%`);
 if(capLegados(previewLegado(e)))return alertModal(null,"Alerta","Ha excedido el maximo disponible para legar");
 a.legados.push({lid:uid(),cat,id,porcentaje:String(pct),calidad:e.calidad,tipoGravamen:e.tipoGravamen,cantAnios:e.cantAnios,nacimiento:e.nacimiento});
 S.entries["leg:"+aid]=null;delete S.entries["leg:"+aid];render();toast("Legado agregado");
}

/* ===== Envío ===== */
function validarEnvio(){
 const L=[];const R=calcular();
 const d=vDeclarante();if(d.length)L.push("Campos declarante no deben estar vacios: "+d.join(", "));
 const c=vCausante();if(c.length)L.push("Todos los datos son obligatorios para el CAUSANTE, verifique campos antes de enviar: "+c.join(", "));
 if(S.tipo==="Intestadas"){const p=vPosesion();if(p.length)L.push("Datos de posesión efectiva incompletos: "+p.join(", "))}
 else{const i=vInventario(),t=vTestamento(),b=vAbogado();if(i.length)L.push("Datos del inventario incompletos: "+i.join(", "));if(t.length)L.push("Datos del testamento incompletos: "+t.join(", "));if(b.length)L.push("Datos de abogado y tribunal incompletos: "+b.join(", "))}
 if(!S.asignatarios.length)L.push("Declaración no puede ser enviada/guardada sin asignatarios");
 else{if(S.asignatarios.some(a=>!a.parentesco))L.push("Debe informar parentesco en todos los asignatarios");vAsignatarios().filter(x=>/^(Cesionarios|Representantes|Herederos)/.test(x)).forEach(x=>L.push("Falta agregar: "+x))}
 const nb=[...PRINCIPALES,...catsVisibles()].reduce((t,k)=>t+allRows(k).length,0);if(!nb)L.push("Campos bienes no deben estar vacios");
 const sinAdh=allRows("bra").filter(b=>!allRows("bienesAdherencia").some(x=>x.rolSel===b.rol)).map(b=>b.rol);if(sinAdh.length)L.push("Existen bienes raíces agricolas sin declarar en la seccion de bienes por adherencia. ROLES: "+sinAdh.join(", "));
 if(R.masa<0)L.push("La masa hereditaria es negativa: revisa los pasivos declarados.");
 return L;
}
function giros(R){
 const g=[];const dev=fdate(fallecimiento());
 const add=(rut,nombre,k)=>{if(!(k.finalPesos>0))return;const pb=k.prebase||1;const fMain=k.prebaseEx/pb;const fCond=k.cond>0?k.cond/pb:0;const fFid=k.fidei>0?k.fidei/pb:0;
  g.push({rut,nombre,tipo:"001",devengo:dev,valor:Math.round(fMain*k.finalPesos)});
  if(fCond)g.push({rut,nombre,tipo:"002",devengo:dev,valor:Math.round(fCond*k.finalPesos)});
  if(fFid)g.push({rut,nombre,tipo:"003",devengo:dev,valor:Math.round(fFid*k.finalPesos)})};
 for(const x of R.asig){if(x.a.repudia!=="No")continue;add(rutFmt(x.a.rut),nombreCompleto(x.a),x.k);x.subs.forEach(s=>add(rutFmt(s.s.rut),s.s.nombre,s.k))}
 return g;
}
function preEnvioModal(step){
 const R=calcular();const G=giros(R);const total=G.reduce((t,x)=>t+x.valor,0);const anual=modalCtx?.anual||false;const cuota=Math.round(total/(anual?3:1));
 const puedeAnual=R.aniosDevengo<2.1;
 let body;
 if(step==="confirm")body=`<div class="sim-alert sim-warn">Usted ha seleccionado 3 anualidades con un valor cuota de: <b class="sim-num">${pesos(cuota)}</b>. ¿Desea continuar?</div>`;
 else if(R.prescrita)body=`<div class="sim-alert sim-warn">Declaracion prescrita, no se generaran giros, puede obtener certificados de inmediato.</div>`;
 else if(!G.length)body=`<p>No se generará giro: ningún asignatario tiene impuesto a pagar.</p>`;
 else body=`<p style="margin-top:0">Se generarán los siguientes giros para cada asignatario, puede generar entre 1 y 3 anualidades.</p>
 <div class="sim-tbl-wrap"><table><thead><tr><th>Rut</th><th>Nombre</th><th>Tipo</th><th>Devengo</th><th class="sim-r">Impuesto Pesos</th></tr></thead><tbody>${G.map(x=>`<tr><td class="sim-num">${esc(x.rut)}</td><td>${esc(x.nombre)}</td><td>${x.tipo}</td><td class="sim-num">${x.devengo}</td><td class="sim-r sim-num">${pesos(x.valor)}</td></tr>`).join("")}</tbody></table></div>
 ${puedeAnual?`<div style="margin-top:12px;display:grid;gap:6px"><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="chkAnual" data-sim="anual"${anual?" checked":""}> Pagar en 3 anualidades</label>${anual?`<div class="sim-line"><span>Total Impuesto a pagar</span><b class="sim-num">${pesos(total)}</b></div><div class="sim-line"><span>Valor Cuota</span><b class="sim-num">${pesos(cuota)}</b></div>`:""}</div>`:`<p class="sim-note">Han pasado más de 2 años desde el fallecimiento: no es posible pagar en anualidades.</p>`}
 <label style="display:flex;gap:8px;align-items:center;margin-top:10px" class="sim-note"><input type="checkbox" checked disabled> Generar todos los giros a nombre de cada asignatario</label>
 <div class="sim-alert sim-info" style="margin-top:12px">Prefiera el pago en línea. El pago en papel puede verse afectado por demoras del banco y el envío al SII, y puede tardar el doble en generar su certificado. Si aún así necesita pagar en papel, prefiera hacerlo directamente en Tesorería.</div>`;
 openModal({title:"Enviar declaración",body,ctx:{anual,giros:G,total},foot:step==="confirm"?`<button class="sim-btn sim-ghost" data-sim="preEnvio">No</button><button class="sim-btn" data-sim="finalizar">Sí, continuar</button>`:`<button class="sim-btn sim-ghost" data-sim="closeModal">Cancelar</button><button class="sim-btn" data-sim="${anual&&G.length?"confirmAnual":"finalizar"}">Continuar</button>`});
}
function finalizar(){
 const R=calcular();const ctx=modalCtx||{};const G=ctx.giros||giros(R);const folio="SIM-"+String(Date.now()).slice(-8);
 S.enviado={folio,fecha:new Date().toLocaleString("es-CL"),total:ctx.total||0,anual:ctx.anual};
 openModal({title:"Atención",body:`<div class="sim-receipt"><span class="sim-wm">SIMULACIÓN · SIN VALIDEZ TRIBUTARIA</span>
 <h3 style="font-size:18px">Declaración de práctica recibida</h3>
 <div class="sim-line"><span>Folio de práctica</span><b class="sim-num">${folio}</b></div><div class="sim-line"><span>Fecha</span><span>${esc(S.enviado.fecha)}</span></div>
 <div class="sim-line"><span>Formulario</span><span>Herencia ${esc(S.tipo)}</span></div><div class="sim-line"><span>Causante</span><span>${esc(nombreCompleto(S.causante))} · <span class="sim-num">${esc(rutFmt(S.causante.rut))}</span></span></div>
 <div class="sim-line"><span>Masa hereditaria</span><b class="sim-num">${pesos(R.masa)}</b></div><div class="sim-line"><span>Impuesto total</span><b class="sim-num">${pesos(R.prescrita?0:G.reduce((t,x)=>t+x.valor,0))}</b></div>
 ${ctx.anual?`<div class="sim-line"><span>Forma de pago</span><span>3 anualidades</span></div>`:""}
 <p class="sim-note" style="margin:6px 0 0">En el trámite real, al enviar se generan los giros en el SII. Cada asignatario los paga en línea o en Tesorería y luego obtiene el certificado de pago o exención del impuesto, que se presenta para inscribir los bienes a nombre de los herederos.</p></div>`,
 foot:`<button class="sim-btn sim-ghost" data-sim="closeModal">Seguir editando</button><button class="sim-btn" data-sim="nuevo">Nueva simulación</button>`});
}

/* ===== Casos de ejemplo (datos ficticios) ===== */
function rutEj(n){return rutFmt(String(n)+rutDV(String(n)))}
function ejemplo(tipo){
 S=blankState(tipo);
 Object.assign(S.declarante,{nombre:"Camila Andrea",rut:rutEj(17654321),apellidoPaterno:"Rojas",apellidoMaterno:"Fuentes",pais:"Chile",ciudad:"Santiago",region:"Metropolitana de Santiago",comuna:"ÑUÑOA",calle:"Avenida Los Aromos",numero:"1450",depto:"Depto 32",telefono:"+56 9 5555 0101",correo:"camila.rojas@ejemplo.cl",correo2:"camila.rojas@ejemplo.cl"});
 const dom={pais:"Chile",ciudad:"Santiago",region:"Metropolitana de Santiago",comuna:"ÑUÑOA",calle:"Avenida Los Aromos",numero:"1450"};
 const A=(o)=>Object.assign(ASIG_BLANK(),dom,o);
 if(tipo==="Intestadas"){
  Object.assign(S.causante,{rut:rutEj(6543210),nombre:"Héctor Manuel",apellidoPaterno:"Rojas",apellidoMaterno:"Pinto",fechaFallecimiento:"2026-03-15",estadoCivil:"Casado",regimen:"Separación total de bienes"});
  Object.assign(S.posesion,{numeroInscripcion:"18452/2026",oficina:"Ñuñoa",fechaRes:"2026-06-10",folio:"500123456"});
  S.asignatarios=[A({rut:rutEj(7123456),nombre:"Marta Inés",apellidoPaterno:"Fuentes",apellidoMaterno:"Soto",parentesco:"Cónyuge o Conviviente Civil",email:"marta.fuentes@ejemplo.cl"}),
   A({rut:rutEj(17654321),nombre:"Camila Andrea",apellidoPaterno:"Rojas",apellidoMaterno:"Fuentes",parentesco:"Hijo",email:"camila.rojas@ejemplo.cl",depto:"Depto 32"}),
   A({rut:rutEj(19876543),nombre:"Diego Ignacio",apellidoPaterno:"Rojas",apellidoMaterno:"Fuentes",parentesco:"Hijo",comuna:"PROVIDENCIA",calle:"Calle Las Encinas",numero:"220"})];
  S.asignatarios[2].desc={plena:[{id:uid(),descripcion:"Donación para pie de departamento",fecha:"2024-08-10",utmFecha:"",monto:"10000000",impuesto:"0"}]};
  S.bienes={brna:[{id:uid(),rol:"1234-56",comuna:"ÑUÑOA",avaluo:120000000,fechaAdq:"2001-05-20",valorLegal:"120000000",direccion:"Avenida Los Aromos 1450",destino:"Habitacional",cal:CAL_DEFAULT()}],
   dinero:[{id:uid(),inst:"BANCO DEL ESTADO DE CHILE",monto:"45000000",cal:CAL_DEFAULT()}],
   vehiculos:[{id:uid(),cod:"EJ-2019-0042",anio:"2019",marca:"Marca Ejemplo",modelo:"Sedán 1.6",patente:"ZZXX10",tasacion:"8500000",cal:CAL_DEFAULT()}],
   menaje:[{id:uid(),rol:"1234-56",comuna:"ÑUÑOA",avaluo:120000000,descripcion:"Presunción 20% avalúo rol 1234-56",valorPrevio:"24000000",cal:CAL_DEFAULT()}],
   rebajasLegales:[{id:uid(),descripcion:"Gastos de funeral",valor:"2500000"}],
   pasivosHeredables:[{id:uid(),descripcion:"Saldo crédito de consumo",rutAcreedor:rutEj(76543210),fechaContrato:"2023-02-01",valor:"3000000"}]};
 } else {
  Object.assign(S.causante,{rut:rutEj(5432109),nombre:"Luis Alberto",apellidoPaterno:"Gómez",apellidoMaterno:"Vera",fechaFallecimiento:"2025-11-20",estadoCivil:"Viudo"});
  Object.assign(S.declarante,{nombre:"Ana María",rut:rutEj(15987654),apellidoPaterno:"Gómez",apellidoMaterno:"Lara",correo:"ana.gomez@ejemplo.cl",correo2:"ana.gomez@ejemplo.cl"});
  Object.assign(S.inventario,{fechaProtocolizacion:"2026-02-12",notaria:DATA_NOTARIAS.find(n=>/SANTIAGO/.test(n))||DATA_NOTARIAS[0],fechaPublicacion:"2026-02-20"});
  Object.assign(S.testamento,{notaria:DATA_NOTARIAS.find(n=>/PROVIDENCIA/.test(n))||DATA_NOTARIAS[1],fecha:"2019-04-03",inscripcion:"RNT-2019-004512",pais:"Chile"});
  Object.assign(S.abogado,{rut:rutEj(12345678),nombre:"Rodrigo",apellidoPaterno:"Castro",apellidoMaterno:"Ibáñez",telefono:"+56 2 2555 0199",correo:"rcastro@estudio-ejemplo.cl"});
  Object.assign(S.tribunal,{juzgado:"5° Juzgado Civil de Santiago",rol:"V-1452-2025",fechaAuto:"2026-01-30"});
  S.asignatarios=[A({rut:rutEj(15987654),nombre:"Ana María",apellidoPaterno:"Gómez",apellidoMaterno:"Lara",parentesco:"Hijo",cuartaDeMejoras:"100",email:"ana.gomez@ejemplo.cl"}),
   A({rut:rutEj(16234567),nombre:"Pablo Andrés",apellidoPaterno:"Gómez",apellidoMaterno:"Lara",parentesco:"Hijo"}),
   A({rut:rutEj(20123456),nombre:"Tomás Felipe",apellidoPaterno:"Gómez",apellidoMaterno:"Ruiz",parentesco:"Colateral 3° grado",libreDisposicion:"100"})];
  const veh={id:uid(),cod:"EJ-2021-0107",anio:"2021",marca:"Marca Ejemplo",modelo:"SUV 2.0",patente:"YYWW22",tasacion:"12000000",cal:CAL_DEFAULT()};
  S.bienes={brna:[{id:uid(),rol:"845-12",comuna:"MACUL",avaluo:180000000,fechaAdq:"1998-09-14",valorLegal:"180000000",destino:"Habitacional",cal:CAL_DEFAULT()}],
   dinero:[{id:uid(),inst:"BANCO SANTANDER-CHILE",monto:"60000000",cal:CAL_DEFAULT()}],vehiculos:[veh],
   accionesCon:[{id:uid(),tipo:"Sociedad anónima abierta",razon:"Sociedad Ejemplo S.A.",rut:rutEj(96500100),nAcc:"10000",precio:"1500",cal:CAL_DEFAULT()}],
   pasivosHeredables:[{id:uid(),descripcion:"Crédito hipotecario saldo",rutAcreedor:rutEj(76543210),fechaContrato:"2015-03-10",valor:"5000000"}]};
  S.asignatarios[2].legados=[{lid:uid(),cat:"vehiculos",id:veh.id,porcentaje:"100",calidad:"Plena propiedad",tipoGravamen:"",cantAnios:"",nacimiento:""}];
  S.ui.otros=true;
 }
 S.ui.acc["a"+S.asignatarios[0].id]=true;
 render();subir();toast("Caso de ejemplo cargado: datos ficticios");
}

/* ===== Eventos ===== */
function inScope(el){return !!el&&(app.contains(el)||(!!modalEl&&modalEl.contains(el)))}
function subir(){const s=document.getElementById("simulador")||app;s.scrollIntoView({block:"start"})}
document.addEventListener("click",ev=>{
 const t=ev.target.closest("[data-sim]");if(!t||!inScope(t))return;const act=t.dataset.sim;const k=t.dataset.k;
 if(t.tagName==="A")ev.preventDefault();
 switch(act){
  case "start": S=blankState(t.dataset.t);render();subir();if(S.tipo==="Intestadas")infoModal("Información","Recuerde: al ingresar la declaración debe incluir a todos los familiares con derecho a herencia, así como la totalidad de bienes, incluyendo el menaje. Esto evitará futuras rectificaciones que podrían generar demoras administrativas.");break;
  case "example": ejemplo(t.dataset.t);break;
  case "resume": S=store.get();if(S){S.ui=S.ui||blankState(S.tipo).ui;render()}break;
  case "discard": store.del();renderStart();break;
  case "reset": S=null;closeModal();render();subir();break;
  case "nuevo": S=null;closeModal();render();subir();break;
  case "save": {const ok=store.set(S);toast(ok?"Borrador guardado en este navegador. Si el computador es compartido, bórralo al terminar desde la pantalla inicial del simulador.":"No se pudo guardar: el navegador bloquea el almacenamiento");break}
  case "send": {const L=validarEnvio();if(L.length)alertModal(L);else{modalCtx=null;preEnvioModal()}break}
  case "preEnvio": preEnvioModal();break;
  case "anual": {const v=t.checked;modalCtx.anual=v;preEnvioModal();break}
  case "confirmAnual": preEnvioModal("confirm");break;
  case "finalizar": finalizar();break;
  case "toggle": S.ui.open[k]=S.ui.open[k]===false;render();break;
  case "help": S.ui.help=S.ui.help===k?null:k;render();break;
  case "goto": {S.ui.open[k]=true;render();const el=document.getElementById("simsec-"+k);if(el)el.scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});break}
  case "acc": S.ui.acc[k]=!S.ui.acc[k];render();break;
  case "otros": S.ui.otros=!S.ui.otros;render();break;
  case "contacto": S.contacto.activo=!S.contacto.activo;if(!S.contacto.activo)S.contacto={activo:false,nombre:"",rut:"",telefono:"",email:""};render();break;
  case "consultarCausante": case "consultarAbogado": {const o=act==="consultarCausante"?S.causante:S.abogado;if(!o.rut)return alertModal(null,"Alerta","Ingresa un RUT para consultar.");if(!rutValid(o.rut))return alertModal(null,"Alerta","Rut inválido");o.rut=rutFmt(o.rut);render();infoModal("Consultar Rut",act==="consultarCausante"?"RUT válido. En el formulario real se cargan automáticamente el nombre y la fecha de defunción desde el Registro Civil. En el simulador, completa esos datos tú.":"RUT válido. En el formulario real se cargan los datos del abogado habilitado. En el simulador, complétalos tú.");break}
  case "addAsig": if(!S.causante.rut&&!S.causante.fechaFallecimiento){alertModal(null,"Alerta","Debe ingresar primero un Causante.");break}asigModal(ASIG_BLANK());break;
  case "editAsig": asigModal(JSON.parse(JSON.stringify(asigById(t.dataset.id))));break;
  case "togAsig": S.ui.acc["a"+t.dataset.id]=!S.ui.acc["a"+t.dataset.id];render();break;
  case "togAg": S.ui.acc["ag:"+t.dataset.id]=S.ui.acc["ag:"+t.dataset.id]===false;render();break;
  case "delAsig": {const a=asigById(t.dataset.id);openModal({title:"Eliminar asignatario",size:"sm",ctx:{del:a.id},body:`<p style="margin:0">¿Eliminar a <b>${esc(nombreCompleto(a))}</b>? Se borrarán también sus legados, donaciones y descuentos.</p>`,foot:`<button class="sim-btn sim-ghost" data-sim="closeModal">Cancelar</button><button class="sim-btn sim-warn" data-sim="delAsigOk">Eliminar</button>`});break}
  case "delAsigOk": S.asignatarios=S.asignatarios.filter(a=>a.id!==modalCtx.del);closeModal();render();break;
  case "consultarAsig": {const a=modalCtx.asig;syncModal();if(!rutValid(a.rut))return asigModal(a,"Rut inválido");a.rut=rutFmt(a.rut);asigModal(a);toast("RUT válido. Completa los datos personales.");break}
  case "limpiarAsig": {const id=modalCtx.asig.id;asigModal(Object.assign(ASIG_BLANK(),{id}));break}
  case "guardarAsig": syncModal();guardarAsig();break;
  case "addSub": {const a=asigById(t.dataset.id);const e=S.entries["sub:"+a.id];const igual=a.fallecido==="Antes"&&a.cede!=="Si";const f=[];if(!e.rut)f.push("Rut");if(!e.nombre)f.push("Nombre");if(!e.parentesco)f.push("Parentesco");if(!igual&&!dec(e.porcentaje))f.push("Porcentaje");if(f.length)return alertModal(null,"Alerta","Campos obligatorios: "+f.join(", "));if(!rutValid(e.rut))return alertModal(null,"Alerta","Rut inválido");
   const tot=a.subs.reduce((s,x)=>s+dec(x.porcentaje),0)+dec(e.porcentaje);const max=a.cede==="Si"?dec(a.porcentajeCede):100;if(!igual&&tot>max)return alertModal(null,"Alerta",`El porcentaje total no puede superar ${max}%`);
   a.subs.push({id:uid(),rut:rutFmt(e.rut),nombre:e.nombre,parentesco:e.parentesco,porcentaje:e.porcentaje});delete S.entries["sub:"+a.id];render();break}
  case "delSub": {const a=asigById(t.dataset.id);a.subs=a.subs.filter(s=>s.id!==t.dataset.sid);render();break}
  case "addRow": addRow(t.dataset.key);break;
  case "delRow": {const key=t.dataset.key;const rows=rowsFor(key);const i=rows.findIndex(r=>r.id===t.dataset.id);if(i>=0)rows.splice(i,1);render();break}
  case "editRow": {const key=t.dataset.key;const rows=rowsFor(key);const i=rows.findIndex(r=>r.id===t.dataset.id);if(i<0)break;const r=rows.splice(i,1)[0];S.entries[key]=r;render();break}
  case "calidad": modalCtx=null;calidadModal(t.dataset.key,t.dataset.cat);break;
  case "aceptarCal": {const c=modalCtx;syncCal();if(!/^([0-9]+\.?[0-9]{0,6})$/.test(String(c.cal.porcentaje).replace(",",".")))return calidadModal(c.calKey,c.catName,"porcentaje mal ingresado");if(dec(c.cal.porcentaje)>100||dec(c.cal.porcentaje)<=0)return calidadModal(c.calKey,c.catName,"El porcentaje debe estar entre 0 y 100");
   if(!["Plena propiedad","Fideicomiso"].includes(c.cal.calidad)&&!c.cal.tipoGravamen)return calidadModal(c.calKey,c.catName,"Selecciona el tipo de gravamen");
   S.entries[c.calKey].cal=c.cal;closeModal();render();break}
  case "addFid": {syncCal();const rut=document.getElementById("fid_rut").value,pct=document.getElementById("fid_pct").value,cond=document.getElementById("fid_cond").value;const c=modalCtx;if(!rutValid(rut))return calidadModal(c.calKey,c.catName,"Rut Mal Ingresado");if(!/^([0-9]+\.?[0-9]{0,6})$/.test(pct))return calidadModal(c.calKey,c.catName,"Porcentaje Mal Ingresado");c.cal.fideicomisarios.push({rut:rutFmt(rut),pct,cond});calidadModal(c.calKey,c.catName);break}
  case "delFid": {syncCal();const c=modalCtx;c.cal.fideicomisarios.splice(Number(t.dataset.i),1);calidadModal(c.calKey,c.catName);break}
  case "buscarRol": buscarRolModal(t.dataset.key,t.dataset.cat);break;
  case "aceptarRol": aceptarRol();break;
  case "buscarCod": buscarCodModal(t.dataset.key);break;
  case "aceptarCod": {const e=S.entries[modalCtx.key];const g=id=>document.getElementById(id).value.trim();if(!g("v_cod")||!g("v_an")||!int(g("v_ta")))return;Object.assign(e,{cod:g("v_cod"),anio:g("v_an"),marca:g("v_ma"),modelo:g("v_mo"),tasacion:String(int(g("v_ta")))});closeModal();render();break}
  case "addLeg": addLegado(t.dataset.id);break;
  case "delLeg": {const a=asigById(t.dataset.id);a.legados=a.legados.filter(l=>l.lid!==t.dataset.lid);render();break}
  case "closeModal": closeModal();break;
 }
});
function syncModal(){if(!modalEl||!modalCtx?.asig)return;modalEl.querySelectorAll("[data-m]").forEach(el=>{modalCtx.asig[el.dataset.m]=el.value})}
function syncCal(){if(!modalEl||!modalCtx?.cal)return;modalEl.querySelectorAll("[data-c]").forEach(el=>{modalCtx.cal[el.dataset.c]=el.value})}
document.addEventListener("change",ev=>{
 const t=ev.target;if(!inScope(t))return;
 if(t.matches("[data-mstruct]")){syncModal();if(t.dataset.m==="region")modalCtx.asig.comuna="";if(t.dataset.m==="cede"&&t.value==="No")modalCtx.asig.porcentajeCede="";asigModal(modalCtx.asig);return}
 if(t.matches("[data-cstruct]")){syncCal();calidadModal(modalCtx.calKey,modalCtx.catName);return}
 if(t.matches("[data-b][data-struct]")){setP(S,t.dataset.b,t.value);if(t.dataset.b==="declarante.region")S.declarante.comuna="";if(t.dataset.b==="causante.estadoCivil"){S.causante.regimen="";S.causante.sexo="";S.causante.mujerRenuncia=""}if(t.dataset.b==="causante.regimen"){S.causante.sexo="";S.causante.mujerRenuncia=""}render();return}
 if(t.matches("[data-e]")){const [key,f]=t.dataset.e.split("|");const e=S.entries[key];if(!e)return;e[f]=t.type==="checkbox"?t.checked:t.value;
  if(t.tagName==="SELECT"||t.type==="checkbox"||t.hasAttribute("data-struct-e")){render();const el=document.getElementById(t.id);if(el&&t.type!=="checkbox"&&t.tagName!=="SELECT")el.focus()}return}
});
document.addEventListener("input",ev=>{
 const t=ev.target;if(!inScope(t))return;
 if(t.matches("[data-b]")){setP(S,t.dataset.b,t.value);soft();return}
 if(t.matches("[data-e]")&&t.tagName==="INPUT"&&t.type!=="checkbox"&&t.type!=="date"){const [key,f]=t.dataset.e.split("|");const e=S.entries[key];if(!e)return;e[f]=t.hasAttribute("data-money")?String(int(t.value)):t.value;refreshEntry(key);if(key.startsWith("leg:"))soft();return}
});
document.addEventListener("focusout",ev=>{
 const t=ev.target;if(!inScope(t))return;
 if(t.hasAttribute&&t.hasAttribute("data-money")&&t.value){t.value=miles(int(t.value))}
 if(t.hasAttribute&&t.hasAttribute("data-rut")&&t.value&&rutValid(t.value)){t.value=rutFmt(t.value);if(t.dataset.b)setP(S,t.dataset.b,t.value);if(t.dataset.e){const [key,f]=t.dataset.e.split("|");if(S.entries[key])S.entries[key][f]=t.value}}
 if(t.hasAttribute&&t.hasAttribute("data-rut")&&t.value&&!rutValid(t.value))t.classList.add("sim-err");else if(t.classList)t.classList.remove("sim-err");
 if(t.matches&&t.matches("[data-b]")&&S){const r=document.getElementById("sim-rail");if(r&&!r.contains(t)){S._st={declarante:vDeclarante(),causante:vCausante(),posesion:vPosesion(),inventario:vInventario(),testamento:vTestamento(),abogado:vAbogado(),asignatarios:vAsignatarios(),bienes:vBienes()};const R=window.__R||calcular();r.innerHTML=railHTML(R)}}
});
document.addEventListener("keydown",ev=>{if(ev.key==="Escape"&&modalEl)closeModal()});
render();

})();
