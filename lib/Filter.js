const Node = require('./Node')
const ns = require('./namespaces')
const { toTerm } = require('./utils')

class Filter extends Node {
  constructor ({ parent, term, dataset, graph, dimension, operation, arg }) {
    super({
      parent: parent || dimension.parent,
      term,
      dataset: dataset || dimension.ptr.dataset,
      graph
    })

    this.ptr
      .addOut(ns.view.dimension, toTerm(dimension))
      .addOut(ns.view.operation, operation)
      .addOut(ns.view.argument, arg[Symbol.iterator] ? [...arg] : arg)
  }

  clear () {
    super.clear()

    this.ptr.deleteOut()
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
