const vtk = require('vtk.js');
const renderWindowContainer = document.querySelector('.renderwindow');

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
    document.getElementById(propertyName).addEventListener('input', function (e) {
        var value = Number(e.target.value);
        switch (propertyName){
            case 'height':
                coneSource.set({ height: value });
                break;
            case 'radius':
                coneSource.set({ radius: value });
                break;
            case 'resolution':
                coneSource.set({ resolution: value });
                break;
        }
        renWin.render();
    });
});
document.getElementById('capping').addEventListener('change', function (e) {
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
