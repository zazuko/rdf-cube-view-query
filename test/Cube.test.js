const { strictEqual } = require('assert')
const { describe, it } = require('mocha')
const cubesQuery = require('../lib/query/cubes')
const Cube = require('../lib/Cube')
const { compareQuery } = require('./support/compareQuery')
const ns = require('./support/namespaces')

describe('Cube', () => {
  it('should be a constructor', () => {
    strictEqual(typeof Cube, 'function')
  })

  describe('filter', () => {
    describe('noValidThrough', () => {
      it('should be a function', () => {
        strictEqual(typeof Cube.filter.noValidThrough, 'function')
      })

      it('should create a not exists filter for schema:noValidThrough', async () => {
        const query = cubesQuery({
          filters: [Cube.filter.noValidThrough()]
        })

        await compareQuery({ name: 'CubeFilterNoValidThrough', query })
      })
    })

    describe('status', () => {
      it('should be a function', () => {
        strictEqual(typeof Cube.filter.status, 'function')
      })

      it('should create an in filter for the given status value', async () => {
        const query = cubesQuery({
          filters: [Cube.filter.status(ns.ex.status)]
        })

        await compareQuery({ name: 'CubeFilterStatusValue', query })
      })

      it('should create an in filter for the given status values', async () => {
        const query = cubesQuery({
          filters: [Cube.filter.status([ns.ex.status1, ns.ex.status2])]
        })

        await compareQuery({ name: 'CubeFilterStatusValues', query })
      })
    })
  })
})
