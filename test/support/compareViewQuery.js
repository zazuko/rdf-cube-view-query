const { strictEqual } = require('assert')
const clownface = require('clownface')
const rdf = require('rdf-ext')
const fromFile = require('rdf-utils-fs/fromFile')
const ViewQuery = require('../../lib/query/ViewQuery')
const { cleanQuery, queryFromTxt } = require('./utils')

async function viewQueryFromTtl (name, { count = false } = {}) {
  const filename = `test/support/${name}.ttl`

  const dataset = await rdf.dataset().import(fromFile(filename))

  const ptr = clownface({
    dataset,
    term: rdf.namedNode('http://example.org/view')
  })

  const viewQuery = new ViewQuery(ptr)

  if (count) {
    return cleanQuery(viewQuery.countQuery.toString())
  }

  return cleanQuery(viewQuery.query.toString())
}

async function compareViewCountQuery ({ name }) {
  strictEqual(await viewQueryFromTtl(name, { count: true }), await queryFromTxt(`${name}.count`))
}

async function compareViewQuery ({ name }) {
  strictEqual(await viewQueryFromTtl(name), await queryFromTxt(name))
}

module.exports = {
  compareViewCountQuery,
  compareViewQuery
}
