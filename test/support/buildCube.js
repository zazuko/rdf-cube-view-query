import Cube from '../../lib/Cube.js'
import Source from '../../lib/Source.js'
import buildCubeDimension from './buildCubeDimension.js'
import * as ns from './namespaces.js'

export function buildCube({ term, endpointUrl = ns.ex.endpoint, dimensions = [] } = {}) {
  const source = new Source({ endpointUrl })
  const cube = new Cube({ term, parent: source, source })

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
