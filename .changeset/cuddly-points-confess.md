---
"rdf-cube-view-query": minor
---

Added a preview method to View. The return types is same as that of `View#observations`

```js
let source
const cube = await source.cube('URI')
const view = View.fromCube(cube)

const observationPreview = view.preview({
  // limit: 10,
  // offset: 100
})
```
