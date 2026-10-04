# install.ps1 - install dsh-background into the web profile (dsh v0.2.0-rc.2).
#
# Run from anywhere:  powershell -ExecutionPolicy Bypass -File install.ps1
#
# The ONLY supported install is the harness's own: this script packs this
# folder into a tarball (pnpm pack) and runs
#   pnpm dsh plugin --profile web add <that tarball>
# from the harness checkout. That registers the package as a profile bundle:
# the harness adds it to the profile manifest, installs a REAL COPY of the
# package into the profile's node_modules, and loads cordis.patch.yml from the
# bundle as an overlay row. The Plugins page then lists the plugin with the
# native enable switch and this bundle's config (the plugins.bundle.config
# slot, keyed by the package name). Because the profile holds its own copy,
# this folder can be moved or deleted at any time without breaking the
# running plugin.
#
# This script performs, in order:
#   1. vendor the config-schema library into .\deps (ships with the bundle);
#   2. remove the legacy file:// row older installers wrote into the profile
#      patch (a leftover would double-register the package and break the
#      rc.2 client-module scan);
#   3. remove the legacy installed copy under %DSH_HOME%\plugins (old flow);
#   3b. migrate the legacy settings.yaml section (v1 flow) into the bundle
#       patch defaults, so the port keeps the user's language and glass;
#   4. pack the folder into the profile's .artifacts directory (from a
#      staging copy without *.tgz, so old archives never nest inside the new
#      tarball) and run the official `dsh plugin add <artifact path there>`;
#      the profile manifest then references the .artifacts copy by file:
#      path - that copy is KEPT, because `dsh plugin add` of ANY bundle
#      resolves EVERY profile dependency, so a missing artifact breaks other
#      plugins' installs (even their remove). After a successful add only
#      OUTDATED artifacts of THIS package are deleted, pointwise.
#
# Idempotent: re-running refreshes everything. After editing the plugin
# source, re-run this script so the profile copies the new bytes.
# ASCII-only source: Windows PowerShell 5.1 reads BOM-less files as ANSI.

param(
  # Harness source checkout (provides vendor\schemastery and the dsh CLI).
  # Probed automatically when omitted.
  [string]$HarnessRoot = '',
  # Profile to install into. The web app is this plugin's target.
  [string]$Profile = 'web'
)

$ErrorActionPreference = 'Stop'

# --- Locate the delivery folder ------------------------------------------------
$PluginDir = $PSScriptRoot
if ([string]::IsNullOrEmpty($PluginDir)) {
  throw 'install.ps1 must run as a saved script file (needs $PSScriptRoot).'
}

# --- Resolve the harness home ---------------------------------------------------
$DshHome = $env:DSH_HOME
if ([string]::IsNullOrEmpty($DshHome)) { $DshHome = Join-Path $env:USERPROFILE '.dsh' }

# --- Locate the harness checkout -------------------------------------------------
$HarnessCandidates = @(
  $HarnessRoot,
  $env:DSH_ROOT,
  'C:\Deepseek-Harness\deepseek-harness-v0.2.0-rc.2',
  'C:\Deepseek-Harness\deepseek-harness'
) | Where-Object { -not [string]::IsNullOrEmpty($_) }

$Harness = $null
foreach ($Root in $HarnessCandidates) {
  if (Test-Path (Join-Path $Root 'vendor/schemastery/lib/index.cjs')) { $Harness = $Root; break }
  if (Test-Path (Join-Path $Root 'apps/cli/package.json')) { $Harness = $Root; break }
}
if ($null -eq $Harness) {
  throw ("Harness checkout not found. Pass it explicitly: install.ps1 -HarnessRoot <path> " +
         "(looked in: $($HarnessCandidates -join '; ')).")
}
Write-Host "Harness checkout : $Harness"

