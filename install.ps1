# install.ps1 - wire dsh-background into the web profile.
#
# Run from anywhere:  powershell -ExecutionPolicy Bypass -File install.ps1
# Idempotent: re-running refreshes the installed copy and the managed row.
# ASCII-only source: Windows PowerShell 5.1 reads BOM-less files as ANSI.
#
# The FIRST install copies the whole delivery folder (scripts included) into
# %DSH_HOME%\plugins\dsh-background. From then on that installed copy is the
# live plugin and the delivery folder is just the portable master: the harness
# never reads this folder again, and uninstall.ps1 also ships in the installed
# copy.

$ErrorActionPreference = 'Stop'

# --- Locate the delivery folder ------------------------------------------------
$PluginDir = $PSScriptRoot
if ([string]::IsNullOrEmpty($PluginDir)) {
  throw 'install.ps1 must run as a saved script file (needs $PSScriptRoot).'
}

# --- Resolve the harness home ---------------------------------------------------
$DshHome = $env:DSH_HOME
if ([string]::IsNullOrEmpty($DshHome)) { $DshHome = Join-Path $env:USERPROFILE '.dsh' }

# --- Copy the whole folder into the harness home ---------------------------------
$InstallDir = Join-Path $DshHome 'plugins/dsh-background'
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
foreach ($File in @('package.json', 'host.mjs', 'client.js', 'install.ps1', 'install.bat', 'uninstall.ps1', 'uninstall.bat', 'README.md', 'cordis.patch.yml')) {
  $From = (Resolve-Path (Join-Path $PluginDir $File)).Path
  $To = Join-Path $InstallDir $File
  if ($From -ne $To) { Copy-Item -Force $From $To }
}
$HostFile = Join-Path $InstallDir 'host.mjs'
$HostUrl = [System.Uri]::new($HostFile).AbsoluteUri

# --- Rewrite the delivery folder's informational patch file ---------------------
$PatchSource = Join-Path $PluginDir 'cordis.patch.yml'
$PatchContent = @(
  '# Chat backgrounds - informational copy of the row installed by install.ps1.',
  '# The live row lives in %DSH_HOME%\profiles\web\cordis.patch.yml and points at',
  '# the installed copy under %DSH_HOME%\plugins\dsh-background\host.mjs.',
  '- insert:',
  ('  - name: ' + $HostUrl),
  '    config:',
  '      enabled: true'
) -join "`r`n"
[System.IO.File]::WriteAllText($PatchSource, $PatchContent + "`r`n", (New-Object System.Text.UTF8Encoding($false)))

# --- Append the managed insert row to the profile's user patch layer ----------
$ProfileDir = Join-Path $DshHome 'profiles/web'
if (-not (Test-Path $ProfileDir)) { throw "dsh web profile not found at $ProfileDir" }
$ProfilePatch = Join-Path $ProfileDir 'cordis.patch.yml'

$RowMarker = '# dsh-background (managed by install.ps1)'
$RowBody = @('- insert:', ('  - name: ' + $HostUrl), '    config:', '      enabled: true')

$Utf8 = New-Object System.Text.UTF8Encoding($false)
if (Test-Path $ProfilePatch) {
  $ExistingText = [System.IO.File]::ReadAllText($ProfilePatch)
  $Existing = $ExistingText -split "`r?`n"
  $Kept = @()
  $SkipRow = $false
  foreach ($Line in $Existing) {
    if ($Line -eq $RowMarker) { $SkipRow = $true; continue }
    if ($SkipRow) {
      # Drop the previously written 4-line managed row.
      if ($Line -match '^(\s|-)') { continue }
      $SkipRow = $false
    }
    $Kept += $Line
  }
  while ($Kept.Count -gt 0 -and $Kept[$Kept.Count - 1] -eq '') { $Kept = $Kept[0..($Kept.Count - 2)] }
  $Merged = ($Kept -join "`r`n") + "`r`n`r`n" + $RowMarker + "`r`n" + ($RowBody -join "`r`n") + "`r`n"
  [System.IO.File]::WriteAllText($ProfilePatch, $Merged, $Utf8)
} else {
  $Fresh = $RowMarker + "`r`n" + ($RowBody -join "`r`n") + "`r`n"
  [System.IO.File]::WriteAllText($ProfilePatch, $Fresh, $Utf8)
}

Write-Host ''
Write-Host 'dsh-background installed.' -ForegroundColor Green
Write-Host "  delivery folder : $PluginDir (portable master, kept as-is)"
Write-Host "  installed copy  : $InstallDir (the live plugin)"
Write-Host "  profile patch   : $ProfilePatch"
Write-Host ''
Write-Host 'Reload the web page; if the header button does not appear, restart pnpm dsh web once.'
Write-Host 'To uninstall later, run uninstall.ps1 from the installed copy.'
