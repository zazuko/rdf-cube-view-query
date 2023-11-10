import Source from './Source.js'
import * as ns from './namespaces.js'

export default class LookupSource extends Source {
  constructor({ parent, term, dataset, graph, endpointUrl, sourceGraph, user, password, client, queryOperation, queryPrefix }) {
    super({
      parent,
      term,
      dataset,
      graph,
      endpointUrl,
      sourceGraph,
      user,
      password,
      client,
      queryOperation,
      queryPrefix,
    })

    this.ptr.addOut(ns.rdf.type, ns.view.LookupSource)
  }

  static fromSource(source, { parent, term, dataset, graph } = {}) {
    return new LookupSource({
      parent: parent || source,
      term,
      dataset: dataset || source.dataset,
      graph,
      client: source.client,
      sourceGraph: source.graph,
      queryOperation: source.queryOperation,
      queryPrefix: source.queryPrefix,
    })
  }
}