# --- 1. Vendor the config-schema library into the bundle -------------------------
# host.mjs requires '@deepseek-ai/schemastery' first; outside the harness tree
# that name does not resolve, so the bundle carries a vendored CJS copy in
# deps\. The CJS build is loaded synchronously (createRequire, no TLA) and
# needs @deepseek-ai/cosmokit beside it (Node 24 require(esm) handles it).
$DepsDir = Join-Path $PluginDir 'deps'
$SchemaSource = Join-Path $Harness 'vendor/schemastery/lib/index.cjs'
$CosmoSource = Join-Path $Harness 'vendor/cosmokit'
if (Test-Path $SchemaSource) {
  New-Item -ItemType Directory -Force -Path (Join-Path $DepsDir 'node_modules/@deepseek-ai/cosmokit/lib') | Out-Null
  Copy-Item -Force $SchemaSource (Join-Path $DepsDir 'schemastery.cjs')
  Copy-Item -Force (Join-Path $CosmoSource 'package.json') (Join-Path $DepsDir 'node_modules/@deepseek-ai/cosmokit/package.json')
  Copy-Item -Force (Join-Path $CosmoSource 'lib/index.js') (Join-Path $DepsDir 'node_modules/@deepseek-ai/cosmokit/lib/index.js')
  # The ESM copy is no longer loaded (sync CJS replaced it); drop stale bytes.
  Remove-Item -ErrorAction SilentlyContinue (Join-Path $DepsDir 'schemastery.mjs')
  Write-Host "Vendored the config-schema library from $Harness."
} elseif (Test-Path (Join-Path $DepsDir 'schemastery.cjs')) {
  Write-Host 'Using the vendored config-schema library already in deps\.'
} else {
  Write-Host 'WARNING: schemastery vendor copy not found and deps\ has none.' -ForegroundColor Yellow
  Write-Host '         The plugin runs with defaults; the Plugins-page form is absent.' -ForegroundColor Yellow
}

# --- 2. Remove the legacy file:// row (migration from the pre-bundle flow) -------
# Older installers wrote a managed block into the profile patch pointing at the
# installed copy. With the bundle installed that package would resolve from two
# active sources, which rc.2's client-module scanner refuses. Idempotent strip.
$ProfilePatch = Join-Path $DshHome "profiles/$Profile/cordis.patch.yml"
$RowMarker = '# dsh-background (managed by install.ps1)'
if (Test-Path $ProfilePatch) {
  $ExistingText = [System.IO.File]::ReadAllText($ProfilePatch)
  if ($ExistingText.Contains($RowMarker)) {
    $Existing = $ExistingText -split "`r?`n"
    $Kept = @()
    $SkipRow = $false
    foreach ($Line in $Existing) {
      if ($Line -eq $RowMarker) { $SkipRow = $true; continue }
      if ($SkipRow) {
        # The managed row ends at the first blank line or at a line that starts
        # a new top-level item.
        if ($Line -match '^\s' -or $Line -match '^-' -or $Line -eq '') { continue }
        $SkipRow = $false
      }
      $Kept += $Line
    }
    while ($Kept.Count -gt 0 -and $Kept[$Kept.Count - 1] -eq '') {
      $Kept = if ($Kept.Count -eq 1) { @() } else { $Kept[0..($Kept.Count - 2)] }
    }
    [System.IO.File]::WriteAllText($ProfilePatch, (($Kept -join "`r`n") + "`r`n"), (New-Object System.Text.UTF8Encoding($false)))
    Write-Host 'Removed the legacy managed row from the profile patch.'
  }
}

# --- 3. Remove the legacy installed copy (old flow artifact) ----------------------
$LegacyCopy = Join-Path $DshHome 'plugins/dsh-background'
if (Test-Path $LegacyCopy) {
  Remove-Item -Recurse -Force $LegacyCopy
  Write-Host 'Removed the legacy installed copy under %DSH_HOME%\plugins.'
}

