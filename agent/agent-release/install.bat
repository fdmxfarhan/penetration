@echo off
setlocal EnableExtensions

title Penetration Agent Installer

set "APP_NAME=PenetrationAgent"
set "INSTALL_DIR=%ProgramFiles%\%APP_NAME%"
set "SOURCE_DIR=%~dp0"
set "STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "STARTUP_SCRIPT=%STARTUP_DIR%\PenetrationAgent.vbs"

echo.
echo ==========================================
echo       Penetration Agent Installer
echo ==========================================
echo.

:: =========================================================
:: Request administrator privileges
:: =========================================================

net session >nul 2>&1

if %errorlevel% neq 0 (
    echo Requesting administrator privileges...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

echo Installing to:
echo %INSTALL_DIR%
echo.

:: =========================================================
:: Remove previous installation
:: =========================================================

if exist "%INSTALL_DIR%" (
    echo Removing previous installation...
    rmdir /S /Q "%INSTALL_DIR%"
)

mkdir "%INSTALL_DIR%"

:: =========================================================
:: Copy agent.exe
:: =========================================================

echo [1/7] Copying agent.exe...

copy /Y "%SOURCE_DIR%agent.exe" "%INSTALL_DIR%\agent.exe" >nul

if not exist "%INSTALL_DIR%\agent.exe" (
    echo ERROR: agent.exe could not be copied.
    pause
    exit /b 1
)

:: =========================================================
:: Copy JSON files
:: =========================================================

echo [2/7] Copying JSON configuration files...

for %%F in ("%SOURCE_DIR%*.json") do copy /Y "%%F" "%INSTALL_DIR%\" >nul

:: =========================================================
:: Copy dist
:: =========================================================

echo [3/7] Copying dist...

if exist "%SOURCE_DIR%dist" (
    xcopy "%SOURCE_DIR%dist" "%INSTALL_DIR%\dist" /E /I /Y /Q >nul
) else (
    echo ERROR: dist directory not found.
    pause
    exit /b 1
)

:: =========================================================
:: Copy node_modules
:: =========================================================

echo [4/7] Copying node_modules...

if exist "%SOURCE_DIR%node_modules" (
    xcopy "%SOURCE_DIR%node_modules" "%INSTALL_DIR%\node_modules" /E /I /Y /Q >nul
) else (
    echo WARNING: node_modules directory not found.
)

:: =========================================================
:: Copy data
:: =========================================================

echo [5/7] Copying data...

if exist "%SOURCE_DIR%data" (
    xcopy "%SOURCE_DIR%data" "%INSTALL_DIR%\data" /E /I /Y /Q >nul
)

:: =========================================================
:: Copy package files
:: =========================================================

echo [6/7] Copying package files...

if exist "%SOURCE_DIR%package.json" (
    copy /Y "%SOURCE_DIR%package.json" "%INSTALL_DIR%\package.json" >nul
)

if exist "%SOURCE_DIR%package-lock.json" (
    copy /Y "%SOURCE_DIR%package-lock.json" "%INSTALL_DIR%\package-lock.json" >nul
)

:: =========================================================
:: Create startup directory
:: =========================================================

echo [7/7] Creating startup launcher...

if not exist "%STARTUP_DIR%" mkdir "%STARTUP_DIR%"

if exist "%STARTUP_SCRIPT%" del /F /Q "%STARTUP_SCRIPT%"

:: =========================================================
:: Create VBS launcher
:: =========================================================

echo Set WshShell = CreateObject^("WScript.Shell"^) > "%STARTUP_SCRIPT%"
echo WshShell.CurrentDirectory = "%INSTALL_DIR%" >> "%STARTUP_SCRIPT%"
echo WshShell.Run """%INSTALL_DIR%\agent.exe"" ""dist\index.js""", 0, False >> "%STARTUP_SCRIPT%"
echo Set WshShell = Nothing >> "%STARTUP_SCRIPT%"

if exist "%STARTUP_SCRIPT%" (
    echo Startup launcher created successfully.
) else (
    echo ERROR: Failed to create startup launcher.
    pause
    exit /b 1
)

:: =========================================================
:: Installation complete
:: =========================================================

echo.
echo ==========================================
echo       Installation Complete
echo ==========================================
echo.
echo Installed application:
echo %INSTALL_DIR%
echo.
echo Startup launcher:
echo %STARTUP_SCRIPT%
echo.

:: =========================================================
:: Start agent now
:: =========================================================

echo Starting agent...

pushd "%INSTALL_DIR%"

start "" /min "%INSTALL_DIR%\agent.exe" "dist\index.js"

popd

echo.
echo Agent started successfully.
echo.
echo The agent will automatically start when
echo the current Windows user logs in.
echo.

pause

endlocal