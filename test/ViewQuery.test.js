import chai, { expect } from 'chai'
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot'
import { testView } from './support/testView.js'

describe('query/ViewQuery', () => {
  chai.use(jestSnapshotPlugin())

  it('should generate a query with the given columns in the result set', async () => {
    expect(await testView('columns')).query.toMatchSnapshot()
  })

  it('should generate a query without distinct if disableDistinct is true', async () => {
    expect(await testView.disableDistinct('disableDistinct')).query.matchSnapshot()
  })

  it('should generate a day function filter', async () => {
    expect(await testView('functionDay')).query.toMatchSnapshot()
  })

  it('should generate a month function filter', async () => {
    expect(await testView('functionMonth')).query.toMatchSnapshot()
  })

  it('should generate a year function filter', async () => {
    expect(await testView('functionYear')).query.toMatchSnapshot()
  })

  it('should generate a language filter', async () => {
    expect(await testView('language')).query.toMatchSnapshot()
  })

  it('should generate a language filter with aggregate', async () => {
    expect(await testView('languageMin')).query.toMatchSnapshot()
  })

  it('should generate LIMIT and OFFSET with the values given in projection/orderBy', async () => {
    expect(await testView('limitOffset')).query.toMatchSnapshot()
  })

  it('should generate ORDER BY in the direction given in projection/orderBy', async () => {
    expect(await testView('orderBy')).query.toMatchSnapshot()
  })

  it('should generate a count query', async () => {
    expect(await testView('simple')).countQuery.toMatchSnapshot()
  })

  it('should generate a count query without LIMIT and OFFSET', async () => {
    expect(await testView('limitOffset')).countQuery.toMatchSnapshot()
  })

  it('should generate a Stardog text search filter', async () => {
    expect(await testView('stardogTextSearch')).query.toMatchSnapshot()
  })

  it('should generate only generate query with projected columns', async () => {
    expect(await testView('projection')).query.toMatchSnapshot()
  })
})
