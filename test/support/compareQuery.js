import { strictEqual } from 'assert'
import { cleanQuery, queryFromTxt } from './utils.js'

export async function compareQuery({ name, query }) {
  strictEqual(cleanQuery(query), await queryFromTxt(name))
}
