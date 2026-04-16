@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "WEB_DIR=%ROOT_DIR%apps\web"
set "WEB_URL=http://127.0.0.1:3000"

REM Verificar que existe el directorio web
if not exist "%WEB_DIR%\package.json" (
  echo [ERROR] No se encontro apps\web\package.json
  echo [INFO] Ruta esperada: %WEB_DIR%
  pause
  exit /b 1
)

REM Ir al directorio web
pushd "%WEB_DIR%"

REM Verificar si node_modules existe
if not exist "node_modules" (
  echo [INFO] Instalando dependencias de apps\web...
  call npm install --legacy-peer-deps
  if errorlevel 1 (
    echo [WARN] npm install --legacy-peer-deps fallo, intentando sin flags...
    call npm install
    if errorlevel 1 (
      echo [ERROR] Fallo la instalacion de dependencias.
      pause
      exit /b 1
    )
  )
)

REM Verificar instalacion
if not exist "node_modules\.bin\npm" (
  if exist "node_modules" (
    echo [WARN] node_modules parece incompleto, reinstalando...
    rmdir /s /q "node_modules"
    call npm install --legacy-peer-deps
    if errorlevel 1 (
      echo [ERROR] Fallo la reinstalacion.
      pause
      exit /b 1
    )
  )
)

echo [INFO] Iniciando servidor de desarrollo...
echo [INFO] El servidor estara disponible en: %WEB_URL%

REM Ejecutar npm run dev directamente (no en nueva ventana para ver errores)
call npm run dev

pause
popd
endlocal
