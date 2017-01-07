var vtk = require('vtk.js');

CONTROL_PANEL_WIDTH = 350;
SCROLLS = 25;
var w = window.innerWidth;
var h = window.innerHeight;

// lista aktorów -- zawiera dla kazdego aktora [source, x, y, z, mapper]
var SPHERES = [];
var CONES = [];
var available_actors = document.getElementById('available_actors');

function updateAvailableActorsList() {
    while (document.getElementsByTagName('option').length > 0) {
        removeEl = document.getElementsByTagName('option');
        available_actors.remove(removeEl);
    }

    for (var s = 0; s < SPHERES.length; s++) {
        newEl = document.createElement('option');
        available_actors.appendChild(newEl);
        newEl.innerHTML = SPHERES[s][0];
        newEl.value = SPHERES[s][0];
    }
    for (var c = 0; c < CONES.length; c++) {
        newEl = document.createElement('option');
        available_actors.appendChild(newEl);
        newEl.innerHTML = CONES[c][0];
        newEl.value = CONES[c][0];
    }
}

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

var camera = vtk.Rendering.Core.vtkCamera.newInstance();
ren.setActiveCamera(camera);
camera.setFocalPoint(0, 0, 0);
camera.setPosition(0, 0, 4);
camera.setClippingRange(0.1, 50.0);

var sphereSource = null;
renWin.render();

function createSphere(renderer, iren, renWin, con, camera) {
    var actor = vtk.Rendering.Core.vtkActor.newInstance();
    renderer.addActor(actor);
    var mapper = vtk.Rendering.Core.vtkMapper.newInstance();
    actor.setMapper(mapper);
    sphereSource = vtk.Filters.Sources.vtkSphereSource.newInstance();
    mapper.setInputConnection(sphereSource.getOutputPort());

    var pos = get_pos();
    actor.setPosition(pos[0], pos[1], pos[2]);

    if ((SPHERES.length == 0) && (CONES.length == 0)) {
        camera.setFocalPoint(0, 0, 0);
    } else {
        var xyz = get_focal_point();
        camera.setFocalPoint(xyz[0], xyz[1], xyz[2]);
    }
    var sphere_name = 'sphere' + (SPHERES.length+1);
    SPHERES.push([sphere_name, sphereSource, pos[0], pos[1], pos[2], mapper]);
    updateAvailableActorsList();

    iren.initialize();
    iren.bindEvents(con, document);
    iren.start();
    renWin.render();
}

function createCone(renderer, iren, renWin, con, camera) {
    var actor = vtk.Rendering.Core.vtkActor.newInstance();
    renderer.addActor(actor);
    console.log(actor.getPosition());
    var mapper = vtk.Rendering.Core.vtkMapper.newInstance();
    actor.setMapper(mapper);
    var coneSource = vtk.Filters.Sources.vtkConeSource.newInstance();
    mapper.setInputConnection(coneSource.getOutputPort());

    var pos = get_pos();
    actor.setPosition(pos[0], pos[1], pos[2]);

    if ((SPHERES.length == 0) && (CONES.length == 0)) {
        camera.setFocalPoint(0, 0, 0);
    } else {
        var xyz = get_focal_point();
        camera.setFocalPoint(xyz[0], xyz[1], xyz[2]);
    }
    var cone_name = 'cone' + (CONES.length+1);
    CONES.push([cone_name, coneSource, pos[0], pos[1], pos[2], mapper]);
    updateAvailableActorsList();

    iren.initialize();
    iren.bindEvents(con, document);
    iren.start();
    renWin.render();
}

function reload() {
    updateAvailableActorsList();
    const {ipcRenderer} = require('electron');
    ipcRenderer.sendSync('synchronous-message', 'reload');
    SPHERES = [];
    CONES = [];

    // ipcRenderer.on('asynchronous-reply', function(event, arg) {
    //   console.log(arg);
    // });
    // ipcRenderer.send('asynchronous-message', 'reload');
}

document.getElementById("add_sphere_button").addEventListener("click", function(){
    createSphere(ren, iren, renWin, renderWindowContainer, camera); });
document.getElementById("add_cone_button").addEventListener("click", function(){
    createCone(ren, iren, renWin, renderWindowContainer, camera); });
document.getElementById("clear_button").addEventListener("click", reload);
// document.getElementById("renderwindow").addEventListener("click", );  TODO pobranie pozycji kursora?

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

function get_pos() {
    var x = parseInt(document.getElementById("x_pos_s").value);
    var y = parseInt(document.getElementById("y_pos_s").value);
    var z = parseInt(document.getElementById("z_pos_s").value);
    return [x, y, z];
}

function get_focal_point() {
    var sum_x = 0;
    var sum_y = 0;
    var sum_z = 0;
    var i;
    for (i = 0; i < SPHERES.length; i++) {
        sum_x += SPHERES[i][2];
        sum_y += SPHERES[i][3];
        sum_z += SPHERES[i][4];
    }
    if (SPHERES.length != 0) {
        sum_x = sum_x / SPHERES.length;
        sum_y = sum_y / SPHERES.length;
        sum_z = sum_z / SPHERES.length;
    }

    var sum_x2 = 0;
    var sum_y2 = 0;
    var sum_z2 = 0;
    for (i = 0; i < CONES.length; i++) {
        sum_x2 += CONES[i][2];
        sum_y2 += CONES[i][3];
        sum_z2 += CONES[i][4];
    }
    if (CONES.length != 0) {
        sum_x2 = sum_x2 / CONES.length;
        sum_y2 = sum_y2 / CONES.length;
        sum_z2 = sum_z2 / CONES.length;
    }

    return [(sum_x+sum_x2)/2.0, (sum_y+sum_y2)/2.0, (sum_z+sum_z2)/2.0];
}