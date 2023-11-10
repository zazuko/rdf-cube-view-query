import rdf from '@zazuko/env'
import fromFile from 'rdf-utils-fs/fromFile.js'
import chai from 'chai'
import ViewQuery from '../../lib/query/ViewQuery/index.js'
import { cleanQuery } from './utils.js'

async function loadView(name) {
  const filename = `test/support/${name}.ttl`

  const dataset = await rdf.dataset().import(fromFile(filename))

  const ptr = rdf.clownface({
    dataset,
    term: rdf.namedNode('http://example.org/view'),
  })

  return ptr
}

export async function testView(name) {
  return new ViewQuery(await loadView(name))
}

testView.disableDistinct = async function (name) {
  return new ViewQuery(await loadView(name), { disableDistinct: true })
}

chai.Assertion.addProperty('query', function () {
  return new chai.Assertion(cleanQuery(this._obj.query.toString()))
})

chai.Assertion.addProperty('countQuery', function () {
  return new chai.Assertion(cleanQuery(this._obj.countQuery.toString()))
})

chai.Assertion.addProperty('previewQuery', function () {
  return (arg) => new chai.Assertion(cleanQuery(this._obj.previewQuery(arg).toString()))
})
