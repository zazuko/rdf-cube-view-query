const rdf = require('rdf-ext')

// @TODO see what happens with rdf-sparql-builder,
// I had problems with the following
//     sparql.union([
//       [viewURI, ns.view.dimension, sDimension],
//       [sDimension, pDimension, oDimension],
//       sparql.optional([
//         [sDimension, ns.view.from, sFrom],
//         [sFrom, pFrom, oFrom]
//       ])
//     ]),

function viewFullQuery ({ view, graph = rdf.defaultGraph() } = {}) {
  return `#pragma describe.strategy cbd 
DESCRIBE <${view.value}>`

  // There is some data I'm not fetching. I don't know exactly what is it.

//   return `PREFIX view: <https://cube.link/view/>
//
// CONSTRUCT {
//   <${view.value}> ?p ?o .
//
//   ?sDimension view:from ?dimensionFrom .
//   ?sDimension view:as ?dimensionAs .
//
//   ?dimensionFrom view:path ?dimensionFromPath .
//   ?dimensionFrom view:source ?dimensionFromSource .
//
//   ?dimensionFromSource a view:CubeSource .
//   ?dimensionFromSource view:cube ?cube .
//   ?dimensionFromSource view:endpoint ?endpoint .
//
//
//   ?sFilter a view:Filter .
//   ?sFilter view:argument ?sFilterArgument .
//   ?sFilter view:dimension ?sFilterDimension .
//   ?sFilter view:operation ?sFilterOperation .
//
// } WHERE {
//   { <${view.value}> ?p ?o . }
//   UNION {
//     <${view.value}> view:dimension ?sDimension .
//        ?sDimension view:from ?dimensionFrom .
//        ?sDimension view:as ?dimensionAs .
//     OPTIONAL {
//         ?dimensionFrom view:path ?dimensionFromPath .
//         ?dimensionFrom view:source ?dimensionFromSource .
//
//         OPTIONAL {
//             ?dimensionFromSource a view:CubeSource .
//             ?dimensionFromSource view:cube ?cube .
//             ?dimensionFromSource view:endpoint ?endpoint .
//         }
//     }
//   }
//   UNION {
//     ?sFilter a view:Filter .
//     <${view.value}> view:filter ?sFilter .
//     OPTIONAL {
//         ?sFilter view:argument ?sFilterArgument .
//     }
//     OPTIONAL {
//         ?sFilter view:dimension ?sFilterDimension .
//     }
//     OPTIONAL {
//         ?sFilter view:operation ?sFilterOperation .
//     }
//   }
// }`
}

module.exports = viewFullQuery
