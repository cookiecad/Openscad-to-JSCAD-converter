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

} 