const { strictEqual } = require('assert')
const withServer = require('express-as-promise/withServer')
const { describe, it } = require('mocha')
const rdf = require('rdf-ext')
const Source = require('../lib/Source')
const View = require('../lib/View')
const ns = require('./support/namespaces')

describe('View', () => {
  it('should be a constructor', () => {
    strictEqual(typeof View, 'function')
  })

  describe('.offset', () => {
    it('should be a method', () => {
      const view = new View()

      strictEqual(typeof view.offset, 'function')
    })

    it('should set the offset value', () => {
      const view = new View()

      view.offset(123)

      strictEqual(rdf.literal('123', ns.xsd.integer).equals(view.ptr.out(ns.view.projection).out(ns.view.offset).term), true)
    })

    it('should clear the offset value if null is given', () => {
      const view = new View()
      view.ptr.addOut(ns.view.offset, rdf.literal('123', ns.xsd.integer))

      view.offset(null)

      strictEqual(view.ptr.out(ns.view.projection).out(ns.view.offset).terms.length === 0, true)
    })

    it('should return the view if an argument is given', () => {
      const view = new View()

      const result = view.offset(123)

      strictEqual(result, view)
    })

    it('should return the offset value if no argument is given', () => {
      const view = new View()
      view.ptr.out(ns.view.projection).addOut(ns.view.offset, rdf.literal('123', ns.xsd.integer))

      const result = view.offset()

      strictEqual(result, 123)
    })

    it('should return null if no argument is given and there is no offset value', () => {
      const view = new View()

      const result = view.offset()

      strictEqual(result, null)
    })
  })

  describe('.limit', () => {
    it('should be a method', () => {
      const view = new View()

      strictEqual(typeof view.limit, 'function')
    })

    it('should set the limit value', () => {
      const view = new View()

      view.limit(123)

      strictEqual(rdf.literal('123', ns.xsd.integer).equals(view.ptr.out(ns.view.projection).out(ns.view.limit).term), true)
    })

    it('should clear the limit value if null is given', () => {
      const view = new View()
      view.ptr.out(ns.view.projection).addOut(ns.view.limit, rdf.literal('123', ns.xsd.integer))

      view.limit(null)

      strictEqual(view.ptr.out(ns.view.projection).out(ns.view.limit).terms.length === 0, true)
    })

    it('should return the view if an argument is given', () => {
      const view = new View()

      const result = view.limit(123)

      strictEqual(result, view)
    })

    it('should return the limit value if no argument is given', () => {
      const view = new View()
      view.ptr.out(ns.view.projection).addOut(ns.view.limit, rdf.literal('123', ns.xsd.integer))

      const result = view.limit()

      strictEqual(result, 123)
    })

    it('should return null if no argument is given and there is no offset value', () => {
      const view = new View()

      const result = view.limit()

      strictEqual(result, null)
    })
  })

  describe('observations', () => {
    it('should be a method', () => {
      const view = new View()

      strictEqual(typeof view.observations, 'function')
    })

    it('should use a GET query request', async () => {
      await withServer(async server => {
        let called = false

        server.app.get('/', (req, res) => {
          called = true

          res.status(201).end()
        })

        const source = new Source({ endpointUrl: await server.listen() })
        const view = new View({ parent: source })
        view.addDimension(view.createDimension({ path: ns.ex.dimension, source }))

        await view.observations()

        strictEqual(called, true)
      })
    })

    it('should use the defined operation for the query request', async () => {
      await withServer(async server => {
        let called = false

        server.app.post('/', (req, res) => {
          called = true

          res.status(201).end()
        })

        const source = new Source({ endpointUrl: await server.listen(), queryOperation: 'postDirect' })
        const view = new View({ parent: source })
        view.addDimension(view.createDimension({ path: ns.ex.dimension, source }))

        await view.observations()

        strictEqual(called, true)
      })
    })

    it('should use a query without DISTINCT if disableDistinct is true', async () => {
      await withServer(async server => {
        let query = null

        server.app.get('/', (req, res) => {
          query = req.query.query

          res.status(201).end()
        })

        const source = new Source({ endpointUrl: await server.listen() })
        const view = new View({ parent: source })
        view.addDimension(view.createDimension({ path: ns.ex.dimension, source }))

        await view.observations({ disableDistinct: true })

        strictEqual(query.includes('DISTINCT'), false)
      })
    })
  })

  describe('observationCount', () => {
    it('should be a method', () => {
      const view = new View()

      strictEqual(typeof view.observationCount, 'function')
    })

    it('should use a GET query request', async () => {
      await withServer(async server => {
        let called = false

        server.app.get('/', (req, res) => {
          called = true

          res.status(200).set('content-type', 'application/sparql-results+json').json({
            head: {
              vars: ['count']
            },
            results: {
              bindings: [{
                count: { type: 'literal', value: '5' }
              }]
            }
          })
        })

        const source = new Source({ endpointUrl: await server.listen() })
        const view = new View({ parent: source })
        view.addDimension(view.createDimension({ path: ns.ex.dimension, source }))

        await view.observationCount()

        strictEqual(called, true)
      })
    })

    it('should use the defined operation for the query request', async () => {
      await withServer(async server => {
        let called = false

        server.app.post('/', (req, res) => {
          called = true

          res.status(200).set('content-type', 'application/sparql-results+json').json({
            head: {
              vars: ['count']
            },
            results: {
              bindings: [{
                count: { type: 'literal', value: '5' }
              }]
            }
          })
        })

        const source = new Source({ endpointUrl: await server.listen(), queryOperation: 'postDirect' })
        const view = new View({ parent: source })
        view.addDimension(view.createDimension({ path: ns.ex.dimension, source }))

        await view.observationCount()

        strictEqual(called, true)
      })
    })

    it('should return the number of observations', async () => {
      await withServer(async server => {
        server.app.post('/', (req, res) => {
          res.status(200).set('content-type', 'application/sparql-results+json').json({
            head: {
              vars: ['count']
            },
            results: {
              bindings: [{
                count: { type: 'literal', value: '5' }
              }]
            }
          })
        })

        const source = new Source({ endpointUrl: await server.listen(), queryOperation: 'postDirect' })
        const view = new View({ parent: source })
        view.addDimension(view.createDimension({ path: ns.ex.dimension, source }))

        const count = await view.observationCount()

        strictEqual(count, 5)
      })
    })

    it('should use a query without DISTINCT if disableDistinct is true', async () => {
      await withServer(async server => {
        let query = null

        server.app.get('/', (req, res) => {
          query = req.query.query

          res.status(200).set('content-type', 'application/sparql-results+json').json({
            head: {
              vars: ['count']
            },
            results: {
              bindings: [{
                count: { type: 'literal', value: '5' }
              }]
            }
          })
        })

        const source = new Source({ endpointUrl: await server.listen() })
        const view = new View({ parent: source })
        view.addDimension(view.createDimension({ path: ns.ex.dimension, source }))

        await view.observationCount({ disableDistinct: true })

        strictEqual(query.includes('DISTINCT'), false)
      })
    })
  })
})
