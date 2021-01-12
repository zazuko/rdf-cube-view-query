# rdf-cube-view-query

`rdf-cube-view-query` provides an API and query builder to create and query views based on the [cube view schema](https://github.com/zazuko/rdf-cube-view-schema).

## API

The API of this package is built on top of the [rdf cube view schema](https://github.com/zazuko/rdf-cube-view-schema).
For a better understanding it is worth having a look at the docs of the schema repo.
Behind all objects there is a shared RDF/JS `Dataset`.
That requires to keep parent/child relations and calling the `.clear()` method if objects are used multiple times with different children.
All objects have a `parent` argument in the constructor to keep track of the reference.

### Source

A `Source` defines a SPARQL endpoint and optional a named graph.
`Source`s are used by the `View` to read the observation data.
There are two subtypes of `Source`.
A plain `Source` can't be used in a `View`.
One of the subtypes must be used.

Supported constructor arguments:

- `endpointUrl`: SPARQL endpoint URL as string, RDF/JS `NamedNode` or Clownface object.
- `user`: User for the SPARQL endpoint as string.
- `password`: Password for the SPARQL endpoint as string.
- `sourceGraph`: Named Graph as string, RDF/JS `NamedNode` or Clownface object.

#### CubeSource

`CubeSource`s are used to refer to cubes.
It extends `Source` with the IRI of a cube.

Supported constructor arguments:

- `cube`: Cube IRI as string, RDF/JS `NamedNode` or Clownface object.

#### LookupSource

For any other RDF data, the `LookupSource` must be used, which extens `Source`.
The difference to a plain `Source` is the more precise definition of the usage.

### Dimension

A `Dimension` represents a dimension in a `View`.
It can point to one or more `Source`s and `path`s.
The `path` contains the path to the dimension value starting from the reference point.
For a `CubeSource` the reference is an observation.
If it points to multiple `Source`s, the given cube dimensions will be used to join the `Source`s. 
The `as` argument must be an IRI to identify the dimension in the `View`.
The IRI can match the property of the `Source`, but does not need to match.
This can be useful if you want to map or transpose data.
For example if you have a cube that contains year, population and gender in separate dimensions.
Now if you want to transpose it into a view with the dimensions year, population female and population male, you need new IRIs for the more specific population dimensions.

Supported constructor arguments:

- `source`: Source as a `Source` object.
- `path`: Path as an RDF/JS `NamedNode`.
- `as`: Identifier of the dimension as RDF/JS `NamedNode`.

#### Lookup Dimension

`Dimension`s with a `LookupSource` require a `join` property that refers to the starting point `Dimension`.
The `path` can go over multiples hops.
An `Array` must be used for this use case.  

Supported constructor arguments:

- `path`: Path as an RDF/JS `NamedNode` or an array of RDF/JS `NamedNode`s.
- `join`: The reference starting point as string, RDF/JS `NamedNode` or Clownface object.

### View

`View`s combine multiple dimensions to a virtual cube.

Supported constructor arguments:

- `dimensions`: Dimensions as an array of `Dimension` objects.
- `filters`: Filters as an array of `Filter` objects.

### Filter

The `Filter` objects can be used to filter the `View` observations based on specific rules for a given `Dimension`.
A filter builder is attached to all `Dimension` objects.
Using that filter builder is the easiest way to create a new `Filter`.
The following methods are available:

- `eq(arg)`: Matches all values equal to `arg`.
  `arg` must be an RDF/JS `Term`.
- `ne(arg)`: Matches all values not equal to `arg`.
  `arg` must be an RDF/JS `Term`.
- `lt(arg)`: Matches all values less than `arg`.
  `arg` must be an RDF/JS `Term`.
- `gt(arg)`: Matches all values greater than `arg`.
  `arg` must be an RDF/JS `Term`.
- `lte(arg)`: Matches all values less than or equal to `arg`.
  `arg` must be an RDF/JS `Term`.
- `gte(arg)`: Matches all values greater than or equal to `arg`.
  `arg` must be an RDF/JS `Term`.
- `in(arg)`: Matches all values that are contained in `arg`.
  `arg` must be an array of RDF/JS `Term`.
- `lang(arg)`: array of language strings.
  `arg` must be an array of language strings.

## Examples

The `examples` folder contains multiple examples covering the whole API. 
