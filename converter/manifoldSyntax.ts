import dedent from 'dedent'
import { helperFunctions, out, scopes, startNewScope, endCurrentScope, inTransformChain, startTransformChain, endTransformChain, pushTransformChain, popTransformChain } from './utils.js'
import { generatorSyntax } from 'types.js'
import { parseFunctionArguments } from './codeGeneration'
import { generateFunctionCall, generateCode } from './codeGeneration'
import { getAllProperties, customNodeCopy, tabbed } from './nodeHelpers'
import { commonSyntax } from './commonSyntax'

export const manifoldSyntax: generatorSyntax = {
  ...commonSyntax,
  
  source_file: {
    open: dedent`
      const {cube, sphere, union} = Manifold;
      const jscadObjects = [];\n`,
    close: '\nconst result = union(jscadObjects);\n',
    children: 'all',
    separator: ''
  },
  module_call: {
    generator: (node) => {
      const name = node.child(0).text
      const argumentsNode = node.child(1)
      let result
      // Map openscad module names and parameters to manifold

      const args = parseFunctionArguments(argumentsNode)
      const parsedArgs = args.args
      const children = args.children

      type CodeFunction = (params: any, children: any) => string
      const openscadModules = {
        cube: {
          openscadParams: ['size', 'center'],
          code: (params: any) => {
            params.size = convertVector3(params.size || '1') // Default
            return `cube(${params.size},${params.center || false})\n`
          }
        },
      }
     
      if (Object.keys(openscadModules).includes(name)) {
        const openScadModule = openscadModules[name as keyof typeof openscadModules]

        const namedArgs: any = {}
        // Args can be positional or named (once an argument is named, all following arguments must be named)
        for (let i = 0; i < parsedArgs.length; i++) {
          let namedArg, value
          if (parsedArgs[i] !== undefined) { // if parsedArgs[i] is undefined, it's a named argument
            // Convert positioned arguments to named arguments
            namedArg = openScadModule.openscadParams[i]
            value = parsedArgs[i]
          } else {
            namedArg = Object.keys(parsedArgs)[i]
            value = parsedArgs[namedArg]
          }
          namedArgs[namedArg] = value
        }

        // Get the jscad value for each argumen
        result = (openScadModule.code as CodeFunction)(namedArgs, children)
      } else {
        const args = node.namedChildren.slice(1).map(generateCode).join(', ')
        result = `${name}(\n${tabbed(args)}\n)`
      }

      // if (moduleNames.includes(name)) { // If the module name is function in the file
      //   return `\n...${name}(${args})`
      // } else {
      //   return `\n${name}(${parsedArgs})`
      // }
      // The parent of the module call will be transform_chain. If the transform_chanins parent is union_block we need a comma
      if (node.parent?.parent?.type == 'union_block') {
        result = result + ','
      }
      return result
    }      

  },
}

const convertVector3 = (value: string) => {
  if (value === undefined) return ''
  if (value.startsWith('[')) return value
  return `[${value}, ${value}, ${value}]`
}

export function getCodeFormats(code: string) {
  const outputJs = dedent`${code}`
  return {
    jsCode: outputJs,
  }
}
