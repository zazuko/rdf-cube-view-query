const Cube = require('../../lib/Cube')
const Source = require('../../lib/Source')
const buildCubeDimension = require('./buildCubeDimension')
const ns = require('./namespaces')

function buildCube ({ dimensions = [] } = {}) {
  const source = new Source({ endpointUrl: ns.ex.endpoint })
  const cube = new Cube({ parent: source })

  cube.ptr
    .addOut(ns.rdf.type, ns.cube.Cube)
    .addOut(ns.cube.observationConstraint, shape => {
      shape.addOut(ns.sh.property, property => {
        property
          .addOut(ns.sh.path, ns.rdf.type)
          .addList(ns.sh.in, [ns.cube.Observation])
      })

      for (const dimension of dimensions) {
        shape.addOut(ns.sh.property, property => {
          buildCubeDimension({ shape: property, ...dimension })
        })
      }
    })

  return cube
}

module.exports = buildCube
