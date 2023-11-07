import { strictEqual } from 'assert'
import ParsingClient from 'sparql-http-client/ParsingClient.js'
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
      const client = new ParsingClient({ endpointUrl: ns.ex.endpoint })
      const source = new Source({ client, queryPrefix: 'Some prefix' })

      const lookupSource = LookupSource.fromSource(source)

      strictEqual(lookupSource.queryPrefix, 'Some prefix')
    })
  })
})
