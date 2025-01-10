// @ts-check
import fs from 'fs'
import path from 'path'
import Parser, { Tree, SyntaxNode } from 'tree-sitter'
import OpenSCAD from 'tree-sitter-openscad'
import * as prettier from 'prettier'
import dedent from 'dedent'

import { generateTreeCode } from './codeGeneration'

type JscadSyntaxNode = SyntaxNode & { outputCode?: string }
export type { Tree, JscadSyntaxNode }

let parser: Parser

async function init () {
  if (parser) return
  // await Parser.init()
  parser = new Parser()
  try {
    console.log('Loading Tree-Sitter language...', OpenSCAD)
    // await parser.setLanguage(OpenSCAD)
    parser.setLanguage(OpenSCAD)
  } catch (e) {
    console.error('Failed to load Tree-Sitter language:', e)
    throw `Failed to load Tree-Sitter language ${e}`
  }
}

/**
 * Parses the given OpenSCAD code and generates JSCAD code.
 */
export async function parseOpenSCAD (options: { code: string, language: 'jscad' | 'manifold' }) {
  await init()
  const { code, language } = options
  let outputCode, newRootNode, formats
  const tree = parser.parse(code)

  try {
    // Traverse the syntax tree and generate JSCAD code
    ({ code: outputCode, formats, node: newRootNode } = generateTreeCode(tree.rootNode, language))
  } catch (e: any) {
    console.log('tree', code)
    console.error('Error generating JSCAD code:', e)
    const errorNode = (e?.node !== undefined) && e.node

    if (e instanceof Error) {
      e.message = `Error generating JSCAD code: ${e.message}`
    } else {
      e = new Error(`Error generating JSCAD code: ${e}`)
    }
    Object.assign(e, { data: { tree }, errorNode })
    throw e
  }
  try {
    outputCode = await prettier.format(outputCode, { parser: 'babel' })
  } catch (e) {
    console.log('Error formatting code, continuing without formatting', e)
  }

  const result = { outputCode, formats, rootNode: newRootNode }
  console.log('result', result)
  return result
}

export function printOpenSCADTree (code: string) {
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
