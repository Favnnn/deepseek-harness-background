# Rev probe for the installed dsh-background bundle (read-only).
$f = Get-Item "$env:USERPROFILE\.dsh\profiles\web\node_modules\dsh-background\client.js"
$mtMs = [string]([DateTimeOffset]$f.LastWriteTimeUtc).ToUnixTimeMilliseconds()
$ctMs = [string]([DateTimeOffset]$f.CreationTimeUtc).ToUnixTimeMilliseconds()
$size = [string]$f.Length
$payload = "plugin-artifact`0$(($mtMs.Length)):${mtMs}:$(($ctMs.Length)):${ctMs}:$(($size.Length)):${size}"
$sha = [System.Security.Cryptography.SHA1]::Create()
$rev = (($sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($payload)) | ForEach-Object { $_.ToString('x2') }) -join '').Substring(0, 12)
Write-Host "rev=$rev mtimeMs=$mtMs ctimeMs=$ctMs size=$size"
try {
  $r1 = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:3080/plugins/dsh-background/client.js?rev=$rev" -Method Head -TimeoutSec 10
  Write-Host "query-probe: $($r1.StatusCode) $($r1.Headers['Content-Type']) len=$($r1.Headers['Content-Length'])"
} catch { Write-Host "query-probe failed: $($_.Exception.Message)" }
try {
  $r2 = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:3080/plugins/dsh-background/client.js" -Method Head -TimeoutSec 10
  Write-Host "bare-probe: $($r2.StatusCode) $($r2.Headers['Content-Type']) len=$($r2.Headers['Content-Length'])"
} catch { Write-Host "bare-probe failed: $($_.Exception.Message)" }
