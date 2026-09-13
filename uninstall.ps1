# uninstall.ps1 - remove dsh-background from the web profile.
# ASCII-only source: Windows PowerShell 5.1 reads BOM-less files as ANSI.
#
# Ships inside the delivery folder AND inside the installed copy
# (%DSH_HOME%\plugins\dsh-background), so it works from either location.
# It restores the system to its pre-plugin state: the profile row, the
# installed copy, the settings section, and the plugin data folder
# (state.json + uploaded photos) all go away. Nothing else is touched.

$ErrorActionPreference = 'Stop'

$ScriptDir = $PSScriptRoot

$DshHome = $env:DSH_HOME
if ([string]::IsNullOrEmpty($DshHome)) { $DshHome = Join-Path $env:USERPROFILE '.dsh' }

# --- Remove the managed insert row --------------------------------------------
$ProfileDir = Join-Path $DshHome 'profiles/web'
$ProfilePatch = Join-Path $ProfileDir 'cordis.patch.yml'
$RowMarker = '# dsh-background (managed by install.ps1)'
$Utf8 = New-Object System.Text.UTF8Encoding($false)

if (Test-Path $ProfilePatch) {
  $ExistingText = [System.IO.File]::ReadAllText($ProfilePatch)
  $Existing = $ExistingText -split "`r?`n"
  $Kept = @()
  $SkipRow = $false
  foreach ($Line in $Existing) {
    if ($Line -eq $RowMarker) { $SkipRow = $true; continue }
    if ($SkipRow) {
      if ($Line -match '^(\s|-)') { continue }
      $SkipRow = $false
    }
    $Kept += $Line
  }
  if ($Kept.Count -ne $Existing.Count) {
    while ($Kept.Count -gt 0 -and $Kept[$Kept.Count - 1] -eq '') { $Kept = $Kept[0..($Kept.Count - 2)] }
    [System.IO.File]::WriteAllText($ProfilePatch, (($Kept -join "`r`n") + "`r`n"), $Utf8)
    Write-Host "Removed the background row from $ProfilePatch" -ForegroundColor Green
  } else {
    Write-Host 'No background row found; nothing to change.'
  }
}

# --- Remove the installed runtime copy ------------------------------------------
$InstallDir = Join-Path $DshHome 'plugins/dsh-background'
$RunningFromInstalled = $false
try {
  $RunningFromInstalled = (Resolve-Path $ScriptDir).Path -eq (Resolve-Path $InstallDir -ErrorAction SilentlyContinue).Path
} catch {
  $RunningFromInstalled = $false
}
if (Test-Path $InstallDir) {
  try {
    Remove-Item -Recurse -Force $InstallDir -ErrorAction Stop
    Write-Host "Removed the installed copy $InstallDir" -ForegroundColor Green
  } catch {
    # Deleting the folder that contains this running script can be blocked on
    # Windows; everything else is already uninstalled, so the leftover files
    # are inert until the next install or a manual delete.
    Write-Host "Could not delete $InstallDir (script may be running from it); delete it manually." -ForegroundColor Yellow
  }
}

# --- Remove the plugin data folder (per-chat configs + uploaded photos) --------
# Exact plugin-owned path only; no wildcards, no parent recursion.
$DataDir = Join-Path $DshHome 'plugin-data/dsh-background'
if (Test-Path $DataDir) {
  Remove-Item -Recurse -Force $DataDir -ErrorAction SilentlyContinue
  if (Test-Path $DataDir) {
    Write-Host "Could not delete $DataDir; delete it manually." -ForegroundColor Yellow
  } else {
    Write-Host "Removed the plugin data $DataDir" -ForegroundColor Green
  }
}

# --- Remove the settings section ----------------------------------------------
$SettingsPath = Join-Path $DshHome 'settings.yaml'
if (Test-Path $SettingsPath) {
  $SettingsText = [System.IO.File]::ReadAllText($SettingsPath)
  $Settings = $SettingsText -split "`r?`n"
  if ($Settings -match '^chat-background:') {
    $Kept = @()
    $InSection = $false
    foreach ($Line in $Settings) {
      if ($Line -match '^chat-background:') { $InSection = true; continue }
      if ($InSection -and $Line -match '^\S') { $InSection = false }
      if (-not $InSection) { $Kept += $Line }
    }
    while ($Kept.Count -gt 0 -and $Kept[$Kept.Count - 1] -eq '') { $Kept = $Kept[0..($Kept.Count - 2)] }
    [System.IO.File]::WriteAllText($SettingsPath, (($Kept -join "`r`n") + "`r`n"), $Utf8)
    Write-Host "Removed the chat-background section from $SettingsPath" -ForegroundColor Green
  }
}

Write-Host ''
Write-Host 'dsh-background uninstalled. Restart the web server to apply.'
if (-not $RunningFromInstalled) {
  Write-Host "The delivery folder $ScriptDir was left in place; delete it if you no longer need it."
}
