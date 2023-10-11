import { strictEqual } from 'assert'
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
      const source = new Source({ endpointUrl: ns.ex.endpointUrl, queryPrefix: 'Some prefix' })

      const cubeSource = CubeSource.fromSource(source, ns.ex.cube)

      strictEqual(cubeSource.queryPrefix, 'Some prefix')
    })
  })
})
