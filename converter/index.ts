// @ts-check
import fs from 'fs'
import path from 'path'
import Parser from 'tree-sitter'
import OpenSCAD from 'tree-sitter-openscad'
import * as prettier from 'prettier'
import dedent from 'dedent'

import { generateTreeCode } from './codeGeneration.js'

const parser = new Parser()
parser.setLanguage(OpenSCAD)

/**
 * Parses the given OpenSCAD code and generates JSCAD code.
 *
 */
export async function parseOpenSCAD(code: string): Promise<string> {
  const tree = parser.parse(code)

  // Traverse the syntax tree and generate JSCAD code
  let jscadCode = generateTreeCode(tree.rootNode)
  try {
    jscadCode = await prettier.format(jscadCode, { parser: 'babel' })
  } catch (e) {
    console.log('Error formatting code, continuing without formatting', e)
  }

  return jscadCode
}

export async function parseOpenSCADFormats(code: string, outputFolder: string) {
  const jscadCode = await parseOpenSCAD(code)

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
    cadit: caditJs
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