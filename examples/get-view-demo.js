const { Source } = require('..')
const rdf = require('rdf-ext')

async function main () {
  const source = new Source({
    endpointUrl: 'https://int.lindas.admin.ch/query'
  })

  const view = await source.view(rdf.namedNode('https://ld.stadt-zuerich.ch/statistics/view/V000002'))

  const observations = await view.observations()
  console.log(observations)
}

main()
