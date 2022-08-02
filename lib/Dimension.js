const CubeDimension = require('./CubeDimension')
const FilterBuilder = require('./FilterBuilder')
const Node = require('./Node')
const ns = require('./namespaces')
const { toTerm } = require('./utils')

class Dimension extends Node {
  constructor ({ parent, term, dataset, graph, aggregate, as, join, path, source }) {
    super({
      parent,
      term,
      dataset,
      graph
    })

    // If term is given, use it as a pointer. Create quads otherwise.
    if (!term) {
      this.ptr
        .addOut(ns.view.from, from => {
          from.addOut(ns.view.source, toTerm(source))

          if (Array.isArray(path)) {
            from.addList(ns.view.path, path)
          } else {
            from.addOut(ns.view.path, path)
          }

          if (join) {
            from.addOut(ns.view.join, toTerm(join))
          }
        })
        .addOut(ns.view.as, as || path)

      if (aggregate) {
        this.ptr.addOut(ns.view.aggregate, aggregate)
      }
    }

    this.source = source

    this.filter = new FilterBuilder(this)
  }

  clear () {
    this.ptr.out(ns.view.from).deleteOut()

    super.clear()
  }

  get cubeDimensions () {
    return this.ptr.out(ns.view.from).out(ns.view.path).in(ns.sh.path).map(ptr => new CubeDimension({
      term: ptr.term,
      dataset: ptr.dataset,
      graph: ptr.graph
    }))
  }
}

Dimension.aggregate = {
  avg: ns.view.Avg,
  max: ns.view.Max,
  min: ns.view.Min
}

module.exports = Dimension
