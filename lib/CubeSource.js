const rdf = require('rdf-ext')
const ns = require('./namespaces')
const Source = require('./Source')

class CubeSource extends Source {
  constructor ({ term, dataset = rdf.dataset(), graph, endpointUrl, sourceGraph, user, password, cube }) {
    super({ term, dataset, graph, endpointUrl, sourceGraph, user, password })

    this.ptr
      .addOut(ns.rdf.type, ns.view.CubeSource)
      .addOut(ns.view.cube, cube)
  }

  static fromSource ({ source, dataset, graph, cube }) {
    return new CubeSource({
      term: source.ptr.term,
      dataset,
      graph,
      endpointUrl: source.endpoint.value,
      sourceGraph: source.graph,
      user: source.user,
      password: source.password,
      cube
    })
  }
}

module.exports = CubeSource
