const { Source, View } = require('..')

async function main () {
  const source = new Source({
    endpointUrl: 'https://int.lindas.admin.ch/query'
  })

  const cube = await source.cube('https://ld.stadt-zuerich.ch/statistics/ZUS-BTA-ZSA')
  const view = View.fromCube(cube)

  const observations = await view.observations()
  console.log('---------')
  console.log('view.observations().length', observations.length)

  const count = await view.observationCount()
  console.log('---------')
  console.log('count', count)

  console.log('---------')
  console.log('All cubes', view.cubes())
}

main()
