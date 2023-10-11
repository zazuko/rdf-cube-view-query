import Source from './Source.js'
import View from './View.js'

export class ViewBuilder {
  static fromDataset({ term, dataset, graph, source }) {
    const view = new View({ term, dataset, graph, source })
    view.updateEntities(new Source({ endpointUrl: '' })) // @TODO I send this to access the Source constructor. It's like this in the meantime because of circular dependency
    return { view }
  }
}
