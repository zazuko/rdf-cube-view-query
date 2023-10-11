import rdf from '@zazuko/env'
import sparql from 'rdf-sparql-builder'
import { sparql as sparqlTemplate } from '@tpluscode/rdf-string'
import * as ns from '../namespaces.js'

export const operation = (predicate, value, operation) => {
  return ({ cube, index }) => {
    const variable = rdf.variable(`v${index}`)
    let filter = null

    if (operation.equals(ns.view.Eq)) {
      filter = sparql.eq(variable, value)
    } else if (operation.equals(ns.view.Ne)) {
      filter = sparql.ne(variable, value)
    } else if (operation.equals(ns.view.Lt)) {
      filter = sparql.lt(variable, value)
    } else if (operation.equals(ns.view.Gt)) {
      filter = sparql.gt(variable, value)
    } else if (operation.equals(ns.view.Lte)) {
      filter = sparql.lte(variable, value)
    } else if (operation.equals(ns.view.Gte)) {
      filter = sparql.gte(variable, value)
    } else if (operation.equals(ns.view.In)) {
      filter = sparql.in(variable, value)
    }

    if (!filter) {
      throw new Error(`unknown operation: ${operation}`)
    }

    return [
      [cube, predicate, variable],
      sparql.filter([filter]),
    ]
  }
}

export const eq = (predicate, value) => operation(predicate, value, ns.view.Eq)
export const ne = (predicate, value) => operation(predicate, value, ns.view.Ne)
export const lt = (predicate, value) => operation(predicate, value, ns.view.Lt)
export const gt = (predicate, value) => operation(predicate, value, ns.view.Gt)
export const lte = (predicate, value) => operation(predicate, value, ns.view.Lte)
export const gte = (predicate, value) => operation(predicate, value, ns.view.Gte)
export const IN = (predicate, values) => operation(predicate, values, ns.view.In)

export const notExists = (predicateArg, value) => {
  return ({ cube, index }) => {
    value = value || rdf.variable(`v${index}`)

    return [
      sparql.filter([
        sparqlTemplate`NOT EXISTS { ${rdf.quad(cube, predicateArg, value)} }`.toString({ prologue: false, noPrefixedNames: true }),
      ]),
    ]
  }
}

export const patternIn = (predicate, subject) => {
  return ({ cube, index }) => {
    const variable = rdf.variable(`v${index}`)

    return [
      [subject || variable, predicate, cube],
    ]
  }
}
