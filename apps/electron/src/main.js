const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');
const pty = require('node-pty');
const os = require('os');

let mainWindow;
let shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
let ptyProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../../web/out/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers para Terminal
ipcMain.handle('terminal:init', async () => {
  const cwd = path.join(os.homedir(), 'devfactory-workspace');

  ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: cwd,
  });

  return { success: true, cwd };
});

ipcMain.handle('terminal:write', async (event, data) => {
  if (ptyProcess) {
    ptyProcess.write(data);
  }
  return { success: true };
});

ipcMain.handle('terminal:read', async () => {
  return new Promise((resolve) => {
    if (ptyProcess) {
      const onData = (data) => {
        ptyProcess.removeListener('data', onData);
        resolve({ data: data.toString() });
      };
      ptyProcess.on('data', onData);
    }
  });
});

ipcMain.handle('terminal:resize', async (event, cols, rows) => {
  if (ptyProcess) {
    ptyProcess.resize(cols, rows);
  }
  return { success: true };
});

ipcMain.handle('terminal:kill', async () => {
  if (ptyProcess) {
    ptyProcess.kill();
    ptyProcess = null;
  }
  return { success: true };
});
