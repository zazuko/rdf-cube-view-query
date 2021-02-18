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
    const func = filter.ptr.out(ns.view.function).term
    const variable = this.buildFunction({ func, variable: dimension.variable })

    if (contains(operation, ns.view.Eq)) {
      return [sparql.filter([sparql.eq(variable, argument.term)])]
    }

    if (contains(operation, ns.view.Ne)) {
      return [sparql.filter([sparql.ne(variable, argument.term)])]
    }

    if (contains(operation, ns.view.Lt)) {
      return [sparql.filter([sparql.lt(variable, argument.term)])]
    }

    if (contains(operation, ns.view.Gt)) {
      return [sparql.filter([sparql.gt(variable, argument.term)])]
    }

    if (contains(operation, ns.view.Lte)) {
      return [sparql.filter([sparql.lte(variable, argument.term)])]
    }

    if (contains(operation, ns.view.Gte)) {
      return [sparql.filter([sparql.gte(variable, argument.term)])]
    }

    if (contains(operation, ns.view.In)) {
      return [sparql.filter([sparql.in(variable, argument.terms)])]
    }

    if (contains(operation, ns.view.Lang)) {
      return this.buildLangFilter({ dimension, argument })
    }

    throw new Error(`unknown filter type: ${operation.value}`)
  }

  buildLangFilter ({ dimension, argument }) {
    const languages = [...(argument.list() || [argument.term])].map(language => language.term)
    const langVars = new Map(languages.map((language, index) => [language, rdf.variable(`${dimension.variable.value}_${index}`)]))

    // generate the optional queries for all languages
    const languagesPatterns = [...langVars].map(([language, langVar]) => {
      // replace the dimension variable with the language variable
      const dimensionPatterns = dimension.patterns.map(pattern => {
        return [
          pattern[0],
          pattern[1],
          pattern[2].equals(dimension.variable) ? langVar : pattern[2],
          pattern[3]
        ]
      })

      // generate the query patterns for the optional subquery
      let queryPatterns

      if (language.value === '') {
        queryPatterns = [...dimensionPatterns,
          sparql.filter([sparql.eq(sparql.lang(langVar), language)])
        ]
      } else if (language.value === '*') {
        queryPatterns = [sparql.select([sparql.min(langVar)]).where([...dimensionPatterns,
          sparql.filter([sparql.langMatches(sparql.lang(langVar), language)])
        ])]
      } else {
        queryPatterns = [...dimensionPatterns,
          sparql.filter([sparql.langMatches(sparql.lang(langVar), language)])
        ]
      }

      return sparql.optional(queryPatterns)
    })

    // bind the first language variable with a result to the dimension variable
    const bindPattern = sparql.bind(dimension.variable, sparql.coalesce(...langVars.values()))

    return [...languagesPatterns, bindPattern]
  }

  buildFunction ({ func, variable }) {
    if (!func) {
      return variable
    }

    if (ns.view.Day.equals(func)) {
      return sparql.day(variable)
    }

    if (ns.view.Month.equals(func)) {
      return sparql.month(variable)
    }

    if (ns.view.Year.equals(func)) {
      return sparql.year(variable)
    }

    throw new Error(`unknown function: ${func.value}`)
  }
}

module.exports = Filters
