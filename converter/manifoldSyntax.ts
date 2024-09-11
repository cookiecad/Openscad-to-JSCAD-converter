import dedent from 'dedent'
import { type generatorSyntax } from 'types.js'
import * as commonSyntax from './commonSyntax'


const openscadModulesManifold: commonSyntax.OpenScadModules = {
  cube: {
    openscadParams: ['size', 'center'],
    code: (params) => {
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

  }
}

const convertVector3 = (value: string) => {
  if (value === undefined) return ''
  if (value.startsWith('[')) return value
  return `[${value}, ${value}, ${value}]`
}

export function getCodeFormats (code: string) {
  const outputJs = dedent`${code}`
  return {
    jsCode: outputJs
  }
}
