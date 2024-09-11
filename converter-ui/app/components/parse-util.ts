'use server'
import * as converter from 'converter'

export const printOpenSCADTree = async (code: string) => converter.printOpenSCADTree(code)

export async function parseOpenSCAD (code: string, language: 'jscad' | 'manifold') {
  // let { parseOpenSCADFormats } = await import('converter')
  let result
  try {
    result = await converter.parseOpenSCAD({ code, language })
  } catch (e: any) {
    if (!(e.message && e?.data?.tree)) { throw e }
    return {
      error: {
        message: e.message,
        data: {
          tree: serializeTree(e.data.tree.rootNode)
        }
      }
    }
  }
  result = { ...result, rootNode: result.rootNode && serializeTree(result.rootNode) }
  return result
}

export interface SerializedNode {
  type: string
  text: string
  startPosition: any // Replace 'any' with the actual type if known
  endPosition: any // Replace 'any' with the actual type if known
  childCount: number
  children: SerializedNode[]
  jscadCode?: string
}
function serializeTree (rootNode: converter.JscadSyntaxNode) {
  function serializeNode (node: converter.JscadSyntaxNode) {
    const serializedNode: SerializedNode = {
      type: node.type,
      text: node.text.slice(0, 50),
      jscadCode: node.jscadCode?.slice(0, 50),
      startPosition: node.startPosition,
      endPosition: node.endPosition,
      childCount: node.childCount,
      children: []
    }

    for (let i = 0; i < node.childCount; i++) {
      const childNode = node.child(i)
      if (childNode !== null) {
        serializedNode.children.push(serializeNode(childNode))
      }
    }

    return serializedNode
  }

  return JSON.stringify(serializeNode(rootNode))
}
