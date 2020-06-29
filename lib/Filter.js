const clownface = require('clownface')
const rdf = require('rdf-ext')
const ns = require('./namespaces')

class Filter {
  constructor ({ term = rdf.blankNode(), dataset = rdf.dataset(), graph, dimension, operation, arg }) {
    this.ptr = clownface({ term, dataset, graph })

    this.ptr
      .addOut(ns.view.dimension, dimension)
      .addOut(ns.view.operation, operation)
      .addOut(ns.view.argument, arg[Symbol.iterator] ? [...arg] : arg)
  }

  get dimension () {
    return this.ptr.out(ns.view.dimension).term
  }

  get operation () {
    return this.ptr.out(ns.view.operation).term
  }

  get arg () {
    return this.ptr.out(ns.view.argument).term
  }

  get args () {
    return this.ptr.out(ns.view.argument).terms
  }
}

module.exports = Filter
