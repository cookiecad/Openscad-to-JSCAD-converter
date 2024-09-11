import dedent from 'dedent'
import { helperFunctions, out, scopes, startNewScope, endCurrentScope, inTransformChain, startTransformChain, endTransformChain, pushTransformChain, popTransformChain } from './utils.js'
import { generatorSyntax } from 'types.js'
import { parseFunctionArguments } from './codeGeneration'
import { generateFunctionCall, generateCode } from './codeGeneration'
import { getAllProperties, customNodeCopy, tabbed } from './nodeHelpers'
import * as commonSyntax from './commonSyntax'

const openscadModulesManifold = {
  cube: {
    openscadParams: ['size', 'center'],
    code: (params: any) => {
      params.size = convertVector3(params.size || '1') // Default
      return `cube(${params.size},${params.center || false})\n`
    }
  },
}

export const manifoldSyntax: generatorSyntax = {
  ...commonSyntax.syntax,
  
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
      return commonSyntax.moduleCallGenerator(node, openscadModulesManifold)
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
