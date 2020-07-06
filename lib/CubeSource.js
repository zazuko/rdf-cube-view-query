const Source = require('./Source')
const ns = require('./namespaces')
const { toTerm } = require('./utils')

class CubeSource extends Source {
  constructor ({ parent, term, dataset, graph, endpointUrl, sourceGraph, user, password, cube }) {
    super({
      parent,
      term,
      dataset,
      graph,
      endpointUrl,
      sourceGraph,
      user,
      password
    })

    this.ptr
      .addOut(ns.rdf.type, ns.view.CubeSource)
      .addOut(ns.view.cube, toTerm(cube))
  }

  static fromSource (source, cube, { parent, term, dataset, graph } = {}) {
    return new CubeSource({
      parent: parent || source,
      term,
      dataset: dataset || source.dataset,
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
