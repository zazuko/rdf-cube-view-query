import chai, { expect } from 'chai'
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot'
import { cubeQuery } from '../lib/query/cube.js'
import * as ns from './support/namespaces.js'
import { cleanQuery } from './support/utils.js'

describe('query/cube', () => {
  chai.use(jestSnapshotPlugin())

  it('should create a DESCRIBE query for the cube and the version history', () => {
    const cube = ns.ex.cube
    const query = cubeQuery({ cube })

    expect(cleanQuery(query)).toMatchSnapshot()
  })

  it('should use the given named graph', () => {
    const cube = ns.ex.cube
    const graph = ns.ex.graph
    const query = cubeQuery({ cube, graph })

    expect(cleanQuery(query)).toMatchSnapshot()
  })
})
