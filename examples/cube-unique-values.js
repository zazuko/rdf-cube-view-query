/**
 * This example shows how to retrieve unique values for a particular dimension
 * (here, dates) given a filter on another dimension (here room).
 */

import rdf from '@zazuko/env'
import { CubeSource, Source, View } from '../index.js'

const dh = rdf.namespace('http://ns.bergnet.org/dark-horse#')

async function main() {
  const source = new Source({
    endpointUrl: 'http://ld.zazuko.com/query',
    sourceGraph: 'http://ld.zazuko.com/cube-demo',
  })

  const cubeSource = CubeSource.fromSource(
    source,
    rdf.namedNode(
      'http://example.org/rdf-cube-schema-example/temperature-sensor/cube',
    ),
  )

  const room1 = rdf.namedNode('http://example.org/rdf-cube-schema-example/building1/level1/room1')
  const customView = new View({ parent: cubeSource })
  const dateDimension = customView.createDimension({
    source: cubeSource,
    path: rdf.ns.dc.date,
  })
  const roomDimension = customView.createDimension({
    source: cubeSource,
    path: dh.room,
  })
  customView
    .addDimension(dateDimension) // We are only interested in getting unique values for dates
    // And we add the room filter to retrieve dates for observations that have the room 1
    .addFilter(roomDimension.filter.eq(room1))

  // Uncomment to see the resulting sparql query
  // console.log(customView.observationsQuery().query.toString());
  const observations = await customView.observations()

  for (const observation of observations) {
    console.log(observation[rdf.ns.dc.date.value].value)
  }
}

main()
