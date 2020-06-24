const clownface = require('clownface')
const rdf = require('rdf-ext')
const TermMap = require('@rdfjs/term-map')
const { eq, ne, gt, lt, lte, gte, avg, min, max, select } = require('rdf-sparql-builder')
const TermSet = require('@rdfjs/term-set')
const ns = require('./namespaces')

function distinct (ptr) {
  const terms = [...new TermSet(ptr.terms)]

  if (terms.length === 0) {
    return ptr
  }

  return clownface({
    dataset: ptr._context[0].dataset,
    term: terms,
    graph: ptr._context[0].graph
  })
}

function toPropertyPath (ptr) {
  const list = [...ptr.list()]

  if (!list[0].term) {
    return ptr.term
  }

  return list.map(property => property.term)
}

function buildVariables ({ dimensions, dimensionVars }) {
  return dimensions.map(dimension => {
    const aggregate = dimension.out(ns.view.aggregate)
    const dimensionVar = dimensionVars.get(dimension.term)

    if (aggregate.term) {
      if (aggregate.term.equals(ns.view.Min)) {
        return min(dimensionVar)
      }

      if (aggregate.term.equals(ns.view.Max)) {
        return max(dimensionVar)
      }

      if (aggregate.term.equals(ns.view.Avg)) {
        return avg(dimensionVar)
      }

      throw new Error(`unknow aggregate ${aggregate.value}`)
    }

    return dimensionVar
  })
}

function buildGroup ({ dimensions, dimensionVars }) {
  return dimensions.map(dimension => {
    const aggregate = dimension.out(ns.view.aggregate)
    const dimensionVar = dimensionVars.get(dimension.term)

    if (aggregate.term) {
      return null
    }

    return dimensionVar
  }).filter(Boolean)
}

function buildPatterns ({ sources, dimensionVars }) {
  return sources.toArray().reduce((patterns, source, index) => {
    const type = source.out(ns.rdf.type)

    if (type.term.equals(ns.view.CubeSource)) {
      return patterns.concat(buildCubePatterns({ index, source, dimensionVars }))
    }

    if (type.term.equals(ns.view.LookupSource)) {
      return patterns.concat(buildLookupPatterns({ source, dimensionVars }))
    }
  }, [])
}

function buildCubePatterns ({ index, source, dimensionVars }) {
  const froms = source.in(ns.view.source)
  const observationSet = rdf.variable(`observationSet${index}`)
  const observation = rdf.variable(`observation${index}`)

  // TODO: graph
  // TODO: endpoint
  // TODO: optional

  return [
    [source.out(ns.view.cube).term, ns.cube.observationSet, observationSet],
    [observationSet, ns.cube.observation, observation]
  ].concat(froms.map(from => {
    const dimension = from.in(ns.view.from)
    const dimensionVar = dimensionVars.get(dimension.term)
    const path = toPropertyPath(from.out(ns.view.path))

    // dimension is not used
    if (!dimensionVar) {
      return null
    }

    return [observation, path, dimensionVar]
  })).filter(Boolean)
}

function buildLookupPatterns ({ source, dimensionVars }) {
  const froms = source.in(ns.view.source)

  // TODO: graph
  // TODO: endpoint
  // TODO: optional

  return froms.map(from => {
    const dimension = from.in(ns.view.from)
    const dimensionVar = dimensionVars.get(dimension.term)
    const join = from.out(ns.view.join)
    const joinVar = dimensionVars.get(join.term)
    const path = toPropertyPath(from.out(ns.view.path))

    return [joinVar, path, dimensionVar]
  })
}

function buildFilters ({ filters, dimensionVars }) {
  return filters.map(filter => buildFilter({ filter, dimensionVars })).filter(Boolean)
}

function buildHaving ({ filters, dimensionVars }) {
  return filters.map(filter => buildFilter({ filter, dimensionVars, aggregates: true })).filter(Boolean)
}

function buildFilter ({ filter, dimensionVars, aggregates }) {
  const dimension = filter.out(ns.view.dimension)
  const dimensionVar = dimensionVars.get(dimension.term)
  const aggregate = dimension.out(ns.view.aggregate)
  const operation = filter.out(ns.view.operation)
  const argument = filter.out(ns.view.argument)

  // TODO: optional

  if (Boolean(aggregate.term) !== Boolean(aggregates)) {
    return null
  }

  if (operation.term.equals(ns.view.Eq)) {
    return eq(dimensionVar, argument.term)
  }

  if (operation.term.equals(ns.view.Ne)) {
    return ne(dimensionVar, argument.term)
  }

  if (operation.term.equals(ns.view.Gt)) {
    return gt(dimensionVar, argument.term)
  }

  if (operation.term.equals(ns.view.Lt)) {
    return lt(dimensionVar, argument.term)
  }

  if (operation.term.equals(ns.view.Lte)) {
    return lte(dimensionVar, argument.term)
  }

  if (operation.term.equals(ns.view.Gte)) {
    return gte(dimensionVar, argument.term)
  }

  throw new Error(`unknown filter type: ${operation.value}`)
}

function observationsQuery (view, { source } = {}) {
  const outputDimensions = view.out(ns.view.dimension)
  const filters = view.out(ns.view.filter)
  const filterDimensions = distinct(filters.out(ns.view.dimension))
  const dimensions = distinct(view.node([...outputDimensions.terms, ...filterDimensions.terms]))
  const sources = distinct(dimensions.out(ns.view.from).out(ns.view.source))
  const dimensionVars = new TermMap(dimensions.map((d, i) => [d.term, rdf.variable(`dimension${i}`)]))

  const query = select(buildVariables({ dimensions, dimensionVars }), { distinct: true })
    .where(buildPatterns({ sources, dimensionVars }))
    .filter(buildFilters({ filters, dimensionVars }))
    .groupBy(buildGroup({ dimensions, dimensionVars }))
    .having(buildHaving({ filters, dimensionVars }))

  const dimensionMap = new Map(outputDimensions.map(dimension => {
    return [dimensionVars.get(dimension.term), dimension.out(ns.view.as).term]
  }))

  return { query, dimensionMap }
}

module.exports = observationsQuery
