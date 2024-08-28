// @ts-check
import fs from 'fs'
import path from 'path'
import Parser, {Tree, SyntaxNode} from 'tree-sitter'
import OpenSCAD from 'tree-sitter-openscad'
import * as prettier from 'prettier'
import dedent from 'dedent'

import { generateTreeCode } from './codeGeneration.js'

type JscadSyntaxNode = SyntaxNode & {jscadCode?: string}
export type { Tree, JscadSyntaxNode}


let parser: Parser;

async function init() {
  if (parser) return;
  // await Parser.init()
  parser = new Parser()
  try {
    console.log('Loading Tree-Sitter language...', OpenSCAD)
    //await parser.setLanguage(OpenSCAD)
    parser.setLanguage(OpenSCAD)
    } catch (e) {
      console.error('Failed to load Tree-Sitter language:', e);
      throw `Failed to load Tree-Sitter language ${e}`;
    }    
}

/**
 * Parses the given OpenSCAD code and generates JSCAD code.
 *
 */
export async function parseOpenSCAD(code: string) {
  await init()
  let jscadCode, tree, newRootNode;
  tree = parser.parse(code);
  
  try {
    // Traverse the syntax tree and generate JSCAD code
    ({ code: jscadCode, node: newRootNode } = generateTreeCode(tree.rootNode))
  }
  catch (e: any) {
    console.log('tree', code)
    console.error('Error generating JSCAD code:', e);
    if (e instanceof Error) {
      e.message = `Error generating JSCAD code: ${e.message}`;
    }
    else {
      e = new Error(`Error generating JSCAD code: ${e}`);
    }
    Object.assign(e, { data: { tree } });
    throw e;
  }
  try {
    jscadCode = await prettier.format(jscadCode!, { parser: 'babel' })
  } catch (e) {
    console.log('Error formatting code, continuing without formatting', e)
  }

  return {jscadCode, rootNode: newRootNode}
}

export async function parseOpenSCADFormats(code: string, outputFolder: string) {
  await init()
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
    tree: parseResult.rootNode,
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