# --- 3b. Migrate the legacy settings.yaml section into the bundle patch -----------
# The v1 flow stored {enabled, panelTransparency, language} under
# `chat-background:` in %DSH_HOME%\settings.yaml. The rc.2 row is configured
# from the bundle patch defaults (later live edits land in the profile row),
# so the first install of v2 seeds the patch from the old values. `enabled`
# is dropped: the rc.2 enable switch is the Plugins row's own.
$BundlePatchPath = Join-Path $PluginDir 'cordis.patch.yml'
$SettingsYaml = Join-Path $DshHome 'settings.yaml'
$Migrated = 0
if ((Test-Path $SettingsYaml) -and (Test-Path $BundlePatchPath)) {
  $Legacy = @{}
  try {
    $Lines = [System.IO.File]::ReadAllLines($SettingsYaml)
    $InRow = $false
    for ($i = 0; $i -lt $Lines.Count; $i++) {
      $L = $Lines[$i]
      if ($L -match '^chat-background:\s*$') { $InRow = $true; continue }
      if ($InRow) {
        if ($L.Trim() -eq '') { continue }
        $Ind = $L.Length - $L.TrimStart().Length
        if ($Ind -eq 0) { $InRow = $false; continue }
        if ($L -match '^\s*([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$') { $Legacy[$Matches[1]] = $Matches[2].Trim() }
      }
    }
  } catch {
    Write-Host "Could not parse the legacy settings.yaml ($($_.Exception.Message)); skipping migration." -ForegroundColor Yellow
  }
  if ($Legacy.Count -gt 0) {
    $BundleLines = [System.IO.File]::ReadAllLines($BundlePatchPath)
    $BIdx = -1
    for ($i = 0; $i -lt $BundleLines.Count; $i++) {
      if ($BundleLines[$i].Trim() -eq 'config:') { $BIdx = $i; break }
    }
    if ($BIdx -ge 0) {
      $BCfgIndent = $BundleLines[$BIdx].Length - $BundleLines[$BIdx].TrimStart().Length
      for ($j = $BIdx + 1; $j -lt $BundleLines.Count; $j++) {
        $L = $BundleLines[$j]
        if ($L.Trim() -eq '') { continue }
        $Ind = $L.Length - $L.TrimStart().Length
        if ($Ind -le $BCfgIndent) { break }
        if ($L -match '^(\s*([A-Za-z_][A-Za-z0-9_]*):\s*)(.*)$') {
          $Key = $Matches[2]
          if ($Legacy.ContainsKey($Key) -and $Matches[3] -ne $Legacy[$Key]) {
            $BundleLines[$j] = $Matches[1] + $Legacy[$Key]
            $Migrated++
          }
        }
      }
      if ($Migrated -gt 0) {
        [System.IO.File]::WriteAllText($BundlePatchPath, (($BundleLines -join "`r`n") + "`r`n"), (New-Object System.Text.UTF8Encoding($false)))
        Write-Host "Migrated $Migrated legacy setting(s) from settings.yaml into the bundle patch."
      }
    }
  }
}

# --- 4. The official install: pack into the profile .artifacts, add from there ----
# The profile receives a REAL COPY of the package (pnpm installs the tarball),
# so this master folder can be moved or deleted without breaking the running
# plugin. After editing the plugin source, re-run install.ps1 to refresh the
# copy. (A directory spec would instead create a junction back to this folder,
# which dies the moment the folder moves.)
#
# The pack lands in <DSH_HOME>\profiles\<profile>\.artifacts and STAYS there:
# the profile manifest references it by file: path, and `dsh plugin add` of
# ANY bundle (or a remove) runs a full pnpm install that resolves EVERY
# profile dependency - one missing artifact breaks every other plugin's
# install. The pack runs from a staging copy WITHOUT *.tgz (old archives
# would otherwise nest inside the new tarball). After a successful add only
# OUTDATED artifacts of THIS package are deleted, pointwise; the current
# artifact is kept.
# Ordering note: a profile reference to a MISSING tarball (left by an older
# installer's post-install cleanup, e.g. after a version bump) would fail the
# add's dependency resolution - so a dangling reference is cleared first with
# the official `dsh plugin remove`, and artifacts are only ever deleted AFTER
# a successful add.
Write-Host ''

# The exact artifact name this run will produce: <name>-<version>.tgz.
$Manifest = Get-Content (Join-Path $PluginDir 'package.json') -Raw | ConvertFrom-Json
$ArtifactName = '{0}-{1}.tgz' -f $Manifest.name, $Manifest.version
$ArtifactsDir = Join-Path $DshHome "profiles/$Profile/.artifacts"
New-Item -ItemType Directory -Force -Path $ArtifactsDir | Out-Null
$ArtifactPath = Join-Path $ArtifactsDir $ArtifactName

