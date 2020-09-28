const rdf = require('rdf-ext')
const sparql = require('rdf-sparql-builder')
const ns = require('../../namespaces')
const { contains } = require('../utils')

class Filters {
  constructor (viewQuery) {
    this.viewQuery = viewQuery

    this.array = this.viewQuery.view.out(ns.view.filter).toArray().map(filter => {
      const dimension = this.viewQuery.dimensions.get(filter.out(ns.view.dimension).term)

      dimension.filterPattern = contains(filter.out(ns.view.operation), ns.view.Lang)

      return {
        ptr: filter,
        dimension
      }
    })
  }

  buildFilters () {
    return this.array
      .filter(filter => !filter.dimension.isAggregate)
      .map(filter => this.buildFilter({ filter }))
      .reduce((all, filter) => all.concat(filter), [])
  }

  buildHavings () {
    return this.array
      .filter(filter => filter.dimension.isAggregate)
      .map(filter => this.buildFilter({ filter }))
      .reduce((all, filter) => all.concat(filter), [])
  }

  buildFilter ({ filter }) {
    const dimension = this.viewQuery.dimensions.get(filter.ptr.out(ns.view.dimension).term)
    const operation = filter.ptr.out(ns.view.operation)
    const argument = filter.ptr.out(ns.view.argument)

    if (contains(operation, ns.view.Eq)) {
      return [sparql.filter([sparql.eq(dimension.variable, argument.term)])]
    }

    if (contains(operation, ns.view.Ne)) {
      return [sparql.filter([sparql.ne(dimension.variable, argument.term)])]
    }

    if (contains(operation, ns.view.Lt)) {
      return [sparql.filter([sparql.lt(dimension.variable, argument.term)])]
    }

    if (contains(operation, ns.view.Gt)) {
      return [sparql.filter([sparql.gt(dimension.variable, argument.term)])]
    }

    if (contains(operation, ns.view.Lte)) {
      return [sparql.filter([sparql.lte(dimension.variable, argument.term)])]
    }

    if (contains(operation, ns.view.Gte)) {
      return [sparql.filter([sparql.gte(dimension.variable, argument.term)])]
    }

    if (contains(operation, ns.view.In)) {
      return [sparql.filter([sparql.in(dimension.variable, argument.terms)])]
    }

    if (contains(operation, ns.view.Lang)) {
      return this.buildLangFilter({ dimension, argument })
    }

    throw new Error(`unknown filter type: ${operation.value}`)
  }

  buildLangFilter ({ dimension, argument }) {
    const languages = [...(argument.list() || [argument.term])].map(language => language.term)
    const prioVar = rdf.variable('prio')

    const subSelects = languages.map((language, prio) => {
      const prioValues = `VALUES ?${prioVar.value} { ${prio} }`
      let where = []

      if (language.value === '') {
        where = [
          ...dimension.patterns,
          sparql.filter([sparql.eq(sparql.lang(dimension.variable), language)])
        ]
      } else if (language.value === '*') {
        where = [
          sparql.select([sparql.min(dimension.variable), prioVar])
            .where([
              ...dimension.patterns,
              sparql.filter([sparql.langMatches(sparql.lang(dimension.variable), language)])
            ])
            .groupBy([prioVar])
        ]
      } else {
        where = [
          ...dimension.patterns,
          sparql.filter([sparql.langMatches(sparql.lang(dimension.variable), language)])
        ]
      }

      return [
        sparql.select([dimension.variable, prioVar])
          .where([prioValues, ...where])
      ]
    })

    return sparql.select([dimension.variable])
      .where([sparql.union(subSelects)])
      .orderBy([dimension.variable])
      .limit(1)
  }
}

module.exports = Filters
