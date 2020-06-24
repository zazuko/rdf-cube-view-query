const Filter = require('./Filter')
const ns = require('./namespaces')

class FilterBuilder {
  constructor (dimension) {
    this.dimension = dimension
  }

  eq (arg) {
    return new Filter({ dimension: this.dimension.ptr, operation: ns.view.Eq, arg })
  }

  ne (arg) {
    return new Filter({ dimension: this.dimension.ptr, operation: ns.view.Ne, arg })
  }

  gt (arg) {
    return new Filter({ dimension: this.dimension.ptr, operation: ns.view.Gt, arg })
  }

  lt (arg) {
    return new Filter({ dimension: this.dimension.ptr, operation: ns.view.Lt, arg })
  }

  gte (arg) {
    return new Filter({ dimension: this.dimension.ptr, operation: ns.view.Gte, arg })
  }

  lte (arg) {
    return new Filter({ dimension: this.dimension.ptr, operation: ns.view.Lte, arg })
  }
}

module.exports = FilterBuilder
