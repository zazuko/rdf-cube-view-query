const { Source } = require('..')

// regex based search query for municipalities and providers
function searchQuery (search, { limit = 100 } = {}) {
  return `
SELECT ?type ?iri ?label {
  {
    SELECT ("municipality" AS ?type) (?municipality AS ?iri) (?municipalityLabel AS ?label) WHERE {
      GRAPH <https://linked.opendata.swiss/graph/blv/animalpest> {
        ?municipality a <https://gont.ch/Municipality> .
        ?municipality <http://www.w3.org/2000/01/rdf-schema#label> ?municipalityLabel.    
      }

      FILTER regex(?municipalityLabel, ".*${search}.*")
    }
  } UNION {
    SELECT ("provider" AS ?type) (?provider AS ?iri) (?providerLabel AS ?label) WHERE {
      GRAPH <https://lindas.admin.ch/elcom/electricityprice> {
        ?provider a <http://schema.org/Organization> .
        ?provider <http://schema.org/name> ?providerLabel.    
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
    endpointUrl: 'https://test.lindas.admin.ch/query',
    sourceGraph: 'https://lindas.admin.ch/elcom/electricityprice'
    // user: '',
    // password: ''
  })

  // and also provides a SPARQL client
  const client = source.client

  // which can be used to run SPARQL queries with a simple interface
  const results = await client.query.select(searchQuery('Zür'))

  console.log(results)
}

main()
