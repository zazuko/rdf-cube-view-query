import { strictEqual } from 'assert'
import { cubeQuery } from '../lib/query/cube.js'
import * as ns from './support/namespaces.js'
import { compareQuery } from './support/compareQuery.js'

describe('query/cube', () => {
  it('should be a function', () => {
    strictEqual(typeof cubeQuery, 'function')
  })

  it('should create a DESCRIBE query for the cube and the version history', async () => {
    const cube = ns.ex.cube
    const query = cubeQuery({ cube })

    await compareQuery({ name: 'cube', query })
  })

  it('should use the given named graph', async () => {
    const cube = ns.ex.cube
    const graph = ns.ex.graph
    const query = cubeQuery({ cube, graph })

    await compareQuery({ name: 'cubeGraph', query })
  })
})
