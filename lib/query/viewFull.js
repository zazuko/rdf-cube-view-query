const rdf = require('rdf-ext')
// const sparql = require('rdf-sparql-builder')
// const ns = require('../namespaces.js')

// @TODO handle lists
// @TODO see what happens with rdf-sparql-builder, it seems to not work in this way
function viewFullQuery ({ view, graph = rdf.defaultGraph() } = {}) {
  // const viewURI = `<${view.value}>`
  // const p = rdf.variable('p')
  // const o = rdf.variable('o')
  //
  // const sDimension = rdf.variable('sDimension')
  // const pDimension = rdf.variable('pDimension')
  // const oDimension = rdf.variable('oDimension')
  //
  // const sFrom = rdf.variable('sFrom')
  // const pFrom = rdf.variable('pFrom')
  // const oFrom = rdf.variable('oFrom')
  //
  // const sFilter = rdf.variable('sFilter')
  // const pFilter = rdf.variable('pFilter')
  // const oFilter = rdf.variable('oFilter')
  //
  // const sSource = rdf.variable('sSource')
  // const pSource = rdf.variable('pSource')
  // const oSource = rdf.variable('oSource')
  //
  // return sparql.construct([
  //   [viewURI, p, o],
  //   [sDimension, pDimension, oDimension],
  //   [sFrom, pFrom, oFrom],
  //   [sFilter, pFilter, oFilter],
  //   [sSource, pSource, oSource]
  // ])
  //   .from(graph)
  //   .where([
  //     [viewURI, p, o],
  //     sparql.union([
  //       [viewURI, ns.view.dimension, sDimension],
  //       [sDimension, pDimension, oDimension],
  //       sparql.optional([
  //         [sDimension, ns.view.from, sFrom],
  //         [sFrom, pFrom, oFrom]
  //       ])
  //     ]),
  //     sparql.union([
  //       [viewURI, ns.view.filter, sFilter],
  //       [sFilter, pFilter, oFilter],
  //       sparql.optional([
  //         [sFilter, ns.view.source, sSource],
  //         [sSource, pSource, oSource]
  //       ])
  //     ])
  //   ])
  //   .toString()

  return `PREFIX view: <https://cube.link/view/>

CONSTRUCT {
  <${view.value}> ?p ?o .
  ?sDimension ?pDimension ?oDimension .
  ?sFrom ?pFrom ?oFrom .
  ?sFilter ?pFilter ?oFilter .
  ?sSource ?pSource ?oSource .
} WHERE {
  { <${view.value}> ?p ?o . }
  UNION {
    <${view.value}> view:dimension ?sDimension .
    ?sDimension ?pDimension ?oDimension .
    OPTIONAL {
        ?sDimension view:from ?sFrom .
        ?sFrom ?pFrom ?oFrom .
    }
  }
  UNION {
    <${view.value}> view:filter ?sFilter .
    ?sFilter ?pFilter ?oFilter .
    OPTIONAL {
        ?sFilter view:source ?sSource .
        ?sSource ?pSource ?oSource .
    }
  }
}`
}

module.exports = viewFullQuery
