const clownface = require('clownface')
const rdf = require('rdf-ext')
const CubeSource = require('./CubeSource')
const Dimension = require('./Dimension')
const ns = require('./namespaces')
const observationsQuery = require('./observationsQuery')
const { findDataset, toTerm } = require('./utils')

class View {
  constructor ({ term = rdf.blankNode(), dataset, graph, dimensions = [], filters = [] } = {}) {
    dataset = dataset || findDataset([...dimensions, ...filters]) || rdf.dataset()

    this.ptr = clownface({ term, dataset, graph })
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

    const cubeSource = CubeSource.fromSource({
      source: cube.source,
      dataset,
      cube: cube.ptr
    })

    const dimensions = cube.dimensions.map(cubeDimension => {
      return new Dimension({
        dataset,
        source: cubeSource,
        path: cubeDimension.path,
        as: cubeDimension.path
      })
    })

    return new View({ dataset, dimensions })
  }
}

module.exports = View
