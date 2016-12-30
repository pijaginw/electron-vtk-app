var vtk = require('vtk.js');

CONTROL_PANEL_WIDTH = 350;
SCROLLS = 25;
var w = window.innerWidth;
var h = window.innerHeight;

// lista aktorów -- zawiera dla kazdego aktora [source, x, y, z, mapper]
ACTORS = [];

var renderWindowContainer = document.querySelector('.renderwindow');
var ren = vtk.Rendering.Core.vtkRenderer.newInstance();
ren.setBackground(0.32, 0.34, 0.43);
var renWin = vtk.Rendering.Core.vtkRenderWindow.newInstance();
renWin.addRenderer(ren);

var glwindow = vtk.Rendering.OpenGL.vtkRenderWindow.newInstance();
glwindow.setContainer(renderWindowContainer);
glwindow.setSize(w-CONTROL_PANEL_WIDTH-SCROLLS, h-SCROLLS);
renWin.addView(glwindow);

var iren = vtk.Rendering.Core.vtkRenderWindowInteractor.newInstance();
iren.setView(glwindow);

var cam = vtk.Rendering.Core.vtkCamera.newInstance();
ren.setActiveCamera(cam);
cam.setFocalPoint(0, 0, 0);
cam.setPosition(0, 0, 4);
cam.setClippingRange(0.1, 50.0);

var sphereSource = null;
renWin.render();

function addNewSphere(renderer, iren, renWin, con, camera) {
    var new_actor = [];
    var actor = vtk.Rendering.Core.vtkActor.newInstance();
    renderer.addActor(actor);
    var mapper = vtk.Rendering.Core.vtkMapper.newInstance();
    actor.setMapper(mapper);
    sphereSource = vtk.Filters.Sources.vtkSphereSource.newInstance();
    mapper.setInputConnection(sphereSource.getOutputPort());

    x = parseInt(document.getElementById("x_pos_s").value);
    y = parseInt(document.getElementById("y_pos_s").value);
    z = parseInt(document.getElementById("z_pos_s").value);
    actor.setPosition(x,y,z);

    camera.setFocalPoint(x, y, z);
    iren.initialize();
    iren.bindEvents(con, document);
    iren.start();
    renWin.render();
}

function addNewCone(renderer, iren, renWin, con) {
    var actor = vtk.Rendering.Core.vtkActor.newInstance();
    renderer.addActor(actor);
    console.log(actor.getPosition());
    var mapper = vtk.Rendering.Core.vtkMapper.newInstance();
    actor.setMapper(mapper);
    coneSource = vtk.Filters.Sources.vtkConeSource.newInstance();
    mapper.setInputConnection(coneSource.getOutputPort());

    iren.initialize();
    iren.bindEvents(con, document);
    iren.start();
    renWin.render();
}

document.getElementById("add_sphere_button").addEventListener("click", function(){
    addNewSphere(ren, iren, renWin, renderWindowContainer, cam); });
document.getElementById("add_cone_button").addEventListener("click", function(){
    addNewCone(ren, iren, renWin, renderWindowContainer); });

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
