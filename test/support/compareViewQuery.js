import { strictEqual } from 'assert'
import rdf from '@zazuko/env'
import fromFile from 'rdf-utils-fs/fromFile.js'
import ViewQuery from '../../lib/query/ViewQuery/index.js'
import { cleanQuery, queryFromTxt } from './utils.js'

async function viewQueryFromTtl(name, { count = false, disableDistinct } = {}) {
  const filename = `test/support/${name}.ttl`

  const dataset = await rdf.dataset().import(fromFile(filename))

  const ptr = rdf.clownface({
    dataset,
    term: rdf.namedNode('http://example.org/view'),
  })

  const viewQuery = new ViewQuery(ptr, { disableDistinct })

  if (count) {
    return cleanQuery(viewQuery.countQuery.toString())
  }

  return cleanQuery(viewQuery.query.toString())
}

export async function compareViewCountQuery({ name }) {
  strictEqual(await viewQueryFromTtl(name, { count: true }), await queryFromTxt(`${name}.count`))
}

export async function compareViewQuery({ name, ...args }) {
  strictEqual(await viewQueryFromTtl(name, args), await queryFromTxt(name, args))
}
