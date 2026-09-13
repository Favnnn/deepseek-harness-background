@echo off
setlocal
rem Install / refresh dsh-background into the DSH web profile.
rem Double-click or run from a terminal. Needs PowerShell (ships with Windows).
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1"
if errorlevel 1 (
  echo.
  echo Install FAILED - see the message above.
)
echo.
pause
