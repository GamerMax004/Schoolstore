$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw 'Node.js fehlt. Bitte Node.js 22.13 oder neuer installieren und start.ps1 erneut ausführen.'
}
if (-not (Test-Path (Join-Path $root '.env'))) {
    Write-Host 'Ersteinrichtung Schoolstore: Lege ein Verwaltungs-Passwort mit mindestens 12 Zeichen fest.' -ForegroundColor Green
    $secure = Read-Host 'Verwaltungs-Passwort' -AsSecureString
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
    if ($password.Length -lt 12) { throw 'Das Passwort muss mindestens 12 Zeichen lang sein. Starte start.ps1 erneut.' }
    $envText = "PORT=8766`r`nHOST=127.0.0.1`r`nNODE_ENV=development`r`nADMIN_PASSWORD=$password`r`n"
    [IO.File]::WriteAllText((Join-Path $root '.env'), $envText, [Text.UTF8Encoding]::new($false))
    $password = $null
    Write-Host 'Einrichtung gespeichert. Das Passwort wird bei späteren Starts nicht erneut abgefragt.' -ForegroundColor Green
}
Write-Host 'Starte Schoolstore. Mit Strg+C beendest du den Server.' -ForegroundColor Green
node (Join-Path $root 'server.mjs')
