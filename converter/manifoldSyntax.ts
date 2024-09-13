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
  cylinder: {
    openscadParams: ['h', 'r1', 'r2', 'center', '$fn'],
    code: (params) => {
      const h = params.h
      const r1 = params.r1 || params.r || (params.d && `${params.d} / 2`) || (params.d1 && `${params.d1} / 2`) || '1'
      const r2 = params.r2 || (params.d2 && `${params.d2} / 2`)
      const center = params.center || 'false'

      if (r2 || params.$fn || params.center) {
        return `cylinder(${h}, ${r1}, ${r2 || '0'}, ${params.$fn || 'null'}, ${center})`
      } else {
        return `cylinder(${h}, ${r1})`
      }
    }
  },
  mirror: {
    openscadParams: ['v'],
    code: (params, children) => {
      return `${children}\t.mirror(${params.v})`; 
    }
  }
}

export const manifoldSyntax: generatorSyntax = {
  ...commonSyntax.syntax,

  source_file: {
    open: dedent`
      const {cube, cylinder, sphere, union} = Manifold;
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
