var vtk = require('vtk.js');

var renderWindowContainer = document.querySelector('.renderwindow');

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

var sphereSource = vtk.Filters.Sources.vtkSphereSource.newInstance();
mapper.setInputConnection(sphereSource.getOutputPort());
iren.initialize();
iren.bindEvents(renderWindowContainer, document);
iren.start();

// ----- JavaScript UI -----
['radius', 'thetaResolution', 'startTheta', 'endTheta',
    'phiResolution', 'startPhi', 'endPhi'].forEach(function(propertyName) {
    document.querySelector('.' + propertyName).addEventListener('input', function(e) {
        var value = Number(e.target.value);
        switch (propertyName){
        case 'radius':
            sphereSource.set({ radius: value });
            break;
        case 'thetaResolution':
            sphereSource.set({ thetaResolution: value });
            break;
        case 'startTheta':
            sphereSource.set({ startTheta: value });
            break;
        case 'endTheta':
            sphereSource.set({ endTheta: value });
            break;
        case 'phiResolution':
            sphereSource.set({ phiResolution: value });
            break;
        case 'startPhi':
            sphereSource.set({ startPhi: value });
            break;
        case 'endPhi':
            sphereSource.set({ endPhi: value });
            break;
        }
        renWin.render();
    });
});

