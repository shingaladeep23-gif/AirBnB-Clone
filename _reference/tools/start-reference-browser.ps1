# The reference channel dies whenever the launching shell goes away, and every time
# it does, work that depends on it silently stalls. Launching from a Bash `&` was the
# mistake: those processes are children of the shell and go with it. Start-Process
# detaches properly, so the browser outlives the session that started it.
#
# Run this if a CDP connect fails. It is idempotent — an already-live port is left
# alone rather than started twice.
#
#   powershell -ExecutionPolicy Bypass -File _reference/tools/start-reference-browser.ps1
#
# COMET on 9223 is the reference channel. Chrome on 9222 is the fallback.
# Neither can be a Playwright-LAUNCHED browser: Vercel BotID 429s those, which is the
# whole reason this indirection exists. Attach with connectOverCDP instead.

$ErrorActionPreference = "Stop"
$ref = "https://airbnb-clone-umber-two.vercel.app"

function Test-Cdp([int]$Port) {
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:$Port/json/version" -TimeoutSec 3 -UseBasicParsing
    return $r.StatusCode -eq 200
  } catch { return $false }
}

function Start-Browser([string]$Name, [string]$Exe, [int]$Port, [string]$ProfileDir) {
  if (Test-Cdp $Port) { Write-Host "$Name already live on $Port - leaving it alone"; return }
  if (-not (Test-Path $Exe)) { Write-Host "$Name NOT INSTALLED at $Exe - skipping"; return }

  # Chrome 136+ refuses --remote-debugging-port on the default profile directory, so a
  # dedicated --user-data-dir is mandatory, not a preference.
  $args = @(
    "--remote-debugging-port=$Port",
    "--user-data-dir=$ProfileDir",
    "--no-first-run",
    "--no-default-browser-check",
    $ref
  )
  Start-Process -FilePath $Exe -ArgumentList $args -WindowStyle Minimized
  Write-Host "$Name starting on $Port ..."

  foreach ($i in 1..15) {
    Start-Sleep -Milliseconds 800
    if (Test-Cdp $Port) { Write-Host "$Name LIVE on $Port"; return }
  }
  Write-Host "$Name did NOT come up on $Port"
}

Start-Browser "Comet" "C:\Program Files\Perplexity\Comet\Application\comet.exe" 9223 "C:\Users\shingala\comet-cdp-profile"
Start-Browser "Chrome" "C:\Program Files\Google\Chrome\Application\chrome.exe" 9222 "C:\Users\shingala\chrome-cdp-profile"

Write-Host ""
Write-Host "=== CHANNEL STATUS ==="
Write-Host ("Comet  9223 (reference): " + $(if (Test-Cdp 9223) { "LIVE" } else { "DOWN" }))
Write-Host ("Chrome 9222 (fallback):  " + $(if (Test-Cdp 9222) { "LIVE" } else { "DOWN" }))
