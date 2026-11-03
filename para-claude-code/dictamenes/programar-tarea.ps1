<#
  Programa en Windows la revisión diaria de dictámenes del SII (2:00 AM).

  Uso (desde esta carpeta):
    powershell -ExecutionPolicy Bypass -File programar-tarea.ps1 -Destino "C:\ruta\a\la\pagina.html"
    powershell -ExecutionPolicy Bypass -File programar-tarea.ps1 -Destino "C:\ruta\a\dictamenes.json" -Hora 03:30
    powershell -ExecutionPolicy Bypass -File programar-tarea.ps1 -Quitar

  -Destino: la página con el bloque siaDictamenes, o el archivo dictamenes.json.
  El computador debe estar encendido con la sesión abierta; si a esa hora está
  apagado, la tarea corre apenas se encienda.
#>
param(
  [string]$Destino,
  [string]$Hora = "02:00",
  [string]$Nombre = "SIILV - Actualizar dictamenes SII",
  [switch]$Quitar
)

$ErrorActionPreference = "Stop"

if ($Quitar) {
  Unregister-ScheduledTask -TaskName $Nombre -Confirm:$false
  Write-Output "Tarea '$Nombre' eliminada."
  exit 0
}
if (-not $Destino) { throw "Indica -Destino con la ruta de la página .html o del dictamenes.json" }

$Destino = (Resolve-Path $Destino).Path
$script = Join-Path $PSScriptRoot "actualizar-dictamenes.ps1"
$argumentos = "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$script`" -Destino `"$Destino`""

$accion = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $argumentos -WorkingDirectory $PSScriptRoot
$disparador = New-ScheduledTaskTrigger -Daily -At $Hora
$ajustes = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 15)

Register-ScheduledTask -TaskName $Nombre -Action $accion -Trigger $disparador -Settings $ajustes -Force `
  -Description "Revisa cada día si el SII publicó dictámenes nuevos sobre herencias y los agrega a $Destino" | Out-Null

$info = Get-ScheduledTask -TaskName $Nombre | Get-ScheduledTaskInfo
Write-Output "Tarea '$Nombre' programada. Próxima ejecución: $($info.NextRunTime)"
