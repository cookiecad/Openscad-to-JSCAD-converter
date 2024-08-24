"use server"
import { parseOpenSCADFormats } from 'converter'
import * as converter from 'converter'

export const printOpenSCADTree = async (code: string) => converter.printOpenSCADTree(code);

export async function parseOpenSCAD(code: string) {
  // let { parseOpenSCADFormats } = await import('converter')

  let result = await parseOpenSCADFormats(code, '')
  return {...result, tree: result.tree && serializeTree(result.tree)}
}

export interface SerializedNode {
  type: string;
  text: string;
  startPosition: any; // Replace 'any' with the actual type if known
  endPosition: any;   // Replace 'any' with the actual type if known
  childCount: number;
  children: SerializedNode[];
}
function serializeTree(tree: converter.Tree ) {
  const rootNode = tree.rootNode;
  
  function serializeNode(node: converter.SyntaxNode) {
    const serializedNode: SerializedNode = {
      type: node.type,
      text: node.text.slice(0, 50),
      startPosition: node.startPosition,
      endPosition: node.endPosition,
      childCount: node.childCount,
      children: [],
    }
    
    for (let i = 0; i < node.childCount; i++) {
      const childNode = node.child(i);
      if (childNode !== null) {
        serializedNode.children.push(serializeNode(childNode));
      }
    }
    
    return serializedNode;
  }
  
  return JSON.stringify(serializeNode(rootNode));
}
