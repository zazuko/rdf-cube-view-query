const clownface = require('clownface')
const rdf = require('rdf-ext')
const ns = require('./namespaces')

class CubeDimension {
  constructor ({ term = rdf.blankNode(), dataset = rdf.dataset(), graph } = {}) {
    this.ptr = clownface({ term, dataset, graph })
  }

  get datatype () {
    return this.ptr.out(ns.sh.datatype).term
  }

  get path () {
    return this.ptr.out(ns.sh.path).term
  }

  out (...args) {
    return this.ptr.out(...args)
  }
}

module.exports = CubeDimension
