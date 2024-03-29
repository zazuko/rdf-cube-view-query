import rdf from '@zazuko/env'
import * as ns from './namespaces.js'

export function collect(str, all) {
  return str
    .split(',')
    .reduce((all, current) => {
      return all.add(current)
    }, all)
}

export function cubeFilter({ cubeName, cubeUrl }) {
  return cube => {
    if (cubeName && !cube.out(ns.schema.name).values.some(v => v.includes(cubeName))) {
      return false
    }

    if (cubeUrl && cube.term.value !== cubeUrl) {
      return false
    }

    return true
  }
}

export function toCsv(view, observations) {
  const columns = view.dimensions.map(d => d.ptr.out(ns.view.as).value)

  return [columns.join(',')].concat(observations.map(observation => {
    return columns.map(column => observation[column]).map(c => c.value).join(',')
  })).join('\n')
}

export function toTerm(arg, datatype) {
  if (!datatype && (arg.startsWith('http://') || arg.startsWith('https://'))) {
    return rdf.namedNode(arg)
  }

  if (datatype) {
    if (datatype.startsWith('xsd:')) {
      datatype = ns.xsd(datatype.slice(4))
    } else {
      datatype = rdf.namedNode(datatype)
    }

    return rdf.literal(arg, datatype)
  }

  return rdf.literal(arg)
}
