import Source from './Source.js'
import * as ns from './namespaces.js'
import { toTerm } from './utils.js'

export default class CubeSource extends Source {
  constructor({ parent, term, dataset, graph, endpointUrl, sourceGraph, user, password, client, cube, queryOperation, queryPrefix }) {
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

    this.ptr
      .addOut(ns.rdf.type, ns.view.CubeSource)
      .addOut(ns.view.cube, toTerm(cube))
  }

  static fromSource(source, cube, { parent, term, dataset, graph } = {}) {
    return new CubeSource({
      parent: parent || source,
      term,
      dataset: dataset || source.dataset,
      graph,
      client: source.client,
      sourceGraph: source.graph,
      queryOperation: source.queryOperation,
      cube,
      queryPrefix: source.queryPrefix,
    })
  }
}
