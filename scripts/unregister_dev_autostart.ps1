# Unregister the Vite dev server logon scheduled task.

$ErrorActionPreference = "Stop"
$TaskName = "TouhouWallpaperViteDev"

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($null -eq $existing) {
    Write-Host "Task not found: $TaskName (already off)"
    exit 0
}

Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
Write-Host "Unregistered scheduled task: $TaskName"
