const sparql = require('rdf-sparql-builder')
const ns = require('../../namespaces')
const { contains } = require('../utils')

class Result {
  constructor (viewQuery) {
    this.viewQuery = viewQuery
  }

  buildProjection () {
    return this.viewQuery.dimensions.array
      .filter(d => d.isResult)
      .map(dimension => this.buildDimensionProjection(dimension))
  }

  buildGroupyByModifier () {
    return this.viewQuery.dimensions.array
      .filter(d => d.isResult && !d.isAggregate)
      .map(dimension => dimension.variable)
  }

  buildDimensionProjection (dimension) {
    if (!dimension.isAggregate) {
      return dimension.variable
    }

    const aggregate = dimension.ptr.out(ns.view.aggregate)

    if (contains(aggregate, ns.view.Min)) {
      return sparql.min(dimension.variable)
    }

    if (contains(aggregate, ns.view.Max)) {
      return sparql.max(dimension.variable)
    }

    if (contains(aggregate, ns.view.Avg)) {
      return sparql.avg(dimension.variable)
    }

    throw new Error(`unknow aggregate ${aggregate.value}`)
  }
}

module.exports = Result
