function nodelistToArray (nodelist) {
  return Array.prototype.slice.call(nodelist)
}

function queryAll (node, selector) {
  return nodelistToArray(node.querySelectorAll(selector))
}

export {
  nodelistToArray,
  queryAll
}
