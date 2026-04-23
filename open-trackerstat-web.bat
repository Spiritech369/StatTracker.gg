@echo off
setlocal

set "ROOT_DIR=%~dp0"
pushd "%ROOT_DIR%"

REM Localizar pnpm
set "PNPM_CMD=pnpm"
where pnpm >nul 2>nul
if errorlevel 1 (
  if exist "%APPDATA%\npm\pnpm.cmd" (
    set "PNPM_CMD=%APPDATA%\npm\pnpm.cmd"
    echo [INFO] usando %APPDATA%\npm\pnpm.cmd
  ) else (
    echo [ERROR] pnpm no encontrado. Instalalo con: npm i -g pnpm
    pause
    exit /b 1
  )
)

REM Instalar deps si faltan
if not exist "node_modules" (
  echo [INFO] Instalando dependencias del monorepo...
  call "%PNPM_CMD%" install
  if errorlevel 1 (
    echo [ERROR] Fallo pnpm install.
    pause
    exit /b 1
  )
)

REM Levanta docker + db + api + web
echo [INFO] Arrancando entorno completo (docker + api + web)
echo [INFO] Web:  http://localhost:9090
echo [INFO] API:  http://localhost:4000
echo [INFO] Ctrl+C para salir
call "%PNPM_CMD%" dev:all

pause
popd
endlocal
