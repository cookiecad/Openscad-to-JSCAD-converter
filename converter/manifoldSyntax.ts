// manifoldSyntax.ts
import dedent from 'dedent'
import type { generatorSyntax } from './types'
import * as commonSyntax from './commonSyntax'

// Helper Functions
const convertVector3 = (value: string): string => {
  if (value === undefined) return ''
  if (value.startsWith('[')) return value
  const components = value.split(',').map(v => v.trim())
  if (components.length === 1) {
    return `[${components[0]}, ${components[0]}, ${components[0]}]`
  }
  return `[${value}]`
}

const centerString = (center: string, size: string): string => {
  return (center?.toLowerCase() === 'true') ? ', true' : ', false'
}

// Define OpenSCAD Modules Mapping to ManifoldCAD
const openscadModulesManifold: commonSyntax.OpenScadModules = {
  cube: {
    openscadParams: ['size', 'center'],
    code: (params) => {
      const size = convertVector3(params.size || '1') // Default size
      const centerFlag = centerString(params.center, params.size || '1')
      return `Manifold.cube(${size}, ${centerFlag})\n`
    }
  },
  cylinder: {
    openscadParams: ['h', 'r1', 'r2', 'center', '$fn'],
    code: (params) => {
      const height = params.h
      const radiusLow = params.r1 || params.r || (params.d && `${params.d} / 2`) || (params.d1 && `${params.d1} / 2`) || '1'
      const radiusHigh = params.r2 || (params.d2 && `${params.d2} / 2`) || '1'
      const centerFlag = params.center || 'false'
      const segments = params.$fn || 'null'
      if (radiusHigh && radiusHigh !== '1') {
        return `Manifold.cylinder(${height}, ${radiusLow}, ${radiusHigh}, ${segments}, ${centerFlag})\n`
      } else {
        return `Manifold.cylinder(${height}, ${radiusLow}, undefined, ${segments}, ${centerFlag})\n`
      }
    }
  },
  linear_extrude: {
    openscadParams: ['height', 'nDivisions', 'twistDegrees', 'scaleTop', 'center'],
    code: (params, children) => {
      const height = params.height || '1'
      const nDivisions = params.nDivisions || '1'
      const twistDegrees = params.twistDegrees || '0'
      const scaleTop = params.scaleTop ? convertVector3(params.scaleTop) : '[1, 1]'
      const center = params.center === 'true' ? 'true' : 'false'
      return `Manifold.extrude(${children}, ${height}, ${nDivisions}, ${twistDegrees}, ${scaleTop}, ${center})\n`
    }
  },
  polygon: {
    openscadParams: ['points', 'paths'],
    code: (params) => {
      const points = params.points || '[]'
      const paths = params.paths || '[]'
      return `CrossSection.ofPolygons(${points}, FillRule.Positive)\n`
    }
  },
  mirror: {
    openscadParams: ['v'],
    code: (params, children) => {
      const vector = convertVector3(params.v || '[1, 0, 0]')
      return `Manifold.mirror(${vector}, ${children})\n`
    }
  },
  rotate: {
    openscadParams: ['a', 'v'],
    code: (params, children) => {
      const angle = params.a || '0'
      const axis = params.v ? convertVector3(params.v) : '[0, 0, 1]'
      return `Manifold.rotate([${angle}, ${axis}], ${children})\n`
    }
  },
  difference: {
    openscadParams: [],
    code: (params, children) => {
      const [base, ...subtractors] = children.split(', ')
      return `Manifold.difference(${base}, ${subtractors.join(', ')})\n`
    }
  },
  intersection: {
    openscadParams: [],
    code: (params, children) => {
      const [a, b] = children.split(', ')
      return `Manifold.intersection(${a}, ${b})\n`
    }
  },
  echo: {
    openscadParams: [],
    code: (params) => {
      const messages = Object.values(params).join(', ')
      return `console.log(${messages})\n`
    }
  },
  sphere: {
    openscadParams: ['r', 'd', '$fn'],
    code: (params) => {
      const radius = params.r || (params.d && `${params.d} / 2`) || '1'
      const segments = params.$fn || 'null'
      return `Manifold.sphere(${radius}, ${segments})\n`
    }
  },
  scale: {
    openscadParams: ['v'],
    code: (params, children) => {
      const scaleVector = convertVector3(params.v || '[1, 1, 1]')
      return `Manifold.scale(${scaleVector}, ${children})\n`
    }
  },
  translate: {
    openscadParams: ['v'],
    code: (params, children) => {
      const translationVector = convertVector3(params.v || '[0, 0, 0]')
      return `Manifold.translate(${translationVector}, ${children})\n`
    }
  }
  // Add more OpenSCAD functions as needed
}

export const manifoldSyntax: generatorSyntax = {
  ...commonSyntax.syntax,

  source_file: {
    open: dedent`
      import { Manifold, CrossSection, FillRule } from 'manifold-cad';
      const jscadObjects = [];\n`,
    close: '\nconst result = Manifold.union(jscadObjects);\n',
    children: 'all',
    separator: ''
  },
  module_call: {
    generator: (node) => {
      return commonSyntax.moduleCallGenerator(node, openscadModulesManifold)
    }
  }
  // You can override or add more syntax rules specific to ManifoldCAD here
}
export function getCodeFormats (code: string) {
  const outputJs = dedent`${code}`
  return {
    jsCode: outputJs
  }
}
