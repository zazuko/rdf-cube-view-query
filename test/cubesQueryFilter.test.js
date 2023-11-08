import { strictEqual } from 'assert'
import { expect } from 'chai'
import { cubesQuery } from '../lib/query/cubes.js'
import * as cubesFilterQuery from '../lib/query/cubesFilter.js'
import * as ns from './support/namespaces.js'
import { cleanQuery } from './support/utils.js'

describe('query/cubesFilter', () => {
  it('should be an object', () => {
    strictEqual(typeof cubesFilterQuery, 'object')
  })

  describe('in', () => {
    it('should be a function', () => {
      strictEqual(typeof cubesFilterQuery.IN, 'function')
    })

    it('should create a triple pattern an in filter', () => {
      const predicate = ns.ex.property
      const values = [ns.ex.value1, ns.ex.value2]

      const query = cubesQuery({
        filters: [cubesFilterQuery.IN(predicate, values)],
      })

      expect(cleanQuery(query)).toMatchSnapshot()
    })
  })

  describe('notExists', () => {
    it('should be a function', () => {
      strictEqual(typeof cubesFilterQuery.notExists, 'function')
    })

    it('should create not exists filter', () => {
      const predicate = ns.ex.property
      const value = ns.ex.value

      const query = cubesQuery({
        filters: [cubesFilterQuery.notExists(predicate, value)],
      })

      expect(cleanQuery(query)).toMatchSnapshot()
    })

    it('should create not exists filter with object variable if not value is given', () => {
      const predicate = ns.ex.property

      const query = cubesQuery({
        filters: [cubesFilterQuery.notExists(predicate)],
      })

      expect(cleanQuery(query)).toMatchSnapshot()
    })
  })

  describe('patternIn', () => {
    it('should be a function', () => {
      strictEqual(typeof cubesFilterQuery.patternIn, 'function')
    })

    it('should add a triple pattern with the cube as object and the given predicate', () => {
      const predicate = ns.ex.property

      const query = cubesQuery({
        filters: [cubesFilterQuery.patternIn(predicate)],
      })

      expect(cleanQuery(query)).toMatchSnapshot()
    })

    it('should add a triple pattern with the cube as object and the give subject', () => {
      const predicate = ns.ex.property
      const subject = ns.ex.subject

      const query = cubesQuery({
        filters: [cubesFilterQuery.patternIn(predicate, subject)],
      })

      expect(cleanQuery(query)).toMatchSnapshot()
    })
  })
})
