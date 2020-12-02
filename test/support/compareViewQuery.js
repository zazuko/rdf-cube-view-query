const { strictEqual } = require('assert')
const { readFile } = require('fs').promises
const clownface = require('clownface')
const rdf = require('rdf-ext')
const fromFile = require('rdf-utils-fs/fromFile')
const ViewQuery = require('../../lib/query/ViewQuery')

function cleanQuery (query) {
  return query
    .replace(/\n/g, ' ')
    .replace(/ +/g, ' ')
    .trim()
}

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

async function viewQueryFromTxt (name) {
  const filename = `test/support/${name}.query.txt`
  const content = await readFile(filename)

  return cleanQuery(content.toString())
}

async function compareViewQuery ({ name }) {
  strictEqual(await viewQueryFromTtl(name), await viewQueryFromTxt(name))
}

module.exports = {
  compareViewQuery
}
