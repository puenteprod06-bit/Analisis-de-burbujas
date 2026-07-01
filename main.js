const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const log = require('electron-log');

// ── Logging ────────────────────────────────────────────────────────────────
log.transports.file.level = 'info';
autoUpdater.logger = log;
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// ── Versión actual ──────────────────────────────────────────────────────────
const VERSION = app.getVersion();

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1600,
        height: 900,
        minWidth: 900,
        minHeight: 600,
        title: `Minsky Monitor v${VERSION}`,
        backgroundColor: '#0a0a0a',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            // Permitir fetch a APIs externas (Finnhub, Treasury)
            webSecurity: true,
        },
        // Icono de la app
        icon: path.join(__dirname, 'assets', 'icon.png'),
        show: false, // mostrar solo cuando esté listo (evita flash blanco)
    });

    // Cargar la herramienta
    mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

    // Mostrar cuando esté listo para evitar pantalla en blanco
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        // Verificar actualizaciones al abrir
        if (!isDev()) {
            setTimeout(() => autoUpdater.checkForUpdates(), 3000);
        }
    });

    // Abrir links externos en el browser del sistema, no en Electron
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    buildMenu();
}

function buildMenu() {
    const template = [
        {
            label: 'Minsky Monitor',
            submenu: [
                {
                    label: `Versión ${VERSION}`,
                    enabled: false,
                },
                { type: 'separator' },
                {
                    label: 'Buscar actualizaciones',
                    click: () => {
                        autoUpdater.checkForUpdates();
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'Actualizaciones',
                            message: 'Verificando actualizaciones en GitHub...',
                            buttons: ['OK'],
                        });
                    },
                },
                { type: 'separator' },
                { role: 'quit', label: 'Salir' },
            ],
        },
        {
            label: 'Vista',
            submenu: [
                { role: 'reload', label: 'Recargar' },
                { role: 'forceReload', label: 'Forzar recarga' },
                { type: 'separator' },
                { role: 'resetZoom', label: 'Zoom normal' },
                { role: 'zoomIn', label: 'Acercar' },
                { role: 'zoomOut', label: 'Alejar' },
                { type: 'separator' },
                { role: 'togglefullscreen', label: 'Pantalla completa' },
            ],
        },
        {
            label: 'Herramientas',
            submenu: [
                {
                    label: 'Abrir DevTools',
                    accelerator: 'F12',
                    click: () => mainWindow.webContents.toggleDevTools(),
                },
            ],
        },
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ── Auto-updater events ────────────────────────────────────────────────────
autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info.version);
    mainWindow.webContents.send('update-status', {
        type: 'available',
        version: info.version,
        message: `Nueva versión ${info.version} disponible. Descargando...`,
    });
});

autoUpdater.on('update-not-available', () => {
    log.info('No updates available');
});

autoUpdater.on('download-progress', (progress) => {
    mainWindow.webContents.send('update-status', {
        type: 'progress',
        percent: Math.round(progress.percent),
        message: `Descargando actualización: ${Math.round(progress.percent)}%`,
    });
    mainWindow.setProgressBar(progress.percent / 100);
});

autoUpdater.on('update-downloaded', (info) => {
    mainWindow.setProgressBar(-1);
    log.info('Update downloaded:', info.version);
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Actualización lista',
        message: `Versión ${info.version} descargada.`,
        detail: 'La actualización se instalará cuando cierres la aplicación.',
        buttons: ['Instalar ahora', 'Instalar al cerrar'],
        defaultId: 0,
    }).then(({ response }) => {
        if (response === 0) {
            autoUpdater.quitAndInstall();
        }
    });
});

autoUpdater.on('error', (err) => {
    log.error('Auto-updater error:', err.message);
});

// ── IPC ────────────────────────────────────────────────────────────────────
ipcMain.handle('get-version', () => VERSION);

ipcMain.handle('check-updates', () => {
    if (!isDev()) autoUpdater.checkForUpdates();
});

// ── Helpers ────────────────────────────────────────────────────────────────
function isDev() {
    return !app.isPackaged;
}

// ── App lifecycle ──────────────────────────────────────────────────────────
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
