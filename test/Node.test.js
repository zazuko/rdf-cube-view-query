import { strictEqual, deepStrictEqual } from 'assert'
import rdf from '@zazuko/env'
import Node from '../lib/Source.js'
import { Source, Dimension, View } from '../index.js'
import * as ns from './support/namespaces.js'

describe('Node', () => {
  it('should be a constructor', () => {
    strictEqual(typeof Node, 'function')
  })

  it('It clears a view', () => {
    const source = new Source({ endpointUrl: ns.ex.endpoint, sourceGraph: ns.ex.sourceGraph })

    const term = ns.ex.test
    const dataset = rdf.dataset()
    const graph = ns.ex.graph

    const dimension = new Dimension({
      parent: source, term, dataset, graph, path: ns.ex.date, source,
    })
    const view = new View({ parent: source })
    const f1 = dimension.filter.eq(ns.ex.a, { parent: view })
    view.addDimension(dimension).addFilter(f1)

    strictEqual(source.children.size, 2)
    view.clear()
    strictEqual(source.children.size, 1)
    strictEqual([...source.children][0].constructor.name, dimension.constructor.name, 'should have only the dimension as child')
  })

  function screenshot(node) {
    return {
      term: node.term.value, name: node.constructor.name, size: node.dataset.size, children: node.children ? [...node.children].map(child => screenshot(child)) : undefined,
    }
  }

  it('It clears two views with filters from the same dimension', () => {
    const source = new Source({ endpointUrl: ns.ex.endpoint, sourceGraph: ns.ex.sourceGraph })

    const term = ns.ex.test
    const dataset = rdf.dataset()
    const graph = ns.ex.graph

    const dimension = new Dimension({
      parent: source, term, dataset, graph, path: ns.ex.date, source,
    })

    const noViews = screenshot(source)

    const firstView = new View({ parent: source })
    const f1 = dimension.filter.eq(ns.ex.a, { parent: firstView })
    const f2 = dimension.filter.eq(ns.ex.b, { parent: firstView })
    firstView.addDimension(dimension).addFilter(f1).addFilter(f2)

    const onlyFirstView = screenshot(source)

    const secondView = new View({ parent: source })
    const f3 = dimension.filter.eq(ns.ex.a, { parent: secondView })
    secondView.addDimension(dimension).addFilter(f3)

    secondView.clear()

    const current = screenshot(source)

    deepStrictEqual(current, onlyFirstView)

    firstView.clear()

    const bothViewsCleared = screenshot(source)

    deepStrictEqual(bothViewsCleared, noViews, 'should be nodes without views')
  })
})
