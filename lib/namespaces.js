import $rdf from '@zazuko/env'

const cube = $rdf.namespace('https://cube.link/')
const view = $rdf.namespace('https://cube.link/view/')

const {
  rdf,
  schema,
  sh,
  xsd,
} = $rdf.ns

export { cube, rdf, schema, sh, view, xsd }
