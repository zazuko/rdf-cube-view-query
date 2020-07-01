const rdf = require('rdf-ext')

function findDataset (objects) {
  const datasets = new Set(objects.map(object => (object.ptr && object.ptr.dataset) || object.dataset))

  if (datasets.size > 1) {
    throw new Error('all child objects must be created from the same View')
  }

  if (datasets.size === 1) {
    return [...datasets][0]
  }

  return null
}

function toTerm (object) {
  // API object
  if (object.ptr) {
    return object.ptr.term
  }

  // clownface object
  if (object.term) {
    return object.term
  }

  // RDF/JS term
  if (object.termType) {
    return object
  }

  if (typeof object === 'string') {
    return rdf.namedNode(object)
  }

  return null
}

module.exports = {
  findDataset,
  toTerm
}
