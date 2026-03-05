
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Gérer la création/suppression de raccourcis sur Windows lors de l'installation.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Création de la fenêtre principale
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    autoHideMenuBar: true, // Cache la barre de menu (Fichier, Aide, etc.)
    icon: path.join(__dirname, '../public/logo2.jpg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  // Chargement de l'URL ou du fichier
  if (app.isPackaged) {
    // Mode Production
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    // Mode Développement (Vite sur le port 8001)
    mainWindow.loadURL('http://localhost:5000').catch((err) => {
      console.error("Impossible de charger l'URL, le serveur Vite est-il lancé ?", err);
    });

    // Optionnel : Ouvre les outils de développement manuellement si besoin
    // mainWindow.webContents.openDevTools();
  }
};

// Initialisation d'Electron
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quitter quand toutes les fenêtres sont fermées (sauf sur macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- Gestionnaires IPC (Communication) ---

ipcMain.handle('get-app-info', () => {
  return {
    name: 'School Statistics - Inspection',
    version: app.getVersion(),
    platform: process.platform,
  };
});

ipcMain.handle('minimize-window', () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) window.minimize();
});

ipcMain.handle('maximize-window', () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  }
});

ipcMain.handle('close-window', () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) window.close();
});