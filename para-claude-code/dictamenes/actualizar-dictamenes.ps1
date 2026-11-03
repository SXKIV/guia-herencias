<#
  Actualiza los dictámenes del SII sobre herencias (Ley 16.271) que usa el
  asistente SIILV-I.A de guia-herencias-sii.html.

  Fuente: índice de jurisprudencia administrativa del SII, sección "Otras Normas"
  https://www.sii.cl/normativa_legislacion/jurisprudencia_administrativa/indice_jadm.htm

  Uso:
    powershell -ExecutionPolicy Bypass -File actualizar-dictamenes.ps1            (revisa este año y el anterior)
    powershell -ExecutionPolicy Bypass -File actualizar-dictamenes.ps1 -Completo  (revisa desde 2009)

  Destino (-Html):
    - una página .html con el bloque <script type="application/json" id="siaDictamenes">, o
    - un archivo .json, para proyectos que cargan los datos aparte.

  Solo agrega dictámenes nuevos: nunca borra los que ya están.
  Lo que hace queda anotado en dictamenes-log.txt, junto a este archivo.
#>
param(
  [Alias("Destino")]
  [string]$Html = (Join-Path $PSScriptRoot "guia-herencias-sii.html"),
  [switch]$Completo
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$Log = Join-Path $PSScriptRoot "dictamenes-log.txt"
$utf8 = New-Object Text.UTF8Encoding $false

function Anotar($texto) {
  $linea = (Get-Date -Format "yyyy-MM-dd HH:mm") + "  " + $texto
  [IO.File]::AppendAllText($Log, $linea + "`r`n", $utf8)
  Write-Output $linea
}
function Limpiar($s) {
  if ($null -eq $s) { return "" }
  $s = [Net.WebUtility]::HtmlDecode(($s -replace '<[^>]+>', ' '))
  return ($s -replace '\s+', ' ').Trim()
}
function EsHerencia($texto) { return $texto -match '16\.271|[Hh]erencia' }

# Años 2019 en adelante: el SII los entrega como datos (JSON)
function DesdeApi([int]$anio) {
  $body = '{"key":"OTROS","year":"' + $anio + '"}'
  $r = Invoke-WebRequest -Method Post -Uri "https://www3.sii.cl/getPublicacionesCTByMateria" `
    -ContentType "application/json" -Body $body -UseBasicParsing -TimeoutSec 60
  $datos = [Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray()) | ConvertFrom-Json
  foreach ($i in $datos) {
    $materia = Limpiar $i.pubLegal
    $resumen = Limpiar $i.pubResumen
    if (-not (EsHerencia "$materia $resumen")) { continue }
    [pscustomobject]@{
      anio = $anio; oficio = [string]$i.pubNumOficio; fecha = [string]$i.pubFechaPubli
      materia = $materia; resumen = $resumen
      url = "https://www.sii.cl/normativa_legislacion/jurisprudencia_administrativa/otras_normas/$anio/otras_normas_jadm$anio.htm"
    }
  }
}

# Años 2009 a 2018: páginas HTML con el texto de cada oficio
function DesdeHtml([int]$anio) {
  $base = "https://www.sii.cl/normativa_legislacion/jurisprudencia_administrativa/otras_normas/$anio/"
  $r = Invoke-WebRequest -Uri ($base + "otras_normas_jadm$anio.htm") -UseBasicParsing -TimeoutSec 60
  $html = [Text.Encoding]::GetEncoding("iso-8859-1").GetString($r.RawContentStream.ToArray())
  $patron = "(?s)<h5[^>]*>\s*<a href='(ja(\d+)\.htm)'[^>]*>(.*?)</a>.*?</h5>\s*<p[^>]*>(.*?)</p>"
  foreach ($m in [regex]::Matches($html, $patron)) {
    $titulo = Limpiar $m.Groups[3].Value
    $resumen = Limpiar $m.Groups[4].Value
    if (-not (EsHerencia "$titulo $resumen")) { continue }
    $fecha = [string]$anio
    $f = [regex]::Match($titulo, '\((?:Ord|Oficio)[^)]*?de\s*([\d]{1,2}[-/][\d]{1,2}[-/][\d]{4})\)')
    if ($f.Success) { $fecha = $f.Groups[1].Value -replace '-', '/' }
    [pscustomobject]@{
      anio = $anio; oficio = $m.Groups[2].Value; fecha = $fecha
      materia = ($titulo -replace '\s*\((Ord|Oficio)[^)]*\)\s*$', '').Trim(); resumen = $resumen
      url = $base + $m.Groups[1].Value
    }
  }
}

try {
  $esJson = [IO.Path]::GetExtension($Html) -eq ".json"
  $re = [regex]'(?s)(<script type="application/json" id="siaDictamenes">)(.*?)(</script>)'
  if ($esJson) {
    $json = if (Test-Path $Html) { [IO.File]::ReadAllText($Html, $utf8).Trim() } else { "" }
  } else {
    $contenido = [IO.File]::ReadAllText($Html, $utf8)
    $bloque = $re.Match($contenido)
    if (-not $bloque.Success) { throw "No encontré el bloque siaDictamenes en $Html" }
    $json = $bloque.Groups[2].Value.Trim()
  }

  $actuales = @()
  if ($json) { $actuales = @((ConvertFrom-Json $json).dictamenes) }
  $claves = @{}
  foreach ($d in $actuales) { $claves["$($d.anio)-$($d.oficio)"] = $true }

  $hoy = Get-Date
  $desde = if ($Completo) { 2009 } else { $hoy.Year - 1 }
  $nuevos = @()
  foreach ($anio in $desde..$hoy.Year) {
    $lista = if ($anio -ge 2019) { DesdeApi $anio } else { DesdeHtml $anio }
    foreach ($d in @($lista)) {
      $k = "$($d.anio)-$($d.oficio)"
      if (-not $claves.ContainsKey($k)) { $claves[$k] = $true; $nuevos += $d }
    }
  }

  $todos = @($actuales + $nuevos | Sort-Object @{e = { [int]$_.anio }; Descending = $true }, @{e = { [int]($_.oficio -replace '\D', '') }; Descending = $true })
  $datos = [ordered]@{ revisado = $hoy.ToString("dd'/'MM'/'yyyy"); dictamenes = $todos }
  # ConvertTo-Json de PowerShell 5 escapa < y >, así que el JSON no puede cerrar el <script>
  $nuevoJson = ConvertTo-Json -InputObject $datos -Depth 4 -Compress
  if ($esJson) {
    [IO.File]::WriteAllText($Html, $nuevoJson, $utf8)
  } else {
    $contenido = $re.Replace($contenido, { param($m) $m.Groups[1].Value + "`n" + $nuevoJson + "`n" + $m.Groups[3].Value }, 1)
    [IO.File]::WriteAllText($Html, $contenido, $utf8)
  }

  if ($nuevos.Count) {
    Anotar ("Nuevos dictámenes: " + $nuevos.Count + " (total " + $todos.Count + ")")
    foreach ($d in $nuevos) { Anotar ("  + Oficio $($d.oficio) de $($d.fecha): $($d.resumen)") }
  } else {
    Anotar ("Sin dictámenes nuevos (total " + $todos.Count + ")")
  }
} catch {
  Anotar ("ERROR: " + $_.Exception.Message + " (la página no se modificó)")
  exit 1
}
