# Minsky Monitor — App de Windows

App de escritorio para Windows basada en Electron.
Auto-actualización desde GitHub Releases.

---

## Setup inicial (una sola vez)

### 1. Requisitos
- [Node.js 20+](https://nodejs.org) — descargar e instalar
- [Git](https://git-scm.com) — para subir a GitHub

### 2. Crear el repositorio en GitHub
1. Ir a github.com → "New repository"
2. Nombre: `minsky-monitor`
3. Visibilidad: **Private** (recomendado para uso interno)
4. NO inicializar con README

### 3. Subir el proyecto
```bash
cd minsky-app
git init
git add .
git commit -m "v1.0.0 — primera versión"
git remote add origin https://github.com/TU_USUARIO/minsky-monitor.git
git push -u origin main
```

### 4. Editar package.json
Reemplazar `TU_USUARIO_GITHUB` con tu usuario real de GitHub:
```json
"publish": {
  "owner": "TU_USUARIO_GITHUB",
  ...
}
```

### 5. Instalar dependencias
```bash
npm install
```

### 6. Probar en desarrollo
```bash
npm start
```

---

## Generar el instalador .exe

### Opción A — Local (en tu PC con Windows)
```bash
npm run build
```
El instalador queda en `/dist/Minsky Monitor Setup 1.0.0.exe`

### Opción B — GitHub Actions (automático, recomendado)
```bash
git tag v1.0.0
git push --tags
```
GitHub Actions compila automáticamente y publica el `.exe` en GitHub Releases.
Tu socio descarga el instalador desde ahí.

---

## Publicar una actualización

1. Editar la versión en `package.json`:
   ```json
   "version": "1.0.1"
   ```
2. Hacer commit y tag:
   ```bash
   git add .
   git commit -m "v1.0.1 — descripción de cambios"
   git tag v1.0.1
   git push && git push --tags
   ```
3. GitHub Actions compila y publica el nuevo instalador automáticamente.
4. La app instalada en la PC de tu socio detecta la actualización al abrirse y la descarga sola.

---

## Estructura del proyecto

```
minsky-app/
├── main.js              — Proceso principal de Electron
├── preload.js           — Bridge seguro entre Electron y la app
├── package.json         — Config de la app y electron-builder
├── LICENSE.txt          — Requerido por el instalador NSIS
├── .github/
│   └── workflows/
│       └── release.yml  — Auto-build en GitHub Actions
├── assets/
│   ├── icon.ico         — Ícono de la app (Windows)
│   └── icon.png         — Ícono PNG
└── src/
    ├── index.html       — Minsky Monitor (la herramienta completa)
    └── updater.js       — Notificaciones de actualización en la UI
```

---

## Íconos (requeridos para el build)

Antes de hacer build, necesitás colocar en `/assets/`:
- `icon.ico` — 256×256px, formato ICO (para Windows)
- `icon.png` — 512×512px, formato PNG

Podés generarlos gratis en: https://icoconvert.com

---

## Notas importantes

- **Auto-updater**: solo funciona con builds firmados o con `verifyUpdateCodeSignature: false` (ya configurado).
- **GitHub Token**: el workflow usa `GITHUB_TOKEN` automático, no necesitás crear uno manual.
- **Privacidad**: el repositorio privado oculta el código fuente, pero los Releases son públicos por defecto. Si querés restringir la descarga, cambiá a un repo privado con releases privados.
