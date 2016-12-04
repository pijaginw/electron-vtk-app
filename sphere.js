const vtk = require('vtk.js');

const renderWindowContainer = document.querySelector('.renderwindow');

const ren = vtk.Rendering.Core.vtkRenderer.newInstance();
ren.setBackground(0.32, 0.34, 0.43);

const renWin = vtk.Rendering.Core.vtkRenderWindow.newInstance();
renWin.addRenderer(ren);

const glwindow = vtk.Rendering.OpenGL.vtkRenderWindow.newInstance();
glwindow.setContainer(renderWindowContainer);
renWin.addView(glwindow);

const iren = vtk.Rendering.Core.vtkRenderWindowInteractor.newInstance();
iren.setView(glwindow);

const actor = vtk.Rendering.Core.vtkActor.newInstance();
ren.addActor(actor);

const mapper = vtk.Rendering.Core.vtkMapper.newInstance();
actor.setMapper(mapper);

const cam = vtk.Rendering.Core.vtkCamera.newInstance();
ren.setActiveCamera(cam);
cam.setFocalPoint(0, 0, 0);
cam.setPosition(0, 0, 4);
cam.setClippingRange(0.1, 50.0);

const sphereSource = vtk.Filters.Sources.vtkSphereSource.newInstance();
mapper.setInputConnection(sphereSource.getOutputPort());
iren.initialize();
iren.bindEvents(renderWindowContainer, document);
iren.start();

// ----- JavaScript UI -----
['radius', 'thetaResolution', 'startTheta', 'endTheta',
    'phiResolution', 'startPhi', 'endPhi'].forEach(function(propertyName) {
    document.querySelector('.' + propertyName).addEventListener('input', function(e) {
        const value = Number(e.target.value);
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

