const { strictEqual } = require('assert')
const rdfHandler = require('@rdfjs/express-handler')
const withServer = require('express-as-promise/withServer')
const { describe, it } = require('mocha')
const rdf = require('rdf-ext')
const Cube = require('../lib/Cube')
const Source = require('../lib/Source')
const ns = require('./support/namespaces')

describe('Source', () => {
  it('should be a constructor', () => {
    strictEqual(typeof Source, 'function')
  })

  describe('.cube', () => {
    it('should be a method', () => {
      const source = new Source({ endpointUrl: ns.ex.endpoint })

      strictEqual(typeof source.cube, 'function')
    })

    it('should return an initialized cube', async () => {
      await withServer(async server => {
        let called = 0

        server.app.get('/', rdfHandler(), (req, res) => {
          called++

          res.dataset(rdf.dataset([
            rdf.quad(ns.ex.cube, ns.ex.predicate, ns.ex.object)
          ]))
        })

        const source = new Source({ endpointUrl: await server.listen() })

        const result = await source.cube(ns.ex.cube)

        strictEqual(result instanceof Cube, true)
        strictEqual(called, 2)
      })
    })
  })

  describe('.cubes', () => {
    it('should be a method', () => {
      const source = new Source({ endpointUrl: ns.ex.endpoint })

      strictEqual(typeof source.cubes, 'function')
    })

    it('should return a list of initialized cubes', async () => {
      await withServer(async server => {
        let called = 0

        server.app.get('/', rdfHandler(), (req, res) => {
          called++

          const query = req.query.query

          if (query.includes('SELECT')) {
            res.set('content-type', 'application/sparql-results+json').json({
              results: {
                bindings: [{
                  cube: { type: 'uri', value: ns.ex.cube1.value }
                }, {
                  cube: { type: 'uri', value: ns.ex.cube2.value }
                }]
              }
            })
          } else {
            res.dataset(rdf.dataset([
              rdf.quad(ns.ex.cube, ns.ex.predicate, ns.ex.object)
            ]))
          }
        })

        const source = new Source({ endpointUrl: await server.listen() })

        const result = await source.cubes()

        strictEqual(Array.isArray(result), true)
        strictEqual(result.length, 2)
        strictEqual(result[0] instanceof Cube, true)
        strictEqual(result[1] instanceof Cube, true)
        strictEqual(called, 5)
      })
    })

    it('should skip fetching the shape if noShape is true', async () => {
      await withServer(async server => {
        let called = 0

        server.app.get('/', rdfHandler(), (req, res) => {
          called++

          const query = req.query.query

          if (query.includes('SELECT')) {
            res.set('content-type', 'application/sparql-results+json').json({
              results: {
                bindings: [{
                  cube: { type: 'uri', value: ns.ex.cube1.value }
                }, {
                  cube: { type: 'uri', value: ns.ex.cube2.value }
                }]
              }
            })
          } else {
            res.dataset(rdf.dataset([
              rdf.quad(ns.ex.cube, ns.ex.predicate, ns.ex.object)
            ]))
          }
        })

        const source = new Source({ endpointUrl: await server.listen() })

        await source.cubes({ noShape: true })

        strictEqual(called, 3)
      })
    })
  })
})
