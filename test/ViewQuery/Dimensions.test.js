const { strictEqual } = require('assert')
const { describe, it } = require('mocha')
const rdf = require('rdf-ext')
const clownface = require('clownface')

const ns = require('../support/namespaces')
const Dimensions = require('../../lib/query/ViewQuery/Dimensions.js')
const { Parser } = require('n3')

describe('Dimensions', () => {
  it('gets the property from view:as', () => {
    const viewTTL = `
@prefix view: <https://cube.link/view/> .
@prefix ex: <http://example.org/> .
ex:view a view:View ;
  view:dimension [
        view:from [
            view:path ex:someOther ;
        ] ;
        view:as ex:some ;
    ] .
`
    const parser = new Parser()
    const dataset = rdf.dataset().addAll(parser.parse(viewTTL))
    const view = clownface({ dataset, term: ns.ex.view })

    const dimensions = new Dimensions({ view, variable: () => {} })

    strictEqual(ns.ex.some.value, dimensions.array[0].property.value)
  })

  it('gets the property from path when view:as is not defined and path is an IRI',
    () => {
      const viewTTL = `
@prefix view: <https://cube.link/view/> .
@prefix ex: <http://example.org/> .
ex:view a view:View ;
  view:dimension [
        view:from [
            view:path ex:someOther ;
        ] ;
    ] .
`
      const parser = new Parser()
      const dataset = rdf.dataset().addAll(parser.parse(viewTTL))
      const view = clownface({ dataset, term: ns.ex.view })

      const dimensions = new Dimensions({ view, variable: () => {} })

      strictEqual(ns.ex.someOther.value, dimensions.array[0].property.value)
    })

  it(
    'gets a blank as property when view:as is not defined and path is a list',
    () => {
      const viewTTL = `
@prefix view: <https://cube.link/view/> .
@prefix ex: <http://example.org/> .
ex:view a view:View ;
  view:dimension [
        view:from [
            view:path (
              ex:some 
              ex:someOther
            ) ;
        ] ;
    ] .
`
      const parser = new Parser()
      const dataset = rdf.dataset().addAll(parser.parse(viewTTL))
      const view = clownface({ dataset, term: ns.ex.view })

      const dimensions = new Dimensions({ view, variable: () => {} })

      strictEqual('BlankNode', dimensions.array[0].property.termType)
    })

  it(
    'gets a blank as property when view:as is not defined and path is a blank',
    () => {
      const viewTTL = `
@prefix view: <https://cube.link/view/> .
@prefix ex: <http://example.org/> .
ex:view a view:View ;
  view:dimension [
        view:from [
            view:path [ ex:notMe ex:please ] ;
        ] ;
    ] .
`
      const parser = new Parser()
      const dataset = rdf.dataset().addAll(parser.parse(viewTTL))
      const view = clownface({ dataset, term: ns.ex.view })

      const dimensions = new Dimensions({ view, variable: () => {} })

      strictEqual('BlankNode', dimensions.array[0].property.termType)
    })
})
