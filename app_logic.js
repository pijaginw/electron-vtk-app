var vtk = require('vtk.js');

CONTROL_PANEL_WIDTH = 350;
SCROLLS = 25;
var w = window.innerWidth;
var h = window.innerHeight;

// lista aktorów -- zawiera dla kazdego aktora [nazwa, source, x, y, z, mapper]
var SPHERES = [];
var CONES = [];
var available_actors = document.getElementById('available_actors');

function updateAvailableActorsList() {
    // while (document.getElementsByTagName('option').length > 0) {
    for(var i = document.getElementsByTagName('option').length-1; i > 0 ; i--) {
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
    clear_pos();

    if ((SPHERES.length == 0) && (CONES.length == 0)) {
        camera.setFocalPoint(0, 0, 0);
    } else {
        var xyz = get_focal_point();
        camera.setFocalPoint(xyz[0], xyz[1], xyz[2]);
    }
    var sphere_name = 'sphere' + (SPHERES.length+1);
    SPHERES.push([sphere_name, sphereSource, pos[0], pos[1], pos[2], actor, mapper]);
    updateAvailableActorsList();

    iren.initialize();
    iren.bindEvents(con, document);
    iren.start();
    renWin.render();
}

function createCone(renderer, iren, renWin, con, camera) {
    var actor = vtk.Rendering.Core.vtkActor.newInstance();
    renderer.addActor(actor);
    var mapper = vtk.Rendering.Core.vtkMapper.newInstance();
    actor.setMapper(mapper);
    var coneSource = vtk.Filters.Sources.vtkConeSource.newInstance();
    mapper.setInputConnection(coneSource.getOutputPort());

    var pos = get_pos();
    actor.setPosition(pos[0], pos[1], pos[2]);
    clear_pos();

    if ((SPHERES.length == 0) && (CONES.length == 0)) {
        camera.setFocalPoint(0, 0, 0);
    } else {
        var xyz = get_focal_point();
        camera.setFocalPoint(xyz[0], xyz[1], xyz[2]);
    }
    var cone_name = 'cone' + (CONES.length+1);
    CONES.push([cone_name, coneSource, pos[0], pos[1], pos[2], actor, mapper]);
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
    createSphere(ren, iren, renWin, renderWindowContainer, camera);
});
document.getElementById("add_cone_button").addEventListener("click", function(){
    createCone(ren, iren, renWin, renderWindowContainer, camera);
});
document.getElementById("clear_button").addEventListener("click", reload);


function create_param(param_name, param_type, min, max, step, value) {
    var controls = document.getElementById('controls');
    var new_tr = document.createElement('tr');
    var new_td_title = document.createElement('td');
    new_td_title.innerHTML = param_name;
    var new_td = document.createElement('td');
    var new_param = document.createElement('input');
    new_param.class = param_name;
    new_param.id = param_name;
    new_param.type = param_type;
    new_param.min = min;
    new_param.max = max;
    new_param.step = step;
    new_param.value = value;
    new_td.appendChild(new_param);
    new_tr.appendChild(new_td_title);
    new_tr.appendChild(new_td);
    controls.appendChild(new_tr);
    return new_param;
}

function create_params_for_sphere(idx) {
    var x_pos_s = create_position_params('x', 'sphere');
    var y_pos_s = create_position_params('y', 'sphere');
    var z_pos_s = create_position_params('z', 'sphere');
    x_pos_s.addEventListener('input', function (e) {  // TODO: dodać obsługę ujemnych wartości
        var y_value = Number(document.getElementById('y_pos_s').value);
        var z_value = Number(document.getElementById('z_pos_s').value);
        if (y_value == null) {
            y_value = 0;
        }
        if (z_value == null) {
            z_value = 0;
        }
        var value = Number(e.target.value);
        SPHERES[idx][5].setPosition(value, y_value, z_value);
        renWin.render();
    });
    y_pos_s.addEventListener('input', function (e) {
        var x_value = Number(document.getElementById('x_pos_s').value);
        var z_value = Number(document.getElementById('z_pos_s').value);
        if (x_value == null) {
            x_value = 0;
        }
        if (z_value == null) {
            z_value = 0;
        }
        var value = Number(e.target.value);
        SPHERES[idx][5].setPosition(x_value, value, z_value);
        renWin.render();
    });
    z_pos_s.addEventListener('input', function (e) {
        var x_value = Number(document.getElementById('x_pos_s').value);
        var y_value = Number(document.getElementById('y_pos_s').value);
        if (x_value == null) {
            x_value = 0;
        }
        if (y_value == null) {
            y_value = 0;
        }
        var value = Number(e.target.value);
        SPHERES[idx][5].setPosition(x_value, y_value, value);
        renWin.render();
    });
    var radius = create_param('radius', 'range', '0.1', '1.5', '0.1', '0.5');
    radius.addEventListener('input', function (e) {
        var value = Number(e.target.value);
        SPHERES[idx][1].set({radius: value});
        renWin.render();
    });
    var thetaResolution = create_param('thetaResolution', 'range', '4', '100', '1', '8');
    thetaResolution.addEventListener('input', function (e) {
        var value = Number(e.target.value);
        SPHERES[idx][1].set({thetaResolution: value});
        renWin.render();
    });
    var startTheta = create_param('startTheta', 'range', '0', '360', '1', '0');
    startTheta.addEventListener('input', function (e) {
        var value = Number(e.target.value);
        SPHERES[idx][1].set({startTheta: value});
        renWin.render();
    });
    var endTheta = create_param('endTheta', 'range', '0', '360', '1', '360');
    endTheta.addEventListener('input', function (e) {
        var value = Number(e.target.value);
        SPHERES[idx][1].set({endTheta: value});
        renWin.render();
    });
    var phiResolution = create_param('phiResolution', 'range', '4', '100', '1', '8');
    phiResolution.addEventListener('input', function (e) {
        var value = Number(e.target.value);
        SPHERES[idx][1].set({phiResolution: value});
        renWin.render();
    });
    var startPhi = create_param('startPhi', 'range', '0', '360', '1', '0');
    startPhi.addEventListener('input', function (e) {
        var value = Number(e.target.value);
        SPHERES[idx][1].set({startPhi: value});
        renWin.render();
    });
    var endPhi = create_param('endPhi', 'range', '0', '180', '1', '180');
    endPhi.addEventListener('input', function (e) {
        var value = Number(e.target.value);
        SPHERES[idx][1].set({endPhi: value});
        renWin.render();
    });
}

