import { readFile } from 'fs/promises'
import { Parser } from 'n3'
import rdf from '@zazuko/env'
import { turtle } from '@tpluscode/rdf-string'

export function cleanQuery(query) {
  return query
    .replace(/\n/g, ' ')
    .replace(/ +/g, ' ')
    .trim()
}

export async function queryFromTxt(name) {
  const filename = `test/support/${name}.query.txt`
  const content = await readFile(filename)

  return cleanQuery(content.toString())
}

const parser = new Parser()

export function parse(strings, ...values) {
  const dataset = rdf.dataset().addAll(parser.parse(turtle(strings, ...values).toString()))
  return rdf.clownface({ dataset })
}
