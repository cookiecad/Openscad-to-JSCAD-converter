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
    let errorNode: SerializedNode | undefined
    if (e.errorNode !== undefined) {
      errorNode = {
        type: e.errorNode.type,
        text: e.errorNode.text,
        startPosition: e.errorNode.startPosition,
        endPosition: e.errorNode.endPosition,
        childCount: e.errorNode.childCount,
        children: [],
        outputCode: e.errorNode.outputCode
      }
    }
    return {
      error: {
        message: e.message,
        data: {
          tree: serializeTree(e.data.tree.rootNode as converter.JscadSyntaxNode),
          errorNode: (errorNode !== undefined) && serializeNode(errorNode)
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
  outputCode?: string
}

function serializeNode (node: converter.JscadSyntaxNode): SerializedNode {
  const serializedNode: SerializedNode = {
    type: node.type,
    text: node.text.slice(0, 50),
    outputCode: node.outputCode?.slice(0, 50),
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

function serializeTree (rootNode: converter.JscadSyntaxNode): string {
  return JSON.stringify(serializeNode(rootNode))
}
