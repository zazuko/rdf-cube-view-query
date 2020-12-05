const { strictEqual } = require('assert')
const { describe, it } = require('mocha')
const ViewQuery = require('../lib/query/ViewQuery')
const { compareViewQuery } = require('./support/compareViewQuery')

describe('query/ViewQuery', () => {
  it('should be a constructor', () => {
    strictEqual(typeof ViewQuery, 'function')
  })

  it('should generate ORDER BY in the direction given in projection/orderBy', async () => {
    await compareViewQuery({ name: 'orderBy' })
  })

  it('should generate LIMIT and OFFSET with the values given in projection/orderBy', async () => {
    await compareViewQuery({ name: 'limitOffset' })
  })
})
