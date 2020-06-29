const clownface = require('clownface')
const rdf = require('rdf-ext')
const ns = require('./namespaces')

class CubeDimension {
  constructor ({ term = rdf.blankNode(), dataset = rdf.dataset(), graph } = {}) {
    this.ptr = clownface({ term, dataset, graph })
  }

  get path () {
    return this.ptr.out(ns.sh.path).term
  }

  get datatype () {
    return this.ptr.out(ns.sh.datatype).term
  }

  get minExclusive () {
    return this.ptr.out(ns.sh.minExclusive).term
  }

  get minInclusive () {
    return this.ptr.out(ns.sh.minInclusive).term
  }

  get maxExclusive () {
    return this.ptr.out(ns.sh.maxExclusive).term
  }

  get maxInclusive () {
    return this.ptr.out(ns.sh.maxInclusive).term
  }

  get in () {
    return [...this.ptr.out(ns.sh.in).list()].map(item => item.term)
  }

  out (...args) {
    return this.ptr.out(...args)
  }
}

module.exports = CubeDimension
