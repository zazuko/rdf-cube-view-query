import { Parser } from 'n3'
import rdf from '@zazuko/env'
import { turtle } from '@tpluscode/rdf-string'
import sparqljs from 'sparqljs'

const generator = new sparqljs.Generator()
const sparqlParser = new sparqljs.Parser()

export function cleanQuery(query) {
  const parsedQuery = sparqlParser.parse(query)
  return generator.stringify(parsedQuery)
}

const parser = new Parser()

export function parse(strings, ...values) {
  const dataset = rdf.dataset().addAll(parser.parse(turtle(strings, ...values).toString()))
  return rdf.clownface({ dataset })
}