# What does the profile currently reference for this package?
$ProfileManifestPath = Join-Path $DshHome "profiles/$Profile/package.json"
$OldArtifact = $null
if (Test-Path -LiteralPath $ProfileManifestPath) {
  try {
    $OldDep = (Get-Content $ProfileManifestPath -Raw | ConvertFrom-Json).dependencies.($Manifest.name)
  } catch {
    $OldDep = $null
  }
  if ($OldDep -match '^file:(.+\.tgz)$') {
    $OldArtifact = [System.IO.Path]::GetFullPath($Matches[1])
  }
}

# A referenced-but-missing tarball would break the add's dependency
# resolution: clear the stale bundle first (official CLI, no manual edits).
# Before that, preserve the user's live settings: the row's config block
# (edited from the Plugins page) dies with the remove, so mirror its values
# into the bundle's cordis.patch.yml (this workspace file) - the re-add then
# restores the user's values instead of the defaults. Profile is only read;
# the write lands in the workspace.
if ($null -ne $OldArtifact -and -not (Test-Path -LiteralPath $OldArtifact)) {
  $ProfilePatchPath = Join-Path $DshHome "profiles/$Profile/cordis.patch.yml"
  if ((Test-Path -LiteralPath $ProfilePatchPath) -and (Test-Path -LiteralPath $BundlePatchPath)) {
    $ProfileLines = [System.IO.File]::ReadAllLines($ProfilePatchPath)
    $RowIdx = -1
    for ($i = 0; $i -lt $ProfileLines.Count; $i++) {
      if ($ProfileLines[$i] -match '^\s*-\s+id:\s*chat-background\s*$') { $RowIdx = $i; break }
    }
    if ($RowIdx -ge 0) {
      $RowIndent = $ProfileLines[$RowIdx].Length - $ProfileLines[$RowIdx].TrimStart().Length
      $ConfigVals = @{}
      $InConfig = $false
      $ConfigIndent = 0
      for ($j = $RowIdx + 1; $j -lt $ProfileLines.Count; $j++) {
        $L = $ProfileLines[$j]
        if ($L.Trim() -eq '') { continue }
        $Ind = $L.Length - $L.TrimStart().Length
        if ($Ind -le $RowIndent) { break }
        if ($L.Trim() -eq 'config:') { $InConfig = $true; $ConfigIndent = $Ind; continue }
        if ($InConfig) {
          if ($Ind -le $ConfigIndent) { $InConfig = $false; continue }
          if ($L -match '^\s*([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$') { $ConfigVals[$Matches[1]] = $Matches[2].Trim() }
        }
      }
      if ($ConfigVals.Count -gt 0) {
        $BundleLines = [System.IO.File]::ReadAllLines($BundlePatchPath)
        $BIdx = -1
        for ($i = 0; $i -lt $BundleLines.Count; $i++) {
          if ($BundleLines[$i].Trim() -eq 'config:') { $BIdx = $i; break }
        }
        if ($BIdx -ge 0) {
          $BCfgIndent = $BundleLines[$BIdx].Length - $BundleLines[$BIdx].TrimStart().Length
          $Changed = 0
          for ($j = $BIdx + 1; $j -lt $BundleLines.Count; $j++) {
            $L = $BundleLines[$j]
            if ($L.Trim() -eq '') { continue }
            $Ind = $L.Length - $L.TrimStart().Length
            if ($Ind -le $BCfgIndent) { break }
            if ($L -match '^(\s*([A-Za-z_][A-Za-z0-9_]*):\s*)(.*)$') {
              $Key = $Matches[2]
              if ($ConfigVals.ContainsKey($Key) -and $Matches[3] -ne $ConfigVals[$Key]) {
                $BundleLines[$j] = $Matches[1] + $ConfigVals[$Key]
                $Changed++
              }
            }
          }
          if ($Changed -gt 0) {
            [System.IO.File]::WriteAllText($BundlePatchPath, (($BundleLines -join "`r`n") + "`r`n"), (New-Object System.Text.UTF8Encoding($false)))
            Write-Host "Preserved $Changed live setting(s) from the profile row into the bundle patch."
          }
        }
      }
    }
  }
  Write-Host "The profile references a missing tarball ($([System.IO.Path]::GetFileName($OldArtifact))); clearing the stale bundle first."
  Push-Location $Harness
  try {
    & pnpm dsh plugin --profile $Profile remove $Manifest.name
    if ($LASTEXITCODE -ne 0) {
      Write-Host "dsh plugin remove reported exit code $LASTEXITCODE (continuing)." -ForegroundColor Yellow
    }
  } finally {
    Pop-Location
  }
  $OldArtifact = $null
}

