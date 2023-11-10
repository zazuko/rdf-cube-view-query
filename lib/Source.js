import ParsingClient from 'sparql-http-client/ParsingClient.js'
import Cube from './Cube.js'
import Node from './Node.js'
import * as ns from './namespaces.js'
import { toTerm } from './utils.js'
import { cubesQuery } from './query/cubes.js'
import { viewListQuery } from './query/views.js'
import View from './View.js'
import { createPrefixedSparqlClient } from './PrefixedSparqlClient.js'

const DEFAULT_QUERY_PREFIX = '#pragma describe.strategy cbd'

export default class Source extends Node {
  constructor({
    parent,
    term,
    dataset,
    graph,
    endpointUrl,
    sourceGraph,
    user,
    password,
    queryOperation,
    queryPrefix,
    client = new ParsingClient({ endpointUrl, user, password }),
  }) {
    super({
      parent,
      term,
      dataset,
      graph,
    })

    this.ptr.addOut(ns.view.endpoint, toTerm(client.query.endpoint.endpointUrl))

    if (sourceGraph) {
      this.ptr.addOut(ns.view.graph, toTerm(sourceGraph))
    }

    this.user = user
    this.password = password
    this.queryOperation = queryOperation
    this.queryPrefix = queryPrefix || DEFAULT_QUERY_PREFIX
    this.client = createPrefixedSparqlClient({ client, queryPrefix: this.queryPrefix })
  }

  get endpoint() {
    return this.ptr.out(ns.view.endpoint).term
  }

  get graph() {
    return this.ptr.out(ns.view.graph).term
  }

  async cube(term) {
    const cube = new Cube({
      parent: this,
      term: toTerm(term),
      source: this,
    })

    await cube.init()

    // empty cube?
    if (cube.ptr.out().terms.length === 0) {
      return null
    }

    return cube
  }

  cubesQuery({ filters } = {}) {
    return cubesQuery({
      graph: this.graph,
      filters,
    })
  }

  async cubes({ filters, noShape = false } = {}) {
    const rows = await this.client.query.select(this.cubesQuery({ filters }))

    return Promise.all(rows.map(async row => {
      const cube = new Cube({
        parent: this,
        term: row.cube,
        source: this,
      })

      await cube.fetchCube()

      if (!noShape) {
        await cube.fetchShape()
      }

      return cube
    }))
  }

  viewListQuery({ filters } = {}) {
    return viewListQuery({
      graph: this.graph, filters,
    })
  }

  async views({ filters } = {}) {
    const rows = await this.client.query.select(this.viewListQuery({ filters }))

    return Promise.all(rows.map(async row => {
      const view = new View({
        parent: this, term: row.view, source: this,
      })

      await view.fetchView()

      return view
    }))
  }

  async view(term) {
    const view = new View({
      parent: this, term: toTerm(term), source: this,
    })

    await view.init()

    // empty view?
    if (view.ptr.out().terms.length === 0) {
      return null
    }

    return view
  }
}
