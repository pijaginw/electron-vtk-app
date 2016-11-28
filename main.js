const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

var vtk = require('vtk.js')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'controlPanel.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
var test = `HTTP
Coś
`;
  mainWindow.on('did-finish-load', function() {
    console.info('wykonało się !')
    var renderWindowContainer = document.querySelector('.renderwidow');
    // ----------------------
    var ren = vtk.Rendering.Core.vtkRenderer.newInstance();
    ren.setBackground(0.32, 0.34, 0.43);
    var renWin = vtk.Rendering.Core.vtkRenderWindow.newInstance();
    renWin.addRenderer(ren);
    var glwindow = vtk.Rendering.OpenGL.vtkRenderWindow.newInstance();
    glwindow.setContainer(renderWindowContainer);
    renWin.addView(glwindow);
    var iren = vtk.Rendering.Core.vtkRenderWindowInteractor.newInstance();
    iren.setView(glwindow);
    var actor = vtk.Rendering.Core.vtkActor.newInstance();
    ren.addActor(actor);
    var mapper = vtk.Rendering.Core.vtkMapper.newInstance();
    actor.setMapper(mapper);
    var cam = vtk.Rendering.Core.vtkCamera.newInstance();
    ren.setActiveCamera(cam);
    cam.setFocalPoint(0, 0, 0);
    cam.setPosition(0, 0, 4);
    cam.setClippingRange(0.1, 50.0);
    var coneSource = vtk.Filters.Sources.vtkConeSource.newInstance();
    mapper.setInputConnection(coneSource.getOutputPort());
    iren.initialize();
    iren.bindEvents(renderWindowContainer, document);
    iren.start();

    // ----- JavaScript UI -----
    ['height', 'radius', 'resolution'].forEach(function (propertyName) {
      document.querySelector('.' + propertyName).addEventListener('input', function (e) {
        var value = Number(e.target.value);
        coneSource.set( {propertyName: value} );
        renWin.render();
      });
    });
    document.querySelector('.capping').addEventListener('change', function (e) {
      var capping = !!e.target.checked;
      coneSource.set({ capping: capping });
      renWin.render();
    });

    // ----- Console play ground -----
    global.coneSource = coneSource;
    global.mapper = mapper;
    global.actor = actor;
    global.renderer = ren;
    global.renderWindow = renWin;
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
