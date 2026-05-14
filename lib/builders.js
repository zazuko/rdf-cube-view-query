import Source from './Source.js'
import View from './View.js'

export class ViewBuilder {
  static fromDataset({ term, dataset, graph, source }) {
    const view = new View({ term, dataset, graph, source })
    view.updateEntities(Source)
    return { view }
  }
}
