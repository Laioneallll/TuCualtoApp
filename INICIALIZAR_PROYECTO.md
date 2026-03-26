# Tu Cualto App — Inicialización paso a paso

## 1) Requisitos previos

- Windows 10/11
- PowerShell 7 (`pwsh`)
- Node.js **20.18.0** (recomendado por compatibilidad con `better-sqlite3`)
- npm (incluido con Node)

Verifica:

```powershell
pwsh --version
node -v
npm -v
```

`node -v` debe mostrar `v20.18.0` (o Node 20 LTS).

---

## 2) Clonar o abrir proyecto

```powershell
cd C:\Users\laion\OneDrive\Escritorio\Tareas\Tucualto\TuCualtoApp
```

---

## 3) Limpiar instalación previa (recomendado)

```powershell
Remove-Item -Recurse -Force .\node_modules -ErrorAction SilentlyContinue
Remove-Item -Force .\package-lock.json -ErrorAction SilentlyContinue
npm cache clean --force
```

---

## 4) Instalar dependencias

```powershell
npm install
```

---

## 5) Recompilar módulo nativo para Electron (si hace falta)

Si al abrir la app aparece error de `better-sqlite3` (`NODE_MODULE_VERSION`), ejecuta:

```powershell
npx electron-rebuild -f -w better-sqlite3
```

---

## 6) Ejecutar en desarrollo

```powershell
npm run dev
```

Esto abre la app de Electron en modo desarrollo.

---

## 7) Build de producción

```powershell
npm run build
```

Genera salida en `out\`.

---

## 8) Generar instalador

```powershell
npm run dist
```

Genera instalador en `release\` (según `electron-builder`).

---

## 9) Solución rápida de problemas

- **`electron-vite no se reconoce`**  
  Faltan dependencias: ejecuta `npm install`.

- **Error `better-sqlite3` / `NODE_MODULE_VERSION`**  
  Usa Node 20 y ejecuta `npx electron-rebuild -f -w better-sqlite3`.

- **`pwsh` no se reconoce**  
  Reinstala PowerShell 7 y reinicia terminal.

- **`EPERM` al instalar**  
  Cierra VS Code/Electron, pausa OneDrive temporalmente y reintenta.
