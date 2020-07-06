const Source = require('./Source')
const ns = require('./namespaces')

class LookupSource extends Source {
  constructor ({ parent, term, dataset, graph, endpointUrl, sourceGraph, user, password }) {
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

    this.ptr.addOut(ns.rdf.type, ns.view.LookupSource)
  }

  static fromSource (source, { parent, term, dataset, graph } = {}) {
    return new LookupSource({
      parent: parent || source,
      term,
      dataset: dataset || source.ptr.dataset,
      graph,
      endpointUrl: source.endpoint.value,
      sourceGraph: source.graph,
      user: source.user,
      password: source.password
    })
  }
}

module.exports = LookupSource
