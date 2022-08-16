const { Source, View } = require('..')

async function main () {
  const source = new Source({
    endpointUrl: 'https://int.lindas.admin.ch/query'
  })

  const cube = await source.cube('https://ld.stadt-zuerich.ch/statistics/ZUS-BTA-ZSA')
  const view = View.fromCube(cube)

  console.log('---------')
  console.log('All cubes', view.cubes())

  console.log('---------')
  console.log('All sources', view.sources().map(x => x.endpoint))

  const observations = await view.observations()
  console.log('---------')
  console.log('view.observations().length', observations.length)

  const count = await view.observationCount()
  console.log('---------')
  console.log('count', count)

  console.log('---------')
  for (const dimension of view.dimensions) {
    const cubeDimension = dimension.cubeDimensions[0]
    console.log('dimension', cubeDimension.path?.value, 'from cubes', dimension.cubes)
  }
}

main()
