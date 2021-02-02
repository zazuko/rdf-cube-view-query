const { strictEqual } = require('assert')
const clownface = require('clownface')
const rdf = require('rdf-ext')
const fromFile = require('rdf-utils-fs/fromFile')
const ViewQuery = require('../../lib/query/ViewQuery')
const { cleanQuery, queryFromTxt } = require('./utils')

async function viewQueryFromTtl (name) {
  const filename = `test/support/${name}.ttl`

  const dataset = await rdf.dataset().import(fromFile(filename))

  const ptr = clownface({
    dataset,
    term: rdf.namedNode('http://example.org/view')
  })

  const viewQuery = new ViewQuery(ptr)

  return cleanQuery(viewQuery.query.toString())
}

async function compareViewQuery ({ name }) {
  strictEqual(await viewQueryFromTtl(name), await queryFromTxt(name))
}

module.exports = {
  compareViewQuery
}