function create_params_for_cone(idx) {
    var x_pos_c = create_position_params('x', 'cone');
    var y_pos_c = create_position_params('y', 'cone');
    var z_pos_c = create_position_params('z', 'cone');
    x_pos_c.addEventListener('input', function (e) {  // TODO: dodać obsługę ujemnych wartości
        var y_value = Number(document.getElementById('y_pos_c').value);
        var z_value = Number(document.getElementById('z_pos_c').value);
        if (y_value == null) {
            y_value = 0;
        }
        if (z_value == null) {
            z_value = 0;
        }
        var value = Number(e.target.value);
        CONES[idx][5].setPosition(value, y_value, z_value);
        renWin.render();
    });
    y_pos_c.addEventListener('input', function (e) {
        var x_value = Number(document.getElementById('x_pos_c').value);
        var z_value = Number(document.getElementById('z_pos_c').value);
        if (x_value == null) {
            x_value = 0;
        }
        if (z_value == null) {
            z_value = 0;
        }
        var value = Number(e.target.value);
        CONES[idx][5].setPosition(x_value, value, z_value);
        renWin.render();
    });
    z_pos_c.addEventListener('input', function (e) {
        var x_value = Number(document.getElementById('x_pos_c').value);
        var y_value = Number(document.getElementById('y_pos_c').value);
        if (x_value == null) {
            x_value = 0;
        }
        if (y_value == null) {
            y_value = 0;
        }
        var value = Number(e.target.value);
        CONES[idx][5].setPosition(x_value, y_value, value);
        renWin.render();
    });
    var height = create_param('height', 'range', '0.5', '2.0', '0.1', '1.0');
    height.addEventListener('input', function (e) {
        var value = Number(e.target.value);
        CONES[idx][1].set({height: value});
        renWin.render();
    });
    var radius = create_param('radius', 'range', '0.1', '1.5', '0.1', '0.5');
    radius.addEventListener('input', function (e) {
        var value = Number(e.target.value);
        CONES[idx][1].set({radius: value});
        renWin.render();
    });
    var resolution = create_param('resolution', 'range', '4', '100', '1', '6');
    resolution.addEventListener('input', function (e) {
        var value = Number(e.target.value);
        CONES[idx][1].set({resolution: value});
        renWin.render();
    });
}

// usuwa parametry przy zmianie wyboru renderowanego kształtu
function clear_parameters() {
    var controls = document.getElementById('controls');
    while (controls.hasChildNodes()) {
        controls.removeChild(controls.lastChild);
    }
}

function create_position_params(axis, shape_type) {
    var param_name = axis + '_pos_' + shape_type[0];
    var new_tr = document.createElement('tr');
    var new_td_title = document.createElement('td');
    new_td_title.innerHTML = axis + ":";
    var new_td = document.createElement('td');
    var new_pos = document.createElement('input');
    new_pos.class = param_name;
    new_pos.id = param_name;
    new_pos.value = 0;
    new_td.appendChild(new_pos);
    new_tr.appendChild(new_td_title);
    new_tr.appendChild(new_td);
    controls.appendChild(new_tr);
    return new_pos;
}

document.getElementById('available_actors').addEventListener('change', function(e){
    clear_parameters();
    var selected_actor = e.target.value;
    if (selected_actor.startsWith('sphere') == true) {
        create_params_for_sphere(get_actor_idx(SPHERES, selected_actor));
    } else if (selected_actor.startsWith('cone') == true) {
        create_params_for_cone(get_actor_idx(CONES, selected_actor));
    }
});

function get_actor_idx(actors, el) {
    for (var i=0; i < actors.length; i++) {
        if (actors[i][0] == el) {
            return i;
        }
    }
    return -1;
}

function get_pos() {
    var x = parseInt(document.getElementById("x_pos").value);
    var y = parseInt(document.getElementById("y_pos").value);
    var z = parseInt(document.getElementById("z_pos").value);
    return [x, y, z];
}

function clear_pos() {
    document.getElementById("x_pos").value = 0;
    document.getElementById("y_pos").value = 0;
    document.getElementById("z_pos").value = 0;
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