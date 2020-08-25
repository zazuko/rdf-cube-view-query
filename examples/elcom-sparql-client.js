const { Source } = require('..')

// regex based search query for municipalities and providers
function searchQuery (search, { limit = 100 } = {}) {
  return `
PREFIX schema: <http://schema.org/>
PREFIX lac: <https://schema.ld.admin.ch/>
SELECT ?type ?iri ?label {
  {
    SELECT ("municipality" AS ?type) (?municipality AS ?iri) (?municipalityLabel AS ?label) WHERE {
      GRAPH <https://lindas.admin.ch/fso/agvch> {
        ?municipality a lac:Municipality .
        ?municipality schema:name ?municipalityLabel.    
      }

      FILTER regex(?municipalityLabel, ".*${search}.*")
    }
  } UNION {
    SELECT ("provider" AS ?type) (?provider AS ?iri) (?providerLabel AS ?label) WHERE {
      GRAPH <https://lindas.admin.ch/elcom/electricityprice> {
        ?provider a schema:Organization .
        ?provider schema:name ?providerLabel.    
      }

      FILTER regex(?providerLabel, ".*${search}.*")
    }
  }
}

LIMIT ${limit}
`
}

async function main () {
  // a source manages the SPARQL endpoint information + the named graph
  const source = new Source({
    endpointUrl: 'https://ld.zazuko.com/query',
  //  endpointUrl: 'https://test.lindas.admin.ch/query',
    sourceGraph: 'https://lindas.admin.ch/elcom/electricityprice'
    // user: '',
    // password: ''
  })

  // and also provides a SPARQL client
  const client = source.client

  // which can be used to run SPARQL queries with a simple interface
  const results = await client.query.select(searchQuery('Biel'))

  console.log(results)
}

main()
