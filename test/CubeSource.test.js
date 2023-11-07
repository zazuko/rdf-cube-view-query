import { strictEqual } from 'assert'
import ParsingClient from 'sparql-http-client/ParsingClient.js'
import CubeSource from '../lib/CubeSource.js'
import Source from '../lib/Source.js'
import * as ns from './support/namespaces.js'

describe('CubeSource', () => {
  it('should be a constructor', () => {
    strictEqual(typeof CubeSource, 'function')
  })

  describe('.fromSource', () => {
    it('should be a method', () => {
      strictEqual(typeof CubeSource.fromSource, 'function')
    })

    it('should maintain queryPrefix', async () => {
      const client = new ParsingClient({ endpointUrl: ns.ex.endpoint })
      const source = new Source({ client, queryPrefix: 'Some prefix' })

      const cubeSource = CubeSource.fromSource(source, ns.ex.cube)

      strictEqual(cubeSource.queryPrefix, 'Some prefix')
    })
  })
})
