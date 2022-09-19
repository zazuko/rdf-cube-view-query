const rdf = require('rdf-ext')

function viewFullQuery ({ view, graph = rdf.defaultGraph() } = {}) {
  return `#pragma describe.strategy cbd 
DESCRIBE <${view.value}>`
}

module.exports = viewFullQuery
