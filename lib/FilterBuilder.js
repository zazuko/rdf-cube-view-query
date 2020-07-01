const Filter = require('./Filter')
const ns = require('./namespaces')

class FilterBuilder {
  constructor (dimension) {
    this.dimension = dimension
  }

  eq (arg) {
    return new Filter({ dimension: this.dimension, operation: ns.view.Eq, arg })
  }

  ne (arg) {
    return new Filter({ dimension: this.dimension, operation: ns.view.Ne, arg })
  }

  lt (arg) {
    return new Filter({ dimension: this.dimension, operation: ns.view.Lt, arg })
  }

  gt (arg) {
    return new Filter({ dimension: this.dimension, operation: ns.view.Gt, arg })
  }

  lte (arg) {
    return new Filter({ dimension: this.dimension, operation: ns.view.Lte, arg })
  }

  gte (arg) {
    return new Filter({ dimension: this.dimension, operation: ns.view.Gte, arg })
  }

  in (arg) {
    return new Filter({ dimension: this.dimension, operation: ns.view.In, arg })
  }
}

module.exports = FilterBuilder
