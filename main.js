const electron = require('electron');
const app = electron.app;
const path = require('path');
const url = require('url');
const BrowserWindow = electron.BrowserWindow;

const vtk = require('vtk.js');

"use strict";
var mainWindow = void 0;

function createWindow () {
    mainWindow = new BrowserWindow({width: 1200, height: 900, offscreen: true});

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'controlPanel.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

const {ipcMain} = require('electron');
// ipcMain.on('asynchronous-message', function(event, arg) {
//     if (arg == "reload") {
//         event.sender.send('asynchronous-reply', '');
//         mainWindow.reload();
//     }
// });
ipcMain.on('synchronous-message', function(event, arg) {
    if (arg == "reload") {
        event.sender.send('asynchronous-reply', '');
        event.returnValue = '';
        mainWindow.reload();
    }
});

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
