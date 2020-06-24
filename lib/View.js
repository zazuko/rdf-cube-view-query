const clownface = require('clownface')
const rdf = require('rdf-ext')
const CubeSource = require('./CubeSource')
const Dimension = require('./Dimension')
const ns = require('./namespaces')
const Filter = require('./Filter')
const observationsQuery = require('./observationsQuery')

class View {
  constructor ({ term = rdf.blankNode(), dataset = rdf.dataset(), graph } = {}) {
    this.ptr = clownface({ term, dataset, graph })

    this.dimensions = []
    this.filters = []
  }

  addDimension (dimension) {
    this.ptr.addOut(ns.view.dimension, dimension.ptr.term)

    this.dimensions.push(dimension)
  }

  addFilter (filter) {
    this.ptr.addOut(ns.view.filter, filter.ptr.term)

    this.filters.push(filter)
  }

  observationsQuery ({ source }) {
    return observationsQuery(this.ptr, { source })
  }

  async observations () {
    const sources = new Set([...this.dimensions].map(d => d.source))
    const source = [...sources][0]

    const { query, dimensionMap } = this.observationsQuery({ source })

    const rows = await source.client.query.select(query)

    return rows.map(row => {
      const output = {}

      for (const [variable, property] of dimensionMap) {
        output[property.value] = row[variable.value]
      }

      return output
    })
  }

  static fromCube (cube, { dimensions, filters = [] } = {}) {
    const view = new View({
      dataset: cube.ptr.dataset
    })

    const cubeSource = CubeSource.fromSource({
      source: cube.source,
      dataset: view.ptr.dataset,
      cube: cube.ptr
    })

    if (!dimensions) {
      for (const cubeDimension of cube.dimensions) {
        const dimension = new Dimension({
          dataset: view.ptr.dataset,
          source: cubeSource,
          path: cubeDimension.path,
          as: cubeDimension.path
        })

        view.addDimension(dimension)
      }
    } else {
      for (const dimension of dimensions) {
        view.addDimension(dimension)
      }
    }

    for (const filter of filters) {
      const copy = new Filter({
        dataset: view.ptr.dataset,
        dimension: filter.dimension,
        operation: filter.operation,
        arg: filter.arg
      })

      view.addFilter(copy)
    }

    return view
  }
}

module.exports = View
