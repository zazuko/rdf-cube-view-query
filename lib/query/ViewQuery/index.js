import rdf from '@zazuko/env'
import sparql from 'rdf-sparql-builder'
import Dimensions from './Dimensions.js'
import Filters from './Filters.js'
import Patterns from './Patterns.js'
import Result from './Result.js'
import Sources from './Sources.js'

export default class ViewQuery {
  constructor(ptr, { preview, disableDistinct } = {}) {
    this.varCounts = {}

    this.view = ptr
    this.preview = preview
    this.disableDistinct = disableDistinct

    this.dimensions = new Dimensions(this)
    this.result = new Result(this)
    this.sources = new Sources(this)

    this.patterns = new Patterns(this)
    this.filters = new Filters(this)

    this.build()
  }

  variable(prefix) {
    this.varCounts[prefix] = this.varCounts[prefix] || 0

    return rdf.variable(`${prefix}${this.varCounts[prefix]++}`)
  }

  build() {
    if (this.disableDistinct) {
      this._queryNoOffsetLimit = sparql.select(this.result.buildProjection())
        .where([
          ...this.patterns.buildPatterns(),
          ...this.filters.buildFilters(),
        ])
        .orderBy(this.result.buildOrderBy())
    } else {
      this._queryNoOffsetLimit = sparql.select(this.result.buildProjection(), { distinct: true })
        .where([
          ...this.patterns.buildPatterns(),
          ...this.filters.buildFilters(),
        ])
        .groupBy(this.result.buildGroupyByModifier())
        .having(this.filters.buildHavings())
        .orderBy(this.result.buildOrderBy())
    }

    this.query = this.result.addOffsetLimit(this._queryNoOffsetLimit.clone())

    this.countQuery = sparql.select(['(COUNT(*) AS ?count)']).where([this._queryNoOffsetLimit])
  }

  previewQuery({ limit = 10, offset = 0 } = {}) {
    const sourceVariables = this.sources.array
      .filter(source => source.isCubeSource)
      .map(source => source.variable)
    const sourceSubquery = sparql
      .select(sourceVariables)
      .where(this.patterns.sourcePatterns)
      .limit(limit)
      .offset(offset)

    return sparql.select(this.result.buildProjection())
      .where([
        sourceSubquery,
        ...this.patterns.dimensionPatterns,
        ...this.filters.buildFilters(),
      ])
  }
}
