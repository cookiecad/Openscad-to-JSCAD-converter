import { generateFunctionCall, generateCode, parseFunctionArguments } from './codeGeneration'
import { helperFunctions, out, scopes, startNewScope, endCurrentScope, inTransformChain, startTransformChain, endTransformChain, pushTransformChain, popTransformChain } from './utils.js'
import { getAllProperties, customNodeCopy, tabbed } from './nodeHelpers.js'

import generatedSyntax from './syntaxFromGrammar.js'
import dedent from 'dedent'
import { generatorSyntax, SyntaxNode } from 'types'

export interface OpenScadModule {
  openscadParams: string[]
  code: (params: Record<string, string>, children?: string) => string
}

export interface OpenScadModules {
  [moduleName: string]: OpenScadModule
}

export const moduleCallGenerator = (node: SyntaxNode, openscadModules: OpenScadModules): string => {
  const name = node.child(0)!.text
  const argumentsNode = node.child(1)!
  const parsedArgs = parseFunctionArguments(argumentsNode)
  const { args, children } = parsedArgs

  let result: string
  const openscadModule = openscadModules[name]
  if (openscadModule) {
    const openscadModule = openscadModules[name]

    const namedArgs: any = {}
    // Args can be positional or named (once an argument is named, all following arguments must be named)
    for (let i = 0; i < args.length; i++) {
      let namedArg, value
      if (args[i] !== undefined) { // if args[i] is undefined, it's a named argument
        // Convert positioned arguments to named arguments
        namedArg = openscadModule.openscadParams[i]
        value = args[i]
      } else {
        namedArg = Object.keys(args)[i]
        value = args[namedArg]
      }
      namedArgs[namedArg] = value
    }

    // Get the generated value for each argument
    result = openscadModule.code(namedArgs, children)
  } else {
    const comment = `/* ${name} not implemented: ${node.text} */`
    return comment
    // result = `${name}(\n${tabbed(argsCode)}\n)`
  }
  // The parent of the module call will be transform_chain. If the transform_chanins parent is union_block we need a comma
  if (node.parent?.parent?.type == 'union_block') {
    result = result + ','
  }
  return result
}

export const syntax: generatorSyntax = {
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
    generator: (node: SyntaxNode) => {
      const leftNode = generateCode(node.namedChild(0)!) // variable name
      const rightNode = generateCode(node.namedChild(1)!)
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
  }

}
