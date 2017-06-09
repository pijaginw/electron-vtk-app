'use strict';

var vtk = require('vtk.js');

var _vtk = require('../vtk');
var _vtk2 = _interopRequireDefault(_vtk);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------

var fullScreenRenderer = vtk.Testing.FullScreenRenderWindow.newInstance({ background: [0, 0, 0] });
var renderer = fullScreenRenderer.getRenderer();
var renderWindow = fullScreenRenderer.getRenderWindow();

// ----------------------------------------------------------------------------
// Inline PolyData definition
// ----------------------------------------------------------------------------

var polydata = _vtk2({
  vtkClass: 'vtkPolyData',
  points: {
    vtkClass: 'vtkPoints',
    data: {
      vtkClass: 'vtkDataArray',
      dataType: 'Float32Array',
      numberOfComponents: 3,
      values: [0, 0, 0, 1, 0, 0.25, 1, 1, 0, 0, 1, 0.25]
    }
  },
  polys: {
    vtkClass: 'vtkDataArray',
    dataType: 'Uint16Array',
    values: [3, 0, 1, 2, 3, 0, 2, 3]
  },
  pointData: {
    vtkClass: 'vtkDataSetAttributes',
    activeScalars: 0,
    arrays: [{
      data: {
        vtkClass: 'vtkDataArray',
        name: 'pointScalars',
        dataType: 'Float32Array',
        values: [0, 1, 0, 1]
      }
    }]
  },
  cellData: {
    vtkClass: 'vtkDataSetAttributes',
    activeScalars: 0,
    arrays: [{
      data: {
        vtkClass: 'vtkDataArray',
        name: 'cellScalars',
        dataType: 'Float32Array',
        values: [0, 1]
      }
    }]
  }
});

var mapper = vtk.Rendering.Core.vtkMapper.newInstance({ interpolateScalarsBeforeMapping: true });
mapper.setInputData(polydata);

var lut = mapper.getLookupTable();
lut.setHueRange(0.666, 0);

var actor = vtk.Rendering.Core.vtkActor.newInstance();
actor.setMapper(mapper);

renderer.addActor(actor);
renderer.resetCamera();
renderWindow.render();

// -----------------------------------------------------------
// Make some variables global so that you can inspect and
// modify objects in your browser's developer console:
// -----------------------------------------------------------

global.source = polydata;
global.mapper = mapper;
global.actor = actor;
global.lut = lut;
global.renderer = renderer;
global.renderWindow = renderWindow;