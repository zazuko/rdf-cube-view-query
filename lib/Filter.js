const Node = require('./Node')
const ns = require('./namespaces')
const { toTerm } = require('./utils')

class Filter extends Node {
  constructor ({ parent, term, dataset, graph, dimension, operation, arg, argList = false }) {
    super({
      parent: parent || dimension.parent,
      term,
      dataset: dataset || dimension.dataset,
      graph
    })

    this.ptr
      .addOut(ns.rdf.type, ns.view.Filter)
      .addOut(ns.view.dimension, toTerm(dimension))
      .addOut(ns.view.operation, operation)

    if (argList) {
      this.ptr.addList(ns.view.argument, arg[Symbol.iterator] ? [...arg] : [arg])
    } else {
      this.ptr.addOut(ns.view.argument, arg[Symbol.iterator] ? [...arg] : arg)
    }
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
