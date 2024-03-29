import * as ns from '../../namespaces.js'
import { toPropertyPath } from '../utils.js'

export default class Patterns {
  constructor(viewQuery) {
    this.viewQuery = viewQuery

    for (const dimension of this.viewQuery.dimensions.array) {
      this.initDimension({ dimension })
    }
  }

  initDimension({ dimension }) {
    dimension.patterns = []

    dimension.ptr.out(ns.view.from).forEach(from => {
      const sources = from.out(ns.view.source).toArray().map(ptr => this.viewQuery.sources.get(ptr.term))

      for (const source of sources) {
        const path = toPropertyPath(from.out(ns.view.path))

        if (source.isCubeSource) {
          dimension.patterns.push([
            source.variable,
            path,
            dimension.variable,
            source.graph,
          ])
        }

        if (source.isLookupSource) {
          const join = this.viewQuery.dimensions.get(from.out(ns.view.join).term)

          dimension.patterns.push([
            join.variable,
            path,
            dimension.variable,
            source.graph,
          ])
        }
      }
    })
  }

  get sourcePatterns() {
    return this.viewQuery.sources.array
      .map(source => source.patterns)
      .reduce((all, pattern) => all.concat(pattern), [])
  }

  get dimensionPatterns() {
    return this.viewQuery.dimensions.array
      .filter(dimension => !dimension.filterPattern)
      .map(dimension => dimension.patterns)
      .reduce((all, pattern) => all.concat(pattern), [])
  }

  buildPatterns() {
    return [
      ...this.sourcePatterns,
      ...this.dimensionPatterns,
    ]
  }
}
