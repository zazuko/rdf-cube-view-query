const clownface = require('clownface')
const rdf = require('rdf-ext')
const CubeDimension = require('./CubeDimension')
const FilterBuilder = require('./FilterBuilder')
const ns = require('./namespaces')

class Dimension {
  constructor ({ term = rdf.blankNode(), dataset = rdf.dataset(), graph, path, as, source }) {
    this.ptr = clownface({ term, dataset, graph })

    this.ptr
      .addOut(ns.view.from, from => {
        from
          .addOut(ns.view.source, source.ptr)
          .addOut(ns.view.path, path)
      })
      .addOut(ns.view.as, as)

    this.source = source

    this.filter = new FilterBuilder(this)
  }

  get cubeDimensions () {
    return this.ptr.out(ns.view.from).out(ns.view.path).in(ns.sh.path).map(ptr => new CubeDimension({
      term: ptr.term,
      dataset: ptr.dataset,
      graph: ptr.graph
    }))
  }
}

module.exports = Dimension
