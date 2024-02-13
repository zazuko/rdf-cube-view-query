import rdf from '@zazuko/env'
import * as sparql from 'rdf-sparql-builder'
import * as ns from '../namespaces.js'

export function cubeQuery({ cube, graph = rdf.defaultGraph() } = {}) {
  const subject = rdf.variable('subject')

  const cubePattern = [sparql.bind(subject, `<${cube.value}>`)]
  const versionHistoryPattern = [[subject, ns.schema.hasPart, cube]]

  const patterns = [sparql.union([
    cubePattern,
    versionHistoryPattern,
  ])]

  return sparql.describe([subject])
    .from(graph)
    .where(patterns)
    .toString()
}
