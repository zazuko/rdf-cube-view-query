import { deepStrictEqual, strictEqual } from 'assert'
import chai, { expect } from 'chai'
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot'
import { cubesQuery } from '../lib/query/cubes.js'
import * as ns from './support/namespaces.js'
import { cleanQuery } from './support/utils.js'

describe('query/cubes', () => {
  chai.use(jestSnapshotPlugin())

  it('should be a function', () => {
    strictEqual(typeof cubesQuery, 'function')
  })

  it('should create a query that finds all cube:Cube terms', () => {
    const query = cubesQuery()

    expect(cleanQuery(query)).toMatchSnapshot()
  })

  it('should use the given named graph', () => {
    const graph = ns.ex.graph

    const query = cubesQuery({ graph })

    expect(cleanQuery(query)).toMatchSnapshot()
  })

  it('should call the filters functions', () => {
    const args = []

    const filter = name => {
      return ({ cube, index }) => {
        args.push({ name, termType: cube.termType, value: cube.value, index })

        return []
      }
    }

    cubesQuery({ filters: [filter('1'), filter('2')] })

    deepStrictEqual(args, [
      { name: '1', termType: 'Variable', value: 'cube', index: 0 },
      { name: '2', termType: 'Variable', value: 'cube', index: 1 },
    ])
  })

  it('should use the result of the filter functions', () => {
    const filter = name => {
      return ({ index }) => {
        return [`# ${name} ${index}`]
      }
    }

    const query = cubesQuery({ filters: [filter('1'), filter('2')] })

    expect(cleanQuery(query)).toMatchSnapshot()
  })
})
