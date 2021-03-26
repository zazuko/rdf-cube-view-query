const { strictEqual } = require('assert')
const withServer = require('express-as-promise/withServer')
const { describe, it } = require('mocha')
const Source = require('../lib/Source')
const View = require('../lib/View')
const ns = require('./support/namespaces')

describe('View', () => {
  it('should be a constructor', () => {
    strictEqual(typeof View, 'function')
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
  })
})
