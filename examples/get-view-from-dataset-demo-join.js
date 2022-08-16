const { Parser } = require('n3')
const rdf = require('rdf-ext')
const { ViewBuilder } = require('../lib/viewUtils.js')
const { Source } = require('../index.js')

async function main () {
  const source = new Source({
    endpointUrl: 'https://ld.integ.stadt-zuerich.ch/query'
  })

  const { dataset, term } = getSampleData()
  const { view } = ViewBuilder.fromDataset({ dataset, term, source })

  const { query } = view.observationsQuery()
  console.log('---------')
  console.log('observationsQuery', query.toString())

  const observations = await view.observations()
  console.log('---------')
  console.log('view.observations().length', observations.length)

  const count = await view.observationCount()
  console.log('---------')
  console.log('count', count)

  console.log('---------')
  console.log('All cubes', view.cubes())

  // Constraints that apply to each dimension
  await view.fetchCubesShapes()

  console.log('---------')
  for (const dimension of view.dimensions) {
    const cubeDimension = dimension.cubeDimensions[0]
    console.log('dimension', cubeDimension.path?.value, 'from cubes', dimension.cubes)
  }
}

function getSampleData () {
  const viewTTL = `
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

<https://example.org/view> a <https://cube.link/view/View> ;
 <https://cube.link/view/dimension> _:b7, _:b141, _:b211, _:b336, _:b472 ;
 <https://cube.link/view/projection> [
 <https://cube.link/view/columns> (
   _:b7
   _:b141
   _:b211
   _:b336
   _:b472
 ) ;
 ] ;
 <urn:ssz:source> _:b6, _:b40 .

_:b6 a <https://cube.link/view/CubeSource> ;
    rdfs:label "BEW" ;
   <https://cube.link/view/cube> <https://ld.stadt-zuerich.ch/statistics/000003> ;
   <urn:ssz:keyFigure> <https://ld.stadt-zuerich.ch/statistics/measure/BEW> .

_:b40 a <https://cube.link/view/CubeSource> ;
 rdfs:label "BEW-SEX" ;
   <https://cube.link/view/cube> <https://ld.stadt-zuerich.ch/statistics/000027> ;
   <urn:ssz:keyFigure> <https://ld.stadt-zuerich.ch/statistics/measure/BEW> .

_:b7 a <https://cube.link/view/Dimension> ;
 rdfs:label "BEW" ;
 <https://cube.link/view/from> [
   <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/measure/BEW> ;
   <https://cube.link/view/source> _:b6 ;
 ] .

_:b141 a <https://cube.link/view/Dimension> ;
 rdfs:label "BEW-SEX" ;
 <https://cube.link/view/from> [
   <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/measure/BEW> ;
   <https://cube.link/view/source> _:b40 ;
 ] .

_:b211 a <https://cube.link/view/Dimension> ;
 rdfs:label "Raum" ;
 <https://cube.link/view/from> [
   <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/property/RAUM> ;
   <https://cube.link/view/source> _:b6, _:b40 ;
 ] .

_:b336 a <https://cube.link/view/Dimension> ;
 rdfs:label "Zeit" ;
 <https://cube.link/view/from> [
   <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/property/ZEIT> ;
   <https://cube.link/view/source> _:b6, _:b40 ;
 ] .

_:b472 a <https://cube.link/view/Dimension> ;
 rdfs:label "Geschlecht" ;
 <https://cube.link/view/from> [
   <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/property/SEX> ;
   <https://cube.link/view/source> _:b40 ;
 ] .
`

  const parser = new Parser()

  const quads = parser.parse(viewTTL)
  const dataset = rdf.dataset().addAll(quads)
  const term = rdf.namedNode('https://example.org/view')

  return { term, dataset }
}

main()
