const { strictEqual, throws } = require('assert')
const withServer = require('express-as-promise/withServer')
const { describe, it } = require('mocha')
const rdf = require('rdf-ext')
const Source = require('../lib/Source')
const View = require('../lib/View')
const ns = require('./support/namespaces')
const { Parser } = require('n3')
const { ViewBuilder } = require('../lib/viewUtils.js')

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

  describe('.orderBy', () => {
    it('should be a method', () => {
      const view = new View()

      strictEqual(typeof view.orderBy, 'function')
    })

    it('should set the orderBy value', () => {
      const view = new View()

      view.orderBy([{ dimension: ns.ex.dimension, direction: ns.ex.direction }, { dimension: ns.ex.dimension2, direction: ns.ex.direction2 }])

      strictEqual(view.ptr.out(ns.view.projection).out(ns.view.orderBy).isList(), true)
      strictEqual([...view.ptr.out(ns.view.projection).out(ns.view.orderBy).list()].length, 2)

      const first = [...view.ptr.out(ns.view.projection).out(ns.view.orderBy).list()][0]
      const second = [...view.ptr.out(ns.view.projection).out(ns.view.orderBy).list()][1]

      strictEqual(first.out(ns.view.dimension).term.equals(ns.ex.dimension), true)
      strictEqual(first.out(ns.view.direction).term.equals(ns.ex.direction), true)
      strictEqual(second.out(ns.view.dimension).term.equals(ns.ex.dimension2), true)
      strictEqual(second.out(ns.view.direction).term.equals(ns.ex.direction2), true)
    })

    it('should clear the orderBy value if null is given', () => {
      const view = new View()

      view.ptr.out(ns.view.projection).addList(ns.view.orderBy, [ns.ex.value])

      view.dataset.add(rdf.quad(ns.ex.value, ns.view.direction, ns.ex.value1))
      view.dataset.add(rdf.quad(ns.ex.value, ns.view.dimension, ns.ex.value2))

      strictEqual(view.ptr.node(ns.ex.value).out().terms.length, 2)

      view.orderBy(null)

      strictEqual(view.ptr.out(ns.view.projection).out(ns.view.orderBy).terms.length === 0, true)
      strictEqual(view.ptr.node(ns.ex.value).out().terms.length, 0)
    })

    it('should return the view if an argument is given', () => {
      const view = new View()

      const result = view.orderBy([{ dimension: ns.ex.dimension, direction: ns.ex.direction }])

      strictEqual(result, view)
    })

    it('should return the orderBy value if no argument is given', () => {
      const view = new View()

      view.ptr.out(ns.view.projection).addList(ns.view.orderBy, [ns.ex.value])

      view.dataset.add(rdf.quad(ns.ex.value, ns.view.direction, ns.ex.value1))
      view.dataset.add(rdf.quad(ns.ex.value, ns.view.dimension, ns.ex.value2))

      const result = view.orderBy()

      strictEqual(result.length, 1)
      strictEqual(result[0].direction.equals(ns.ex.value1), true)
      strictEqual(result[0].dimension.equals(ns.ex.value2), true)
    })

    it('should return null if no argument is given and there is no orderBy value', () => {
      const view = new View()

      const result = view.orderBy()

      strictEqual(result, null)
    })
  })

  describe('.updateProjection', () => {
    it('should be a method', () => {
      const view = new View()

      strictEqual(typeof view.updateProjection, 'function')
    })

    it('should add offset, limit and orderby', () => {
      const view = new View()

      view.updateProjection({ offset: 1, limit: 2, orderBy: [{ direction: ns.ex.direction, dimension: ns.ex.dimension }] })

      strictEqual(view.offset(), 1)
      strictEqual(view.limit(), 2)
      strictEqual(view.orderBy().length, 1)
    })

    it('should clear the values if null is given', () => {
      const view = new View()

      view.updateProjection({ offset: 1, limit: 2, orderBy: [{ direction: ns.ex.direction, dimension: ns.ex.dimension }] })

      view.updateProjection({ offset: null, limit: null, orderBy: null })
      strictEqual(view.offset(), null)
      strictEqual(view.limit(), null)
      strictEqual(view.orderBy(), null)
    })

    it('should update previous values', () => {
      const view = new View()

      view.updateProjection({ offset: 1, limit: 2, orderBy: [{ direction: ns.ex.direction, dimension: ns.ex.dimension }] })

      view.updateProjection({ offset: 3, limit: 4, orderBy: [{ direction: ns.ex.direction2, dimension: ns.ex.dimension2 }] })

      strictEqual(view.offset(), 3)
      strictEqual(view.limit(), 4)
      strictEqual(view.orderBy().length, 1)
      strictEqual(ns.ex.direction2.equals(view.orderBy()[0].direction), true)
      strictEqual(ns.ex.dimension2.equals(view.orderBy()[0].dimension), true)
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

  describe('.getMainSource', () => {
    it('should be a method', () => {
      const view = new View()

      strictEqual(typeof view.getMainSource, 'function')
    })

    it('fails when there is no source defined', () => {
      const view = new View({ })

      throws(() => {
        view.getMainSource()
      }, {
        name: 'Error',
        message: 'Needs a explicit Source or a source attached to the CubeDimensions'
      })
    })

    it('gets the source if explicitly defined', () => {
      const expected = new Source({ endpointUrl: ns.ex.endpoint.value })
      const view = new View({ source: expected })
      const actual = view.getMainSource()
      strictEqual(actual, expected)
    })

    it('gets the source from a cube', () => {
      const viewTTL = `
<https://example.org/view> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://cube.link/view/View> .
<https://example.org/view> <https://cube.link/view/dimension> _:b37 .
_:b37 <https://cube.link/view/from> _:b38 .
_:b37 <https://cube.link/view/as> <https://ld.stadt-zuerich.ch/statistics/property/ZEIT> .
_:b38 <https://cube.link/view/source> _:b34 .
_:b38 <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/property/ZEIT> .
_:b34 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://cube.link/view/CubeSource> .
_:b34 <https://cube.link/view/endpoint> <http://example.org/endpoint> .
_:b34 <https://cube.link/view/cube> <https://ld.stadt-zuerich.ch/statistics/BEW-SEX> .
`
      const parser = new Parser()

      const quads = parser.parse(viewTTL)
      const dataset = rdf.dataset().addAll(quads)
      const term = rdf.namedNode('https://example.org/view')
      const { view } = ViewBuilder.fromDataset({ dataset, term })

      const source = view.getMainSource()
      strictEqual(source.endpoint.value, ns.ex.endpoint.value)
    })
  })
})
