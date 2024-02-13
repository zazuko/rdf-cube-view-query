# rdf-cube-view-query

## 2.1.1

### Patch Changes

- 6c30c0a: Update `@zazuko/env` to v2
- 9f6ff37: Updated `rdf-sparql-builder` to `0.2.2`

## 2.1.0

### Minor Changes

- a83ec4c: Added a preview method to View. The return types is same as that of `View#observations`

  ```js
  let source;
  const cube = await source.cube("URI");
  const view = View.fromCube(cube);

  const observationPreview = view.preview({
    // limit: 10,
    // offset: 100
  });
  ```

- 2bfd657: Add the ability to provide your own instance of SPARQL client when creating `Source`

## 2.0.0

### Major Changes

- 214f094: Renamed filter `in` to `IN` exported from `cubesFilter.js`
- 214f094: Update package to ESM

### Minor Changes

- 214f094: Replace `rdf-ext` with `@zazuko/env`

### Patch Changes

- 214f094: Remove changesets from dependencies

## 1.12.0

### Minor Changes

- 28cbca1: feat: add the option to disable sorting view columns (dimensions) (re #95)

### Patch Changes

- aa09adc: fix: `View.fromCube` was slow when sorting dimensions (fixes #95)

## 1.11.2

### Patch Changes

- a28a9b9: Filter columns were incorrectly marked as result columns (re StatistikStadtZuerich/APD#204)
