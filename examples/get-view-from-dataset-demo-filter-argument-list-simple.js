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
<http://example.org> a <https://cube.link/view/View> ;
\t<https://cube.link/view/dimension> _:b0_b27, _:b0_b119_b116 ;
\t<https://cube.link/view/filter> [
\t\t<http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://cube.link/view/Filter> ;
\t\t<https://cube.link/view/dimension> _:b0_b119_b116 ;
\t\t<https://cube.link/view/argument> <https://ld.stadt-zuerich.ch/statistics/code/R00013>, <https://ld.stadt-zuerich.ch/statistics/code/R00015>, <https://ld.stadt-zuerich.ch/statistics/code/R00021> ;
\t\t<https://cube.link/view/operation> <https://cube.link/view/In> ;
\t\t<urn:ssz:baseDimension> _:b0_b27 ;
\t\t<urn:ssz:filterTermSet> <https://ld.stadt-zuerich.ch/statistics/termset/QuartiereZH> ;
\t] ;
\t<https://cube.link/view/projection> (
\t\t_:b0_b27
\t) ;
\t<urn:ssz:source> _:b0_b5 .

_:b0_b27 a <https://cube.link/view/Dimension> ;
\t<http://www.w3.org/2000/01/rdf-schema#label> "Raum" ;
\t<https://cube.link/view/from> [
\t\t<https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/property/RAUM> ;
\t\t<https://cube.link/view/source> _:b0_b5 ;
\t] .

_:b0_b119_b116 a <https://cube.link/view/Dimension>, <urn:ssz:FilterDimension> ;
\t<https://cube.link/view/from> [
\t\t<https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/property/RAUM> ;
\t\t<https://cube.link/view/source> _:b0_b5 ;
\t] .

_:b0_b5 a <https://cube.link/view/CubeSource> ;
\t<http://www.w3.org/2000/01/rdf-schema#label> "Wirtschaftliche Bevölkerung nach 1-Jahresaltersklasse ab 1993" ;
\t<https://cube.link/view/cube> <https://ld.stadt-zuerich.ch/statistics/000002> ;
\t<urn:ssz:keyFigure> <https://ld.stadt-zuerich.ch/statistics/measure/BEW> .


`

  const parser = new Parser()

  const quads = parser.parse(viewTTL)
  const dataset = rdf.dataset().addAll(quads)
  const term = rdf.namedNode('http://example.org')

  return { term, dataset }
}

main()
