import rdf from '@zazuko/env'
import { CubeSource, LookupSource, Node, Source, View } from '../index.js'

const dh = rdf.namespace('http://ns.bergnet.org/dark-horse#')

// creates a map with the cube dimension value as the key and the lookup path value as the value
async function createMap({ cubeFilter, cubePath, cubeSource, lookupFilter, lookupPath, lookupSource } = {}) {
  const parent = new Node({ parent: cubeSource })
  const view = new View({ parent })

  const cubeDimension = view.createDimension({
    source: cubeSource,
    path: cubePath,
    as: 'cube',
  })

  view.addDimension(cubeDimension)

  if (typeof cubeFilter === 'function') {
    const filter = cubeFilter(cubeDimension)

    if (filter) {
      view.addFilter(filter)
    }
  }

  const lookupDimension = view.createDimension({
    source: lookupSource || LookupSource.fromSource(cubeSource, { parent }),
    path: lookupPath,
    join: cubeDimension,
    as: 'lookup',
  })

  view.addDimension(lookupDimension)

  if (typeof lookupFilter === 'function') {
    const filter = lookupFilter(lookupDimension)

    if (filter) {
      view.addFilter(filter)
    }
  }

  const observations = await view.observations()

  parent.clear()

  return rdf.termMap(observations.map(observation => {
    return [
      observation.cube,
      observation.lookup,
    ]
  }))
}

async function main() {
  // a source manages the SPARQL endpoint information + the named graph
  const source = new Source({
    endpointUrl: 'http://ld.zazuko.com/query',
    sourceGraph: 'http://ld.zazuko.com/cube-demo',
    // user: '',
    // password: ''
  })

  // let's create a cube and lookup source based on the existing source
  const cubeSource = CubeSource.fromSource(source, rdf.namedNode('http://example.org/rdf-cube-schema-example/temperature-sensor/cube'))

  // we start with an empty view
  const customView = new View({ parent: cubeSource })

  // now let's create the dimensions
  const dateDimension = customView.createDimension({
    source: cubeSource,
    path: rdf.ns.dc.date,
  })

  const temperatureDimension = customView.createDimension({
    source: cubeSource,
    path: dh.temperature,
  })

  const roomDimension = customView.createDimension({
    source: cubeSource,
    path: dh.room,
  })

  // now let's add all dimensions and filters
  customView
    .addDimension(dateDimension)
    .addDimension(temperatureDimension)
    .addDimension(roomDimension)

  const roomLabelMap = await createMap({
    cubePath: dh.room,
    cubeSource,
    lookupFilter: d => d.filter.lang(['', 'de', 'en', '*']),
    lookupPath: rdf.ns.schema.name,
  })

  // let's fetch the observations
  const observations = await customView.observations()

  // and join the observations with the room lookup map
  for (const observation of observations) {
    const columns = [
      observation[rdf.ns.dc.date.value].value,
      observation[dh.temperature.value].value,
      // the room dimension is used to lookup the room label
      roomLabelMap.get(observation[dh.room.value]).value,
    ]

    console.log(columns.join(','))
  }
}

main()
