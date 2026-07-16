# Register a Windows Scheduled Task to start the Vite dev server at user logon.

$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$StartScript = Join-Path $PSScriptRoot "start_dev_server.ps1"
$TaskName = "TouhouWallpaperViteDev"
$Powershell = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"

if (-not (Test-Path $StartScript)) {
    throw "Missing start script: $StartScript"
}

$action = New-ScheduledTaskAction `
    -Execute $Powershell `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$StartScript`"" `
    -WorkingDirectory $ProjectRoot

$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit ([TimeSpan]::Zero) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1)

$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Force | Out-Null

Write-Host "Registered scheduled task: $TaskName"
Write-Host "Runs at logon for user: $env:USERNAME"
Write-Host "UI: http://localhost:1420/"
Write-Host "Log: $ProjectRoot\logs\dev-autostart.log"
Write-Host "Unregister: npm run dev:autostart:off"
