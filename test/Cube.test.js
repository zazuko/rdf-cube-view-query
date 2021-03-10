const { strictEqual } = require('assert')
const { describe, it } = require('mocha')
const cubesQuery = require('../lib/query/cubes')
const Cube = require('../lib/Cube')
const Source = require('../lib/Source')
const buildCube = require('./support/buildCube')
const { compareQuery } = require('./support/compareQuery')
const ns = require('./support/namespaces')

describe('Cube', () => {
  it('should be a constructor', () => {
    strictEqual(typeof Cube, 'function')
  })

  describe('dimensions', () => {
    it('should be an array property', () => {
      const cube = buildCube()

      strictEqual(Array.isArray(cube.dimensions), true)
    })

    it('should contain all dimensions of the cube without rdf:type', () => {
      const cube = buildCube({
        dimensions: [{
          term: ns.ex.propertyA
        }, {
          term: ns.ex.propertyB
        }]
      })

      const dimensions = cube.dimensions

      strictEqual(dimensions.length, 2)
      strictEqual(dimensions[0].path.equals(ns.ex.propertyA), true)
      strictEqual(dimensions[1].path.equals(ns.ex.propertyB), true)
    })
  })

  describe('filter', () => {
    describe('isPartOf', () => {
      it('should be a function', () => {
        strictEqual(typeof Cube.filter.isPartOf, 'function')
      })

      it('should create a patter in filter for schema:hasPart', async () => {
        const versionHistory = ns.ex.versionHistory
        const query = cubesQuery({
          filters: [Cube.filter.isPartOf(versionHistory)]
        })

        await compareQuery({ name: 'CubeFilterIsPartOf', query })
      })
    })

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

  describe('in', () => {
    it('should be a method', () => {
      const source = new Source({ endpointUrl: ns.ex.endpoint })
      const cube = new Cube({ parent: source })

      strictEqual(typeof cube.in, 'function')
    })

    it('should use clownface to search for triples pointing to the cube', () => {
      const source = new Source({ endpointUrl: ns.ex.endpoint })
      const cube = new Cube({ parent: source })

      cube.ptr
        .addIn(ns.ex.predicate, ns.ex.up)
        .addOut(ns.ex.predicate, ns.ex.down)

      strictEqual(ns.ex.up.equals(cube.in(ns.ex.predicate).term), true)
    })
  })

  describe('out', () => {
    it('should be a method', () => {
      const source = new Source({ endpointUrl: ns.ex.endpoint })
      const cube = new Cube({ parent: source })

      strictEqual(typeof cube.out, 'function')
    })

    it('should use clownface to search for triples starting at the cube', () => {
      const source = new Source({ endpointUrl: ns.ex.endpoint })
      const cube = new Cube({ parent: source })

      cube.ptr
        .addIn(ns.ex.predicate, ns.ex.up)
        .addOut(ns.ex.predicate, ns.ex.down)

      strictEqual(ns.ex.down.equals(cube.out(ns.ex.predicate).term), true)
    })
  })
})
