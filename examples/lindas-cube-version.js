import rdf from '@zazuko/env'
import { Cube, Source } from '../index.js'

async function main() {
  const source = new Source({
    endpointUrl: 'https://int.lindas.admin.ch/query',
  })

  // the isPartOf filter allows to search only in a specific version history
  const cubes = await source.cubes({
    filters: [
      Cube.filter.isPartOf(rdf.namedNode('https://environment.ld.admin.ch/foen/udb28-annualmean-2')),
      Cube.filter.version.gte(3),
    ],
  })

  for (const cube of cubes) {
    const iri = cube.term.value
    const label = cube.out(rdf.ns.schema.name, { language: ['en', 'de', '*'] })

    console.log(`${iri}: ${label}`)
  }
}

main()
