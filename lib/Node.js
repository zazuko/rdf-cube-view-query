const clownface = require('clownface')
const rdf = require('rdf-ext')

class Node {
  constructor ({ parent, term = rdf.blankNode(), dataset = rdf.dataset(), graph }) {
    this.parent = parent
    this.ptr = clownface({ term, dataset, graph })
    this.children = new Set()

    if (this.parent) {
      this.parent.children.add(this)
    }
  }

  clear () {
    for (const child of this.children) {
      child.clear()
    }

    this.ptr.deleteOut()
  }
}

module.exports = Node
