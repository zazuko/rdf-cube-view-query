const Node = require('./Node')
const ns = require('./namespaces')
const { toTerm } = require('./utils')

class Filter extends Node {
  constructor ({ parent, term, dataset, graph, dimension, func, operation, arg, argList = false }) {
    super({
      parent: parent || dimension.parent,
      term,
      dataset: dataset || dimension.dataset,
      graph
    })

    // If term is given, use it as a pointer. Create quads otherwise.
    if (!term) {
      this.ptr
        .addOut(ns.rdf.type, ns.view.Filter)
        .addOut(ns.view.dimension, toTerm(dimension))
        .addOut(ns.view.operation, operation)

      if (func) {
        this.ptr.addOut(ns.view.function, func)
      }

      if (argList) {
        this.ptr.addList(ns.view.argument, arg[Symbol.iterator] ? [...arg] : [arg])
      } else {
        this.ptr.addOut(ns.view.argument, arg[Symbol.iterator] ? [...arg] : arg)
      }
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

  clear () {
    if (this.ptr.isList()) {
      this.ptr.deleteList(ns.view.argument)
    } else {
      this.ptr.deleteOut(ns.view.argument)
    }

    super.clear()
  }
}

Filter.func = {
  day: ns.view.Day,
  month: ns.view.Month,
  year: ns.view.Year
}

module.exports = Filter
