const { Parser } = require('n3')
const rdf = require('rdf-ext')
const { ViewBuilder } = require('../lib/viewUtils.js')
const { Source } = require('../index.js')

async function main () {
  const source = new Source({
    endpointUrl: 'https://ld.integ.stadt-zuerich.ch/query'
  })

  const { dataset, term } = getSampleData()
  const { view } = ViewBuilder.fromDataset({ dataset, source, term })

  console.log('---------')
  console.log('All sources', view.sources().map(x => x.endpoint))

  console.log('---------')
  console.log('All filters', view.filters.map(
    x => `dimension:${x.dimension.value} operation:${x.operation.value} arg:${x.arg?.value} args:${x.args?.map(
      y => y.value)} argList:${x.argList?.map(
      y => y.value)}`))
}

function getSampleData () {
  const viewTTL = `
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix cube: <https://cube.link/view/> .

<http://example.org> a cube:View ;
    cube:dimension _:b18, _:b20, _:b22, _:b24, _:b233_b229 ;
    cube:filter [
        rdf:type cube:Filter ;
        cube:argument ("2000-10-10"^^xsd:date) ;
        cube:dimension _:b233_b229 ;
        cube:operation cube:In ;
        <urn:ssz:baseDimension> _:b20 ;
        <urn:ssz:drillDownProperty> <https://ld.stadt-zuerich.ch/schema/hasEnd> ;
    ] ;
    cube:projection [
        cube:columns (
            _:b18
            _:b20
            _:b22
            _:b24
        ) ;
    ] ;
    <urn:ssz:source> <source/o2C8J1Ol_jDWmx8-jkh2e> .

<source/o2C8J1Ol_jDWmx8-jkh2e> a cube:CubeSource ;
    rdfs:label "Wirtschaftliche Umzüge nach Umzugsquartier, Umzugskreis" ;
    cube:cube <https://ld.stadt-zuerich.ch/statistics/000045> ;
    <urn:ssz:keyFigure> <https://ld.stadt-zuerich.ch/statistics/measure/UMZ> .

_:b18 a cube:Dimension ;
    rdfs:label "Measure Umzüge von Personen (wirtschaftlich) (Wirtschaftliche Umzüge nach Umzugsquartier, Umzugskreis)" ;
    cube:from [
        cube:path <https://ld.stadt-zuerich.ch/statistics/measure/UMZ> ;
        cube:source <source/o2C8J1Ol_jDWmx8-jkh2e> ;
    ] ;
    <urn:ssz:generated> true .

_:b20 a cube:Dimension ;
    rdfs:label "Key Zeit" ;
    cube:from [
        cube:path <https://ld.stadt-zuerich.ch/statistics/property/ZEIT> ;
        cube:source <source/o2C8J1Ol_jDWmx8-jkh2e> ;
    ] ;
    <urn:ssz:generated> true .

_:b22 a cube:Dimension ;
    rdfs:label "Key Raum" ;
    cube:from [
        cube:path <https://ld.stadt-zuerich.ch/statistics/property/RAUM> ;
        cube:source <source/o2C8J1Ol_jDWmx8-jkh2e> ;
    ] ;
    <urn:ssz:generated> true .

_:b24 a cube:Dimension ;
    rdfs:label "Key Ort" ;
    cube:from [
        cube:path <https://ld.stadt-zuerich.ch/statistics/property/ORT> ;
        cube:source <source/o2C8J1Ol_jDWmx8-jkh2e> ;
    ] ;
    <urn:ssz:generated> true .

_:b233_b229 a cube:Dimension, <urn:ssz:FilterDimension> ;
    cube:from [
        cube:path (
            <https://ld.stadt-zuerich.ch/statistics/property/ZEIT>
            <https://ld.stadt-zuerich.ch/schema/hasEnd>
        ) ;
        cube:source <source/o2C8J1Ol_jDWmx8-jkh2e> ;
    ] .
`

  const parser = new Parser()

  const quads = parser.parse(viewTTL)
  const dataset = rdf.dataset().addAll(quads)
  const term = rdf.namedNode('http://example.org')

  return { term, dataset }
}

main()
