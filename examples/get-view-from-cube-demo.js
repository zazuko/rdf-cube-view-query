import { Source, View } from '../index.js'

async function main() {
  const queryPrefix = `#pragma describe.strategy cbd
#pragma join.hash off`

  const source = new Source({
    endpointUrl: 'https://lindas.admin.ch/query',
    queryPrefix,
  })

  const cube = await source.cube('https://environment.ld.admin.ch/foen/nfi/nfi_C-2207/cube/2023-2')
  const view = View.fromCube(cube)

  console.log('---------')
  console.log('All sources', view.sources().map(x => x.endpoint))

  console.log('---------')
  console.log('All cubes', view.cubes().map(x => x.value))

  const observations = await view.observations()
  console.log('---------')
  console.log('observations length', observations.length)

  const count = await view.observationCount()
  console.log('---------')
  console.log('observations count', count)

  console.log('---------')
  for (const dimension of view.dimensions) {
    console.log('dimensions', dimension.cubeDimensions.map(x => x.path.value), 'from cubes', dimension.cubes.map(x => x.value))
  }

  console.log('---------')
  console.log('Sample observation')
  const previewRows = await view.preview({ limit: 1 })
  console.log(previewRows)
}

main()
