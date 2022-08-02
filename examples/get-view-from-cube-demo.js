const { Source, View } = require('..')
const { CubeSource } = require('../index.js')

async function main () {
  // a source manages the SPARQL endpoint information + the named graph
  const source = new Source({
    endpointUrl: 'https://int.lindas.admin.ch/query'
    // sourceGraph: ''
    // user: '',
    // password: ''
  })

  const cube = await source.cube('https://ld.stadt-zuerich.ch/statistics/ZUS-BTA-ZSA')
  cube.source = CubeSource.fromSource(cube.source, cube)
  const view = View.fromCube(cube)
  const observations = await view.observations()

  console.log('observations.length', observations.length)
}

main()
