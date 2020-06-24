const clownface = require('clownface')
const rdf = require('rdf-ext')
const sparql = require('rdf-sparql-builder')
const ParsingClient = require('sparql-http-client/ParsingClient')
const ns = require('./namespaces')
const Cube = require('./Cube')

class Source {
  constructor ({ term = rdf.blankNode(), dataset = rdf.dataset(), graph, endpointUrl, sourceGraph, user, password }) {
    this.ptr = clownface({ term, dataset, graph })

    this.ptr.addOut(ns.view.endpoint, rdf.namedNode(endpointUrl))

    if (sourceGraph) {
      this.ptr.addOut(ns.view.graph, rdf.namedNode(sourceGraph.value || sourceGraph))
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

  async cubes () {
    const rows = await this.client.query.select(this.cubesQuery())

    return Promise.all(rows.map(async row => {
      const cube = new Cube({
        term: row.cube,
        source: this
      })

      await cube.init()

      return cube
    }))
  }
}

module.exports = Source
