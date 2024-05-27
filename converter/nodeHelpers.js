// Recursively copy nodes
export function customNodeCopy (node, map = new Map()) {
  if (map.has(node)) return map.get(node) // if node copy already exists, return it
  if (!node) return null // A node property can exist but be null

  try {
    const copyNode = {
      type: node.type,
      parent: node.parent,
      text: node.text,
      namedChildren: [],
      children: [],
      namedChild: function (index) {
        return this.namedChildren[index]
      },
      child: function (index) {
        return this.children[index]
      }
    }

    map.set(node, copyNode) // add node and its copy to the identity map

    copyNode.namedChildren = node.namedChildren.map((i) =>
      customNodeCopy(i, map)
    )
    copyNode.children = node.children.map((i) => customNodeCopy(i, map))
    // Add namedChildren properties to copyNode
    // Loop through the node keys for keys that end in 'Node' and add them to the copyNode
    getAllProperties(node).forEach((key) => {
      if (key.endsWith('Node')) {
        copyNode[key] = customNodeCopy(node[key], map)
      }
    })

    return copyNode
  } catch (e) {
    console.trace(node)
  }
}

export function tabbed (str) {
  return str.replace(/^/gm, '  ')
}

// Find all methods of an object, up to the root prototype
export function getAllProperties (obj, allProps = []) {
  if (!obj) {
    return [...new Set(allProps)]
  }

  const props = Object.getOwnPropertyNames(obj)
  return getAllProperties(Object.getPrototypeOf(obj), [...allProps, ...props])
}

/*
 * Dump the given node for debugging
 */
export const dumpNode = (node, depth = 0) => {
  const indent = '  '.repeat(depth)
  let result = `${indent}${node.type}\n`
  for (let i = 0; i < node.namedChildCount; i++) {
    result += dumpNode(node.namedChild(i), depth + 1)
  }
  return result
}
