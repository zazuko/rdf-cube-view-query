const ns = require('../../namespaces')
const { contains, distinct } = require('../utils')
const rdf = require('rdf-ext')

function resolveProperty (dimensionPtr) {
  if (dimensionPtr.out(ns.view.as).term) {
    return dimensionPtr.out(ns.view.as).term
  }
  const candidate = dimensionPtr.out(ns.view.from).out(ns.view.path).term
  return candidate?.termType === 'NamedNode' ? candidate : rdf.blankNode()
}
class Dimensions {
  constructor (viewQuery) {
    this.viewQuery = viewQuery

    const view = this.viewQuery.view

    const resultDimensions = view.out(ns.view.dimension)
    const filterDimensions = view.out(ns.view.filter).out(ns.view.dimension)

    this.array = distinct(resultDimensions, filterDimensions).toArray().map(dimension => {
      const property = resolveProperty(dimension)
      const isResult = contains(dimension.in(ns.view.dimension), view)
      const isAggregate = contains(dimension.out(ns.view.aggregate))
      const isFilter = contains(dimension.in(ns.view.dimension).in(ns.view.filter), view)
      const hasLanguageFilter = contains(view.out(ns.view.filter)
        .has(ns.view.dimension, dimension)
        .has(ns.view.operation, ns.view.Lang))

      return {
        ptr: dimension,
        variable: this.viewQuery.variable('dimension'),
        property,
        isResult,
        isAggregate,
        isFilter,
        hasLanguageFilter
      }
    })
  }

  get (term) {
    return this.array.find(dimension => dimension.ptr.term.equals(term))
  }
}

module.exports = Dimensions
