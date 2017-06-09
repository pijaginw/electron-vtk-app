'use strict';
var vtk = require('vtk.js');

const fullScreenRenderer = vtk.Testing.FullScreenRenderWindow.newInstance({ background: [0, 0, 0] });
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();
const AttributesData = vtk.Common.DataModel.vtkDataSetAttributes.newInstance();
const FieldDataTypes = vtk.Common.DataModel.vtkDataSet.newInstance();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

const coneSource = vtk.Filters.Sources.vtkConeSource.newInstance({ height: 1.0 });
const filter = vtk.Filters.General.Calculator.newInstance();
filter.setInputConnection(coneSource.getOutputPort());
// filter.setFormulaSimple(FieldDataTypes.CELL, [], 'random', () => Math.random());

filter.setFormula({
  getArrays: function getArrays(inputDataSets) {
    return {
      input: [],
      output: [{ location: FieldDataTypes.CELL, name: 'Random', dataType: 'Float32Array', attribute: AttributesData.SCALARS }]
    };
  },
  evaluate: function evaluate(arraysIn, arraysOut) {
    var _arraysOut$map = arraysOut.map(function (d) {
      return d.getData();
    }),
        _arraysOut$map2 = _slicedToArray(_arraysOut$map, 1),
        scalars = _arraysOut$map2[0];

    for (var i = 0; i < scalars.length; i++) {
      scalars[i] = Math.random();
    }
  }
});

const mapper = vtk.Rendering.Core.vtkMapper.newInstance();
mapper.setInputConnection(filter.getOutputPort());

const actor = vtk.Rendering.Core.vtkActor.newInstance();
actor.setMapper(mapper);
renderer.addActor(actor);
renderer.resetCamera();
renderWindow.render();


var representationSelector = document.querySelector('.representations');
var resolutionChange = document.querySelector('.resolution');
representationSelector.addEventListener('change', function (e) {
  var newRepValue = Number(e.target.value);
  actor.getProperty().setRepresentation(newRepValue);
  renderWindow.render();
});
resolutionChange.addEventListener('input', function (e) {
  var resolution = Number(e.target.value);
  coneSource.setResolution(resolution);
  renderWindow.render();
});

global.source = coneSource;
global.mapper = mapper;
global.actor = actor;
global.renderer = renderer;
global.renderWindow = renderWindow;