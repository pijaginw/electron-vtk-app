const electron = require('electron');
const app = electron.app;
const path = require('path');
const url = require('url');
const BrowserWindow = electron.BrowserWindow;

const vtk = require('vtk.js');

let mainWindow;

function createWindow () {
    mainWindow = new BrowserWindow({width: 800, height: 600, offscreen: true});

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'controlPanel.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.webContents.openDevTools();

    // const {ipcMain} = require('electron');
    // ipcMain.on('asynchronous-message', (event, arg) => {
    //   event.sender.send('asynchronous-reply', '');
    // })
    // ipcMain.on('synchronous-message', (event, arg) => {
    //     event.returnValue = '';
    // })

  // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
});
