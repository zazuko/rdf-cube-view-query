const Source = require('./Source.js')
const View = require('./View.js')

class ViewBuilder {
  static fromDataset ({ term, dataset, graph, source }) {
    const view = new View({ term, dataset, graph })
    view.updateEntities(new Source({ endpointUrl: '' })) // @TODO I send this to have Source constructor.
    return { view }
  }
}

module.exports = {
  ViewBuilder
}
