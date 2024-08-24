// @ts-check
import fs from 'fs'
import path from 'path'
import Parser, {Tree, SyntaxNode} from 'tree-sitter'
import OpenSCAD from 'tree-sitter-openscad'
import * as prettier from 'prettier'
import dedent from 'dedent'

import { generateTreeCode } from './codeGeneration.js'
export type { Tree, SyntaxNode }

const parser = new Parser()
try {
parser.setLanguage(OpenSCAD)
} catch (e) {
  console.error('Failed to load Tree-Sitter language:', e);
  throw e;
}

/**
 * Parses the given OpenSCAD code and generates JSCAD code.
 *
 */
export async function parseOpenSCAD(code: string) {
  let jscadCode, tree;
  try {
   tree = parser.parse(code)
  // Traverse the syntax tree and generate JSCAD code
    jscadCode = generateTreeCode(tree.rootNode)
  }
  catch (e) {
    console.log('tree', code)
    console.error('Error generating JSCAD code:', e);
  }
  try {
    jscadCode = await prettier.format(jscadCode, { parser: 'babel' })
  } catch (e) {
    console.log('Error formatting code, continuing without formatting', e)
  }

  return {jscadCode, tree}
}

export async function parseOpenSCADFormats(code: string, outputFolder: string) {
  const parseResult = await parseOpenSCAD(code)
  const jscadCode = parseResult.jscadCode


  const outputJs = dedent`
  import jscad from '@jscad/modeling'
  export function main() {
    ${jscadCode}
  }
  `

  const caditJs = dedent`
  function main() {
    ${jscadCode}
  }
  let result = jscad.booleans.union(main());
  console.log(result);
`

  return {
    jscad: jscadCode,
    js: outputJs,
    cadit: caditJs,
    tree: parseResult.tree,
  }
}

export function printOpenSCADTree(code: string) {
  const tree = parser.parse(code)
  const printNode = (node: any, depth: number) => {
    const indent = '  '.repeat(depth)
    let result = `${indent}${node.type}\n`
    for (let i = 0; i < node.childCount; i++) {
      result += printNode(node.child(i), depth + 1)
    }

    if (
      (node.parent?.type === 'source_file' && node.type !== 'module_declaration') ||
      node.parent?.type === 'module_declaration'
    ) {
      result = `${node.text}\n<\n${result}>\n`
    }
    return result
  }

  return printNode(tree.rootNode, 0)
}