const rdf = require('rdf-ext')
const ParsingClient = require('sparql-http-client/ParsingClient')
const Cube = require('./Cube')
const Node = require('./Node')
const ns = require('./namespaces')
const { toTerm } = require('./utils')
const cubesQuery = require('./query/cubes.js')

class Source extends Node {
  constructor ({ parent, term, dataset, graph, endpointUrl, sourceGraph = rdf.defaultGraph(), user, password, queryOperation }) {
    super({
      parent,
      term,
      dataset,
      graph
    })

    this.ptr.addOut(ns.view.endpoint, toTerm(endpointUrl))

    if (sourceGraph) {
      this.ptr.addOut(ns.view.graph, toTerm(sourceGraph))
    }

    this.user = user
    this.password = password
    this.queryOperation = queryOperation
  }

  get client () {
    return new ParsingClient({
      endpointUrl: this.endpoint.value,
      user: this.user,
      password: this.password
    })
  }

  get endpoint () {
    return this.ptr.out(ns.view.endpoint).term
  }

  get graph () {
    return this.ptr.out(ns.view.graph).term
  }

  async cube (term) {
    const cube = new Cube({
      parent: this,
      term: toTerm(term),
      source: this
    })

    await cube.init()

    // empty cube?
    if (cube.ptr.out().terms.length === 0) {
      return null
    }

    return cube
  }

  async cubes ({ filters, noShape = false } = {}) {
    const rows = await this.client.query.select(cubesQuery({
      graph: this.graph,
      filters
    }))

    return Promise.all(rows.map(async row => {
      const cube = new Cube({
        parent: this,
        term: row.cube,
        source: this
      })

      await cube.fetchCube()

      if (!noShape) {
        await cube.fetchShape()
      }

      return cube
    }))
  }
}

module.exports = Source
