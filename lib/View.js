const Dimension = require('./Dimension')
const Node = require('./Node')
const ns = require('./namespaces')
const { findDataset, findParent, objectSetterGetter, toTerm } = require('./utils')
const ViewQuery = require('./query/ViewQuery')
const viewDefQuery = require('./query/view.js')
const viewFullQuery = require('./query/viewFull.js')
const Filter = require('./Filter.js')

class View extends Node {
  constructor ({ parent, term, dataset, graph, source, dimensions = [], filters = [] } = {}) {
    super({
      parent: parent || findParent([...dimensions, ...filters]), term, dataset: dataset || findDataset([...dimensions, ...filters]), graph
    })

    this.source = source

    this.dimensions = []
    this.filters = []
    this.queryPrefix = '#pragma describe.strategy cbd\n'
    this.quads = []

    this.ptr.addOut(ns.rdf.type, ns.view.View)
    this.ptr.addOut(ns.view.projection)

    for (const dimension of dimensions) {
      this.addDimension(dimension)
    }

    for (const filter of filters) {
      this.addFilter(filter)
    }
  }

  dimension ({ cubeDimension }) {
    if (cubeDimension) {
      const term = toTerm(cubeDimension)

      return this.dimensions.find(dimension => {
        return dimension.cubeDimensions.some(cubeDimension => cubeDimension.path.equals(term))
      })
    }

    return null
  }

  static fromCube (cube) {
    function getCubeSource (cube) {
      cube.ptr.addOut(ns.rdf.type, ns.view.CubeSource).addOut(ns.view.cube, toTerm(cube))
      return cube
    }

    // @TODO find a better way to fight circular dependency.
    const cubeSource = cube.source.constructor.fromSource ? cube.source.constructor.fromSource(cube.source, cube) : getCubeSource(cube.source)

    if (!cubeSource) {
      throw Error('Needs source')
    }

    const view = new View({ parent: cube })

    cube.dimensions.forEach(cubeDimension => {
      view.addDimension(view.createDimension({
        source: cubeSource, path: cubeDimension.path, as: cubeDimension.path
      }))
    })

    return view
  }

  addDimension (dimension) {
    this.ptr.addOut(ns.view.dimension, toTerm(dimension))

    this.dimensions.push(dimension)

    return this
  }

  addFilter (filter) {
    this.ptr.addOut(ns.view.filter, toTerm(filter))

    this.filters.push(filter)

    return this
  }

  offset (offset) {
    return objectSetterGetter(this, ns.view.offset, offset, {
      map: parseInt,
      ptr: this.ptr.out(ns.view.projection)
    })
  }

  limit (limit) {
    return objectSetterGetter(this, ns.view.limit, limit, {
      map: parseInt,
      ptr: this.ptr.out(ns.view.projection)
    })
  }

  observationsQuery ({ disableDistinct } = {}) {
    return new ViewQuery(this.ptr, { disableDistinct })
  }

  cubeShapeQuery (shapeUri) {
    if (!this.source.graph) {
      return `${this.queryPrefix}DESCRIBE <${shapeUri}>`
    }

    return `${this.queryPrefix}DESCRIBE <${shapeUri}> FROM <${this.source.graph.value}>`
  }

  async fetchCubeShape () {
    const cube = this.dimensions[0].cube
    if (!cube) {
      throw new Error('No cube found')
    }

    const shapeUri = this.ptr.node(cube).out(ns.cube.observationConstraint).value
    if (!shapeUri) {
      throw new Error('No shape Uri found')
    }

    const shapeData = await this.source.client.query.construct(this.cubeShapeQuery(shapeUri))
    this.dataset.addAll(shapeData)

    this.quads = [...this.quads, ...shapeData]
  }

  async observationCount ({ disableDistinct } = {}) {
    const sources = new Set([...this.dimensions].reduce((all, d) => {
      return all.concat(Array.isArray(d.source) ? d.source : [d.source])
    }, []))

    const source = [...sources][0]

    const { countQuery } = this.observationsQuery({ disableDistinct })

    const result = await source.client.query.select(countQuery, { operation: source.queryOperation })

    if (!result.length) {
      return NaN
    }

    return parseInt(result[0].count.value)
  }

  createDimension ({ aggregate, as, join, path, source }) {
    return new Dimension({
      parent: this, aggregate, as, join, path, source
    })
  }

  async observations ({ disableDistinct } = {}) {
    if (!this.dimensions.length) {
      throw Error('No dimensions')
    }

    const sources = new Set([...this.dimensions].reduce((all, d) => {
      return all.concat(Array.isArray(d.source) ? d.source : [d.source])
    }, []))

    const source = [...sources][0]

    if (!source || !source.client) {
      throw Error('No source with client')
    }

    const { query, dimensions } = this.observationsQuery({ disableDistinct })

    const columns = dimensions.array.filter(d => d.isResult).map(d => [d.variable, d.property])

    const rows = await source.client.query.select(query, { operation: source.queryOperation })

    return rows.map(row => {
      const output = {}

      for (const [variable, property] of columns) {
        output[property.value] = row[variable.value]
      }

      return output
    })
  }

  fetchViewQuery () {
    const prefix = this.queryPrefix || ''
    const query = viewDefQuery({ view: this.term, graph: this.source.graph })

    return [prefix, query.toString()].join('')
  }

  async fetchView () {
    const query = this.fetchViewQuery()
    const viewData = await this.source.client.query.construct(query)

    this.dataset.addAll(viewData)
    this.quads = [...this.quads, ...viewData]
  }

  async init () {
    await this.fetchView()
    await this.fetchViewFull()
    this.updateAll()
  }

  fetchViewFullQuery () {
    const prefix = this.queryPrefix || ''
    const query = viewFullQuery({ view: this.term, graph: this.source.graph })
    return [prefix, query.toString()].join('')
  }

  async fetchViewFull () {
    const query = this.fetchViewFullQuery()
    const data = await this.source.client.query.construct(query)
    this.clear()
    this.dataset.addAll(data)
  }

  updateAll () {
    this.dimensions = []
    for (const current of this.ptr.out(ns.view.dimension).terms) {
      // @TODO should lookup source in the dimension itself?, observations currently use one source
      this.dimensions.push(new Dimension({ parent: this, term: current, dataset: this.dataset, graph: this.graph, source: this.source }))
    }

    this.filters = []
    for (const current of this.ptr.out(ns.view.filter).terms) {
      this.filters.push(new Filter({ parent: this, term: current, dataset: this.dataset, graph: this.graph, source: this.source }))
    }
  }
}

module.exports = View
