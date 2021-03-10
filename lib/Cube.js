const TermSet = require('@rdfjs/term-set')
const CubeDimension = require('./CubeDimension')
const Node = require('./Node')
const ns = require('./namespaces')
const cubeQuery = require('./query/cube.js')
const queryFilter = require('./query/cubesFilter')

class Cube extends Node {
  constructor ({ parent, term, dataset, graph, source, ignore = [ns.rdf.type] }) {
    super({
      parent,
      term,
      dataset,
      graph
    })

    this.source = source
    this.ignore = new TermSet(ignore)
    this.queryPrefix = '#pragma describe.strategy cbd\n'
    this.quads = []
  }

  clear () {
    for (const quad of this.quads) {
      this.dataset.remove(quad)
    }

    super.clear()
  }

  get dimensions () {
    return this.ptr
      .out(ns.cube.observationConstraint)
      .out(ns.sh.property)
      .filter(property => !this.ignore.has(property.out(ns.sh.path).term))
      .map(ptr => new CubeDimension({ term: ptr.term, dataset: this.dataset }))
  }

  cubeQuery () {
    const prefix = this.queryPrefix || ''
    const query = cubeQuery({ cube: this.term, graph: this.source.graph })

    return [prefix, query.toString()].join('')
  }

  shapeQuery () {
    if (this.source.graph.termType === 'DefaultGraph') {
      return `${this.queryPrefix}DESCRIBE <${this.ptr.out(ns.cube.observationConstraint).value}>`
    }

    return `${this.queryPrefix}DESCRIBE <${this.ptr.out(ns.cube.observationConstraint).value}> FROM <${this.source.graph.value}>`
  }

  async init () {
    // fetch cube + metadata
    const cubeData = await this.source.client.query.construct(this.cubeQuery())
    this.dataset.addAll(cubeData)

    // fetch shapes
    const shapeData = await this.source.client.query.construct(this.shapeQuery())
    this.dataset.addAll(shapeData)

    this.quads = [...cubeData, ...shapeData]
  }

  out (...args) {
    return this.ptr.out(...args)
  }

  in (...args) {
    return this.ptr.in(...args)
  }
}

Cube.filter = { ...queryFilter }

Cube.filter.isPartOf = container => {
  return Cube.filter.patternIn(ns.schema.hasPart, container)
}

Cube.filter.noValidThrough = () => {
  return Cube.filter.notExists(ns.schema.validThrough)
}

Cube.filter.status = values => {
  values = Array.isArray(values) ? values : [values]

  return Cube.filter.in(ns.schema.creativeWorkStatus, values)
}

module.exports = Cube
