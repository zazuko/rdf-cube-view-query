const { Source } = require('..')
const rdf = require('rdf-ext')

async function main () {
  const source = new Source({
    endpointUrl: 'https://int.lindas.admin.ch/query'
  })

  const view = await source.view(rdf.namedNode('https://ld.stadt-zuerich.ch/statistics/view/V000002'))

  const observations = await view.observations()
  console.log('view.observations().length', observations.length)

  const count = await view.observationCount()
  console.log('count', count)

  // Constraints that apply to each dimension
  await view.fetchCubeShape()

  for (const dimension of view.dimensions) {
    const cubeDimension = dimension.cubeDimensions[0]
    // Some cube dimensions are undefined?
    if (cubeDimension) {
      console.log(cubeDimension.path, cubeDimension.cube)
    }
  }
}

main()
