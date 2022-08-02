const { Source } = require('..')

async function main () {
  // a source manages the SPARQL endpoint information + the named graph
  const source = new Source({
    endpointUrl: 'https://int.lindas.admin.ch/query',
    queryOperation: 'postDirect'
  })

  // the source can be used to search for cubes on the endpoint in the given named graph
  const views = await source.views({ noShape: true })

  const view = views[2]

  await view.init()
  console.log('view.dimensions.length', view.dimensions.length)
  console.log('view.filters.length', view.filters.length)

  const observations = await view.observations()

  console.log(observations)
}

main()
