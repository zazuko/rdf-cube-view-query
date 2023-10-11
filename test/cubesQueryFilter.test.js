import { strictEqual } from 'assert'
import { cubesQuery } from '../lib/query/cubes.js'
import * as cubesFilterQuery from '../lib/query/cubesFilter.js'
import { compareQuery } from './support/compareQuery.js'
import * as ns from './support/namespaces.js'

describe('query/cubesFilter', () => {
  it('should be an object', () => {
    strictEqual(typeof cubesFilterQuery, 'object')
  })

  describe('in', () => {
    it('should be a function', () => {
      strictEqual(typeof cubesFilterQuery.IN, 'function')
    })

    it('should create a triple pattern an in filter', async () => {
      const predicate = ns.ex.property
      const values = [ns.ex.value1, ns.ex.value2]

      const query = cubesQuery({
        filters: [cubesFilterQuery.IN(predicate, values)],
      })

      await compareQuery({ name: 'cubesFilterIn', query })
    })
  })

  describe('notExists', () => {
    it('should be a function', () => {
      strictEqual(typeof cubesFilterQuery.notExists, 'function')
    })

    it('should create not exists filter', async () => {
      const predicate = ns.ex.property
      const value = ns.ex.value

      const query = cubesQuery({
        filters: [cubesFilterQuery.notExists(predicate, value)],
      })

      await compareQuery({ name: 'cubesFilterNotExists', query })
    })

    it('should create not exists filter with object variable if not value is given', async () => {
      const predicate = ns.ex.property

      const query = cubesQuery({
        filters: [cubesFilterQuery.notExists(predicate)],
      })

      await compareQuery({ name: 'cubesFilterNotExistsNoValue', query })
    })
  })

  describe('patternIn', () => {
    it('should be a function', () => {
      strictEqual(typeof cubesFilterQuery.patternIn, 'function')
    })

    it('should add a triple pattern with the cube as object and the given predicate', async () => {
      const predicate = ns.ex.property

      const query = cubesQuery({
        filters: [cubesFilterQuery.patternIn(predicate)],
      })

      await compareQuery({ name: 'cubesFilterPatternIn', query })
    })

    it('should add a triple pattern with the cube as object and the give subject', async () => {
      const predicate = ns.ex.property
      const subject = ns.ex.subject

      const query = cubesQuery({
        filters: [cubesFilterQuery.patternIn(predicate, subject)],
      })

      await compareQuery({ name: 'cubesFilterPatternInSubject', query })
    })
  })
})
