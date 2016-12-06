'use strict';
var vtk = require('vtk.js');
var macro = require('vtk.js/Sources/macro.js');

const renderWindowContainer = document.querySelector('.renderwindow');

const ren = vtk.Rendering.Core.vtkRenderer.newInstance();
ren.setBackground(0.32, 0.34, 0.43);

const renWin = vtk.Rendering.Core.vtkRenderWindow.newInstance();
renWin.addRenderer(ren);

const glwindow = vtk.Rendering.OpenGL.vtkRenderWindow.newInstance();
glwindow.setSize(500, 500);
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
cam.setPosition(0, 0, 10);
cam.setClippingRange(0.1, 50.0);


var sphereSource = vtk.Filters.Sources.vtkSphereSource.newInstance({ thetaResolution: 40, phiResolution: 41 });
var filter = vtk.Filters.General.WarpScalar.newInstance({ scaleFactor: 0, useNormal: false });

var randFilter = macro.newInstance(function (publicAPI, model) {
    macro.obj(publicAPI, model); // make it an object
    macro.algo(publicAPI, model, 1, 1); // mixin algorithm code 1 in, 1 out
    publicAPI.requestData = function (inData, outData) {
        // implement requestData
        if (!outData[0] || inData[0].getMTime() > outData[0].getMTime()) {
            var newArray = new Float32Array(inData[0].getPoints().getNumberOfTuples());
            for (var i = 0; i < newArray.length; i++) {
                newArray[i] = i % 2 ? 1 : 0;
            }
            var da = vtk.Common.Core.vtkDataArray.newInstance({ values: newArray });
            da.setName('spike');
            var outDS = inData[0].shallowCopy();
            outDS.getPointData().addArray(da);
            outDS.getPointData().setActiveScalars(da.getName());
            outData[0] = outDS;
        }
    };
})();
randFilter.setInputConnection(sphereSource.getOutputPort());
filter.setInputConnection(randFilter.getOutputPort());
mapper.setInputConnection(filter.getOutputPort());
// Select array to process
filter.setInputArrayToProcess(0, 'spike', 'PointData', 'Scalars');
// Initialize interactor and start
iren.initialize();
iren.bindEvents(renderWindowContainer, document);
iren.start();

// ----------------
// Warp setup
['scaleFactor'].forEach(function(propertyName) {
  document.querySelector('.' + propertyName).addEventListener('input', function(e) {
    const value = Number(e.target.value);
    filter.set({ scaleFactor: value });
    renWin.render();
  });
});
document.querySelector('.useNormal').addEventListener('change', function(e) {
  const useNormal = !!(e.target.checked);
  filter.set({ useNormal });
  renWin.render();
});
// Sphere setup
['radius', 'thetaResolution', 'phiResolution'].forEach(function(propertyName) {
  document.querySelector('.' + propertyName).addEventListener('input', function(e) {
      const value = Number(e.target.value);
      switch (propertyName){
            case 'radius':
                sphereSource.set({ radius: value });
                break;
            case 'thetaResolution':
                sphereSource.set({ thetaResolution: value });
                break;
            case 'phiResolution':
                sphereSource.set({ phiResolution: value });
                break;
        }
    renWin.render();
  });
});
