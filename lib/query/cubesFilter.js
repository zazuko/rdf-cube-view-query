const rdf = require('rdf-ext')
const sparql = require('rdf-sparql-builder')

const filter = {}

filter.in = (predicate, values) => {
  return ({ cube, index }) => {
    const variable = rdf.variable(`v${index}`)

    return [
      [cube, predicate, variable],
      sparql.filter([sparql.in(variable, values)])
    ]
  }
}

filter.notExists = (predicate, value) => {
  return ({ cube, index }) => {
    value = value || rdf.variable(`v${index}`)

    return [
      sparql.filter([
        `NOT EXISTS { ${rdf.quad(cube, predicate, value).toString()} }`
      ])
    ]
  }
}

module.exports = filter
