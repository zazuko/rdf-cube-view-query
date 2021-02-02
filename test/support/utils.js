const { readFile } = require('fs').promises

function cleanQuery (query) {
  return query
    .replace(/\n/g, ' ')
    .replace(/ +/g, ' ')
    .trim()
}

async function queryFromTxt (name) {
  const filename = `test/support/${name}.query.txt`
  const content = await readFile(filename)

  return cleanQuery(content.toString())
}

module.exports = {
  cleanQuery,
  queryFromTxt
}
