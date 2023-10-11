import rdf from '@zazuko/env'
import { Cube, Source } from '../index.js'

const adminTerm = rdf.namespace('https://ld.admin.ch/definedTerm/')

async function main() {
  const source = new Source({
    endpointUrl: 'https://int.lindas.admin.ch/query',
  })

  // the source can be used to search for cubes and allows server side filtering
  const cubes = await source.cubes({
    filters: [
      Cube.filter.noValidThrough(),
      Cube.filter.status(adminTerm('CreativeWorkStatus/Draft')),
    ],
  })

  for (const cube of cubes) {
    const iri = cube.term.value
    const label = cube.out(rdf.ns.schema.name, { language: ['en', 'de', '*'] })
    const versionHistory = cube.in(rdf.ns.schema.hasPart).value

    console.log(`${iri}: ${label} (${versionHistory})`)
  }
}

main()
