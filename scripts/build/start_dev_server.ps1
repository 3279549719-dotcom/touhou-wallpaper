# Start Vite dev server for local UI preview (http://localhost:1420).
# Used by the Windows logon scheduled task. English-only comments.

$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$LogDir = Join-Path $ProjectRoot "logs"
$LogFile = Join-Path $LogDir "dev-autostart.log"
$NpmCmd = "C:\Program Files\nodejs\npm.cmd"

if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir | Out-Null
}

function Write-Log([string]$Message) {
    $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Message
    Add-Content -Path $LogFile -Value $line -Encoding UTF8
}

Set-Location $ProjectRoot
Write-Log "Starting npm run dev in $ProjectRoot"

if (-not (Test-Path $NpmCmd)) {
    Write-Log "ERROR: npm.cmd not found at $NpmCmd"
    exit 1
}

# Keep a visible console so the user can see / close the server if needed.
& $NpmCmd run dev *>> $LogFile
$exitCode = $LASTEXITCODE
Write-Log "npm run dev exited with code $exitCode"
exit $exitCode