# Pointwise pre-clean: the same-version artifact in .artifacts left by an
# interrupted earlier run. Safe: the pack below recreates this exact path
# before the add resolves dependencies.
if (Test-Path -LiteralPath $ArtifactPath) {
  Remove-Item -Force -LiteralPath $ArtifactPath
  Write-Host "Removed the stale same-version artifact: $ArtifactName"
}

# Pack from a staging copy of this folder WITHOUT *.tgz: old archives would
# otherwise be nested INSIDE the new tarball. Everything else (files and
# subfolders) is copied as is; the staging tree is removed afterwards.
$Staging = Join-Path ([System.IO.Path]::GetTempPath()) ('dsh-background-pack-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $Staging | Out-Null
try {
  Get-ChildItem -LiteralPath $PluginDir -Force | Where-Object { $_.Name -notlike '*.tgz' } | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $Staging $_.Name) -Recurse -Force
  }
  Push-Location $Staging
  try {
    & pnpm pack --pack-destination $ArtifactsDir
    if ($LASTEXITCODE -ne 0) { throw "pnpm pack failed (exit code $LASTEXITCODE)." }
  } finally {
    Pop-Location
  }
} finally {
  Remove-Item -LiteralPath $Staging -Recurse -Force -ErrorAction SilentlyContinue
}
if (-not (Test-Path -LiteralPath $ArtifactPath)) { throw "pnpm pack produced no $ArtifactName." }
$Bundle = Get-Item -LiteralPath $ArtifactPath
Write-Host "Packed the bundle: $($Bundle.FullName)"

Write-Host "Installing the bundle: pnpm dsh plugin --profile $Profile add `"$($Bundle.FullName)`""
Push-Location $Harness
try {
  & pnpm dsh plugin --profile $Profile add $Bundle.FullName
  if ($LASTEXITCODE -ne 0) {
    throw "dsh plugin add failed (exit code $LASTEXITCODE)."
  }
} finally {
  Pop-Location
}

# The add has succeeded: the manifest now references the .artifacts copy.
# KEEP that artifact - other bundles' installs resolve it. Delete only
# OUTDATED artifacts of THIS package, pointwise: older versions in
# .artifacts, and every tarball left in the master folder by older
# installers (the current artifact lives in .artifacts now).
Get-ChildItem -LiteralPath $ArtifactsDir -Filter ($Manifest.name + '-*.tgz') |
  Where-Object { $_.Name -ne $ArtifactName } |
  ForEach-Object {
    Remove-Item -Force -LiteralPath $_.FullName
    Write-Host "Removed the outdated artifact: $($_.Name)"
  }
Get-ChildItem -LiteralPath $PluginDir -Filter ($Manifest.name + '-*.tgz') -ErrorAction SilentlyContinue |
  ForEach-Object {
    Remove-Item -Force -LiteralPath $_.FullName
    Write-Host "Removed the master-folder leftover artifact: $($_.Name)"
  }

Write-Host ''
Write-Host 'dsh-background installed as a profile bundle.' -ForegroundColor Green
Write-Host "  master folder : $PluginDir (portable - move or delete it freely, the profile holds its own copy)"
Write-Host "  profile copy  : $DshHome\profiles\$Profile\node_modules\dsh-background (refreshed by install.ps1)"
Write-Host "  artifact      : $ArtifactPath (KEPT - the profile manifest references it)"
Write-Host ''
Write-Host 'Do not delete the .artifacts tarball: `dsh plugin add`/`remove` of any'
Write-Host 'other bundle resolves every profile dependency, including this one.'
Write-Host 'Restart "pnpm dsh web" if the harness was running, then hard-refresh'
Write-Host 'the page (F5). The Plugins page lists Chat backgrounds with its'
Write-Host 'settings; the per-chat button sits in the chat header utilities.'
Write-Host 'To uninstall later, run uninstall.ps1.'
