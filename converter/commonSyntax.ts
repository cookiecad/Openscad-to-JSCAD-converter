import { generateFunctionCall, generateCode } from './codeGeneration'
import { helperFunctions, out, scopes, startNewScope, endCurrentScope, inTransformChain, startTransformChain, endTransformChain, pushTransformChain, popTransformChain } from './utils.js'
import { getAllProperties, customNodeCopy, tabbed } from './nodeHelpers.js'
import { parseFunctionArguments } from './codeGeneration'

import generatedSyntax from './syntaxFromGrammar.js'
import dedent from 'dedent'
import { SyntaxNode } from 'types'


export const commonSyntax = {
  ...generatedSyntax,
  
  transform_chain: {
    generator: (node: SyntaxNode) => {
      let result
      startTransformChain()
      const child0 = node.namedChildren?.[0]
      // If the transform chain has no children (ie difference() { children })
      if (node.namedChildren.length === 1) {
        result = generateCode(child0)
      } else {
        const moduleCallNodeCopy = customNodeCopy(node.namedChild(0)) // This is the module call
        const moduleChildrenNodeCopy = customNodeCopy(node.namedChild(1)) // This is the children of the module call
        moduleChildrenNodeCopy.isModuleChildren = true // Mark this so we can identify it later

        const moduleArgs = moduleCallNodeCopy.namedChild(1)
        moduleArgs.namedChildren.push(moduleChildrenNodeCopy)
        moduleArgs.children.push(moduleChildrenNodeCopy)
        result = `${tabbed(generateCode(moduleCallNodeCopy))}`
      }
      endTransformChain()

      const isEchoWrapper = (node.namedChildren.length === 1) && node.namedChildren[0].type === 'module_call' && node.namedChildren[0].child(0).text === 'echo'
      if (!inTransformChain() && !isEchoWrapper) {
        result = `jscadObjects.push(\n${result}\n)\n`
      } else {
        result = `${result}\n`
      }

      return result
    }
  },
  assignment: {
    generator: (node) => {
      const leftNode = generateCode(node.namedChild(0)) // variable name
      const rightNode = generateCode(node.namedChild(1))
      let code

      // Check if variable is already assigned in current scope
      if (!scopes[scopes.length - 1].has(leftNode)) {
        code = `let ${leftNode} = ${rightNode}\n`
        scopes[scopes.length - 1].add(leftNode)
      } else {
        code = `${leftNode} = ${rightNode}\n`
      }
      return code
    }
  },
  comment: {
    open: '', // comment already includes the "//"
    close: '\n',
    children: []
  },
  list: {
    open: '[',
    close: ']',
    children: 'all',
    separator: ', '
  },
  identifier: {
  },
  number: {
  },
  boolean: {
  },
  ';': {
  },
  '[': {
  },
  ']': {
  },
  ':': {
  },
  unary_expression: {
    open: '',
    close: '',
    children: [
      { childIndex: 0, name: 'operator', optional: false, isText: true },
      { childIndex: 1, name: '_expression', optional: false }
    ],
    separator: ''
  },
  binary_expression: {
    open: '',
    close: '',
    children: [
      { childIndex: 0, name: 'left', optional: false },
      { childIndex: 1, name: 'operator', optional: false, isText: true },
      { childIndex: 2, name: 'right', optional: false }
    ],
    separator: ' '
  },
  operator: {
  },

} 