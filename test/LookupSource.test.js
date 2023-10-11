import { strictEqual } from 'assert'
import LookupSource from '../lib/LookupSource.js'
import Source from '../lib/Source.js'
import * as ns from './support/namespaces.js'

describe('LookupSource', () => {
  it('should be a constructor', () => {
    strictEqual(typeof LookupSource, 'function')
  })

  describe('.fromSource', () => {
    it('should be a method', () => {
      strictEqual(typeof LookupSource.fromSource, 'function')
    })

    it('should maintain queryPrefix', async () => {
      const source = new Source({ endpointUrl: ns.ex.endpointUrl, queryPrefix: 'Some prefix' })

      const lookupSource = LookupSource.fromSource(source)

      strictEqual(lookupSource.queryPrefix, 'Some prefix')
    })
  })
})
