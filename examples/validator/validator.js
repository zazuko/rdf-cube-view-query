const factory = require('rdf-ext')
const ParserN3 = require('@rdfjs/parser-n3')
const SHACLValidator = require('rdf-validate-shacl')
const path = require('path')
const Readable = require('stream').Readable

async function loadDataset () {
  const input = new Readable({
    read: () => {
      input.push(`

@base <http://example.org/> .
@prefix dash: <http://datashapes.org/dash#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix schema: <http://schema.org/> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix cube: <https://cube.link/> .

#
# This is the bare minimal SHACL shape for validating a cube.
# All cubes should pass this validation.
#

<CubeShape>
    a sh:NodeShape ;
    sh:targetClass cube:Cube ;
    sh:property [
        sh:path cube:observationSet ;
        sh:minCount 1 ;
        sh:node <ObservationSetShape> ;
        sh:message "cube:Cube needs at least one cube:ObservationSet"
    ] ;
    sh:property [
        # optional, but recommended
        sh:path cube:observationConstraint ;
        sh:node <ObservationConstraintShape> ;
        sh:message "cube:Cube must point to a valid cube:Constraint"
    ] .

<ObservationSetShape>
    a sh:NodeShape ;
    sh:targetClass cube:ObservationSet ;
    sh:property [
        sh:path cube:observation ;
        sh:minCount 1 ;
        sh:message "cube:ObservationSet needs at least one cube:observation"
    ] .

<ObservationConstraintShape>
    a sh:NodeShape ;
    sh:targetClass cube:Constraint ;
    sh:property [
        # we assume at least 3 dimensions, otherwise we would have an empty list of dimensions
        # one for cube:observedBy, one for rdf:type and at least one cube dimension
        sh:path sh:property ;
        sh:minCount 3 ;
        sh:message "cube:Constraint needs at least a certain amount of sh:properties"
    ] .
    `)
      input.push(null)
    }
  })

  const parser = new ParserN3({ factory })
  return factory.dataset().import(parser.import(input))
}

const cubeShapeFile = path.resolve(__dirname, './cube-shape.ttl')

async function validateCube (cube) {
  const cubeShape = await loadDataset(cubeShapeFile)
  const validator = new SHACLValidator(cubeShape, { factory })
  return validator.validateNode(cube.dataset, cube.term, factory.namedNode('http://example.org/CubeShape'))
}

module.exports = {
  validateCube
}
