const clownface = require('clownface')
const ns = require('./namespaces.js')
const Source = require('./Source.js')
const View = require('./View.js')

function getSourceFromData (term, dataset) {
  const cf = clownface({ term, dataset })
  const sourceTerm = cf.node(ns.view.CubeSource).in(ns.rdf.type).term
  if (!sourceTerm) {
    throw Error('Needs source')
  }
  const srcPtr = cf.node(sourceTerm)
  const endpointUrl = srcPtr.out(ns.view.endpoint).term?.value
  const sourceGraph = srcPtr.out(ns.view.graph).term?.value

  return new Source({
    endpointUrl,
    sourceGraph
  })
}

class ViewBuilder {
  static fromDataset ({ term, dataset, graph, source }) {
    const viewSource = source || getSourceFromData(term, dataset)

    const view = new View({ term, dataset, graph, source: viewSource })
    view.updateAll()

    return { view, source: viewSource }
  }
}

module.exports = {
  ViewBuilder
}
