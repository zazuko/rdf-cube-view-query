const rdf = require('rdf-ext')
const sparql = require('rdf-sparql-builder')
const ParsingClient = require('sparql-http-client/ParsingClient')
const Cube = require('./Cube')
const Node = require('./Node')
const ns = require('./namespaces')
const { toTerm } = require('./utils')

class Source extends Node {
  constructor ({ parent, term, dataset, graph, endpointUrl, sourceGraph, user, password }) {
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

  cubesQuery () {
    const cube = rdf.variable('cube')

    return sparql.select([cube])
      .from(this.graph)
      .where([[cube, ns.rdf.type, ns.cube.Cube]])
      .toString()
  }

  async cube (term) {
    const cube = new Cube({
      parent: this,
      term: toTerm(term),
      dataset: this.ptr.dataset,
      source: this
    })

    await cube.init()

    // empty cube?
    if (cube.ptr.out().length === 0) {
      return null
    }

    return cube
  }

  async cubes () {
    const rows = await this.client.query.select(this.cubesQuery())

    return Promise.all(rows.map(async row => {
      const cube = new Cube({
        parent: this,
        term: row.cube,
        dataset: this.ptr.dataset,
        source: this
      })

      await cube.init()

      return cube
    }))
  }
}

module.exports = Source
