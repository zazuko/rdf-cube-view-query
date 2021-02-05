const { Cube, Source } = require('..')
const rdf = require('rdf-ext')
const namespace = require('@rdfjs/namespace')

const ns = {
  adminTerm: namespace('https://ld.admin.ch/definedTerm/'),
  schema: namespace('http://schema.org/')
}

async function main () {
  const source = new Source({
    endpointUrl: 'https://test.lindas.admin.ch/query'
  })

  // the isPartOf filter allows to search only in a specific version history
  const cubes = await source.cubes({
    filters: [
      Cube.filter.isPartOf(rdf.namedNode('https://environment.ld.admin.ch/foen/bil-p-01')),
      Cube.filter.noValidThrough(),
      Cube.filter.status(ns.adminTerm('creativeWorkStatus/published'))
    ]
  })

  for (const cube of cubes) {
    const iri = cube.term.value
    const label = cube.out(ns.schema.name, { language: ['en', 'de', '*'] })

    console.log(`${iri}: ${label}`)
  }
}

main()
