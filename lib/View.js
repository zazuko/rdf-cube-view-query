const CubeSource = require('./CubeSource')
const Dimension = require('./Dimension')
const Node = require('./Node')
const ns = require('./namespaces')
const observationsQuery = require('./observationsQuery')
const { findDataset, findParent, toTerm } = require('./utils')

class View extends Node {
  constructor ({ parent, term, dataset, graph, dimensions = [], filters = [] } = {}) {
    super({
      parent: parent || findParent([...dimensions, ...filters]),
      term,
      dataset: dataset || findDataset([...dimensions, ...filters]),
      graph
    })

    this.dimensions = []
    this.filters = []

    this.ptr.addOut(ns.rdf.type, ns.view.View)

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

  createDimension ({ as, path, source }) {
    const dimension = new Dimension({
      parent: this,
      dataset: this.ptr.dataset,
      source,
      path,
      as
    })

    return dimension
  }

  addDimension (dimension) {
    this.ptr.addOut(ns.view.dimension, toTerm(dimension))

    this.dimensions.push(dimension)
  }

  addFilter (filter) {
    this.ptr.addOut(ns.view.filter, toTerm(filter))

    this.filters.push(filter)
  }

  observationsQuery () {
    return observationsQuery(this.ptr)
  }

  async observations () {
    const sources = new Set([...this.dimensions].map(d => d.source))
    const source = [...sources][0]

    const { query, dimensionMap } = this.observationsQuery()

    const rows = await source.client.query.select(query)

    return rows.map(row => {
      const output = {}

      for (const [variable, property] of dimensionMap) {
        output[property.value] = row[variable.value]
      }

      return output
    })
  }

  static fromCube (cube) {
    const dataset = cube.ptr.dataset

    const cubeSource = CubeSource.fromSource(cube.source, cube)

    const view = new View({
      parent: cube,
      dataset
    })

    cube.dimensions.forEach(cubeDimension => {
      view.addDimension(view.createDimension({
        source: cubeSource,
        path: cubeDimension.path,
        as: cubeDimension.path
      }))
    })

    return view
  }

  static fromSource (source, ...options) {
    return new View({
      parent: source,
      dataset: source.ptr.dataset,
      ...options
    })
  }
}

module.exports = View
