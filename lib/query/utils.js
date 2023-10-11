import rdf from '@zazuko/env'

export function contains(ptr, target) {
  if (!target) {
    return ptr.terms.length > 0
  }

  if (target.term) {
    target = target.term
  }

  if (target.ptr && target.ptr.term) {
    target = target.ptr.term
  }

  return ptr.terms.some(term => term.equals(target))
}

export function distinct(...ptrs) {
  const ptr = ptrs[0]
  const termSet = rdf.termSet()

  for (const ptr of ptrs) {
    for (const term of ptr.terms) {
      termSet.add(term)
    }
  }

  const terms = [...termSet]

  if (terms.length === 0) {
    return ptr
  }

  return rdf.clownface({
    dataset: ptr._context[0].dataset,
    term: terms,
    graph: ptr._context[0].graph,
  })
}

export function toPropertyPath(ptr) {
  const list = ptr.list()

  if (!list) {
    return ptr.term
  }

  return [...list].map(property => property.term)
}
