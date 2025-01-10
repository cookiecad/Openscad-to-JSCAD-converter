import { generateFunctionCall, generateCode } from './codeGeneration'
import { helperFunctions, startNewScope, endCurrentScope, inTransformChain, startTransformChain, endTransformChain, pushTransformChain, popTransformChain } from './utils.js'
import { tabbed } from './nodeHelpers.js'
import * as commonSyntax from './commonSyntax'
import dedent from 'dedent'
import type { generatorSyntax } from './types'

const convertVector3 = (value: string): string => {
  if (value === undefined) return ''
  if (value.startsWith('[')) return value
  return `[${value}, ${value}, ${value}]`
}
const centerString = (center: string, size: string): string => { return (center?.toLowerCase() === 'true') ? '' : `, center: vec3.scale(vec3.create(), ${size}, 0.5),` }

const openscadModulesJscad: commonSyntax.OpenScadModules = {
  // if (name === 'linear_extrude') {
  //   //For linear extrude, the first argument is the height, the rest are the objects
  //   //TODO add support for named parameters
  //   args = dedent`{height: ${generateCode(node.child(1).namedChild(0))}}, ${node.child(1).namedChildren.slice(1).map((i) => generateCode(i)).join(', ') }`
  // }
  // else {
  // args = generateCode(node.child(1))
  // const args = generateCode(argumentsNode);

  // Map openscad function names and parameters to jscad

  // TODO: We may need a helper function to determine at runtime if size is a vector or a number. Center requires a vector

  cube: {
    openscadParams: ['size', 'center'],
    code: (params) => {
      params.size = convertVector3(params.size || '1') // Default
      return `cuboid({size: ${params.size}${centerString(params.center, params.size)}})\n`
    }
  },
  linear_extrude: {
    openscadParams: ['height', 'v', 'center', 'convexity', 'twist', 'slices', 'scale', '$fn'],
    code: (params, children) => {
      return `extrudeLinear({height: ${params.height}}, ${children})\n`
    }
  },
  polygon: {
    openscadParams: ['points'],
    code: (params) => {
      return `polygonEnsureCounterclockwise({points: ${params.points}})\n`
    }
  },
  translate: {
    openscadParams: ['v'],
    code: (params, children) => {
      return `translate(${params.v}, ${children})\n`
    }
  },
  mirror: {
    openscadParams: ['v'],
    code: (params, children) => {
      if (params.v.length === 2) {
        return `mirror({normal: [${params.v[0]}, ${params.v[1]}, 0]}, ${children})\n`
      }
      return `mirror({normal: ${params.v}}, ${children})\n`
    }
  },
  rotate: {
    openscadParams: ['a', 'v'],
    code: (params, children) => {
      const degrees = convertVector3(params.a)
      if (params.v) throw new Error('Rotate around vector is not yet implemented')
      return `rotateDegrees(${degrees}, ${children})\n`
    }
  },
  difference: {
    openscadParams: [],
    code: (params, children) => {
      return `subtract(${children})\n`
    }
  },
  intersection: {
    openscadParams: [],
    code: (params, children) => {
      return `intersect(${children})\n`
    }
  },
  cylinder: {
    openscadParams: ['h', 'r1', 'r2', 'center'], // These are the only positional parameters, the others are named
    code: (params) => {
      const h = params.h
      const r1 = params.r1 || params.r || (params.d && `${params.d} / 2`) || (params.d1 && `${params.d1} / 2`) || '1'
      const r2 = params.r2 || (params.d2 && `${params.d2} / 2`)
      const center = params.center || 'false'
      // TODO - the center is actually the middle of (x2 - x1), (y2 - y1), (z2 - z1), or for a cylinder r, r, h/2
      const centerStr = centerString(center, `[${r1}, ${r1}, ${h}]`)
      if (r2) {
        return `cylinderElliptic({height: ${h}, startRadius: [${r1}, ${r1}], endRadius: [${r2},${r2}]${centerStr}})\n`
      } else {
        return `cylinder({height: ${h}, radius: ${r1}${centerStr}})\n`
      }
    }
  },
  echo: {
    openscadParams: [],
    code: (params) => {
      return `console.log(${Object.entries(params).map(([key, value]) =>
        `${(key === 'undefined') ? '' : key + ': '} ${value}`).join(', ')})\n`
    }
  }
}

export const jscadSyntax: generatorSyntax = {
  ...commonSyntax.syntax,

  source_file: {
    open: dedent`
      const { primitives, booleans, transforms, extrusions } = jscad;
      const { cube, sphere, cylinder, cylinderElliptic, polygon, cuboid, circle, square } = primitives;
      const { union, subtract, intersect } = booleans;
      const { translate, rotate, scale, mirror } = transforms;
      const { extrudeLinear } = extrusions
      const { vec3 } = jscad.maths;
      ${helperFunctions.join('\n')}\n
      const jscadObjects = [];\n`,
    close: '\nreturn jscadObjects;\n',
    children: 'all',
    separator: ''
  },
  function_call: {
    generator: generateFunctionCall
  },
  arguments: {
    generator: (node) => {
      const args = []
      for (let i = 0; i < node.namedChildren?.length; i++) {
        const child = node.namedChild(i)
        args.push(generateCode(child))
      }
      return args.join(', ')
    }
  },
  named_argument: {
    generator: (node) => {
      const key = generateCode(node.namedChild(0))
      const value = generateCode(node.namedChild(1))
      return `${key}: ${value}`
    }
  },
  ternary_expression: {
    open: '',
    close: '',
    children: [
      { childIndex: 0, name: 'condition', optional: false },
      { childIndex: 1, name: '?', optional: false, isText: true },
      { childIndex: 2, name: 'consequence', optional: false },
      { childIndex: 3, name: ':', optional: false, isText: true },
      { childIndex: 4, name: 'alternative', optional: false }
    ],
    separator: ' '
  },
  conditional_expression: {
    open: '',
    close: '',
    children: [
      { childIndex: 0, name: 'test', optional: false },
      { childIndex: 1, name: '?', optional: false, isText: true },
      { childIndex: 2, name: 'consequent', optional: false },
      { childIndex: 3, name: ':', optional: false, isText: true },
      { childIndex: 4, name: 'alternate', optional: false }
    ],
    separator: ' '
  },
  array_expression: {
    open: '[',
    close: ']',
    children: 'all',
    separator: ', '
  },
  object_expression: {
    open: '{',
    close: '}',
    children: 'all',
    separator: ', '
  },
  parenthesized_expression: {
    open: '(',
    close: ')',
    children: [{ childIndex: 1, name: 'expression', optional: false }],
    separator: ''
  },
  parenthesized_assignments: {
    open: '(',
    close: ')',
    children: 'all',
    separator: ', '
  },
  index_expression: {
    open: '',
    close: '',
    children: [
      { childIndex: 0, name: 'left', optional: false },
      { childIndex: 1, name: '[', optional: false, isText: true },
      { childIndex: 2, name: 'index', optional: false },
      { childIndex: 3, name: ']', optional: false, isText: true }
    ],
    separator: ''
  },
  module_declaration: {
    generator: (node) => {
      startNewScope()
      const name = node.child(1).text
      const parameters = node.child(2).text
      const body = generateCode(node.child(3))
      const result = `\n\nfunction ${name}${parameters} {\n
        const jscadObjects = [];\n
        ${tabbed(body)}\n
        return jscadObjects;\n
      }\n`

      endCurrentScope()
      return result
    }
    // open: 'function ',
    // close: '\n',
    // children: [
    //   { childIndex: 1, name: 'name', optional: false },
    //   { childIndex: 2, name: 'parameters', optional: false },
    //   { childIndex: 3, name: 'body', optional: false }
    // ],
    // separator: ''
  },
  parameters_declaration: {
    open: '',
    close: '',
    children: 'all',
    separator: ', '
  },
  module_call: {
    generator: (node) => {
      return commonSyntax.moduleCallGenerator(node, openscadModulesJscad)
    }
  },
  union_block: {
    // I don't think we need the brackets as we are already adding it to module_declaration
    open: '',
    close: '',
    children: 'all',
    separator: ''
  },
  for_block: {
    generator: (node) => {
      // const assignments = node.child(1)
      // const body = generateCode(node.child(2))
      // // assignments is of type parenthesized_assignments
      // const assignment = assignments.namedChildren[0]
      // const varName = assignment.leftNode.text
      // const range = assignment.rightNode
      // const rangeText = generateCode(range)
      // return `for (let ${varName} of ${rangeText}) {\n${tabbed(body)}\n}\n`

      // Extract loop variable and values from the assignment
      const assignmentNode = node.namedChild(0).namedChild(0)
      const variable = generateCode(assignmentNode.child(0)) // get the variable name
      const valuesNode = assignmentNode.child(2) // get the range or list node

      let values

      // Determine if it's a range or list
      if (valuesNode.type === 'range') {
        // Handle range
        const start = generateCode(valuesNode.child(1)) || '0'
        const increment = valuesNode.childCount === 7 ? generateCode(valuesNode.child(3)) : '1'
        const end = generateCode(valuesNode.child(valuesNode.childCount === 7 ? 5 : 3))
        values = `{start: ${start}, increment: ${increment}, end: ${end}}`
      } else if (valuesNode.type === 'list') {
        // Handle list directly
        values = generateCode(valuesNode)
      } else {
        // Fallback to handle as list in case neither range nor list (unexpected case)
        values = `[${generateCode(valuesNode)}]`
      }

      // Generate the body of the loop
      const body = generateCode(node.namedChild(1))

      let result
      // if (inTransformChain()) {
      //   result = `\n...inlineFor('${variable}', ${values}, (context) => ${body.trim()}.map(obj => ({...obj, context}))),`
      // } else {
      result = dedent`
          inlineFor(${values}, (${variable}) => {
            ${body.trim()}\n
          })\n`
      // }

      return result
    }
  },
  // [0:fill?max_grid_hexagons_x-1:(len(cols)-1)]
  range: {
    generator: (node) => {
      const start = generateCode(node.startNode)
      const end = generateCode(node.endNode)
      let increment = ''
      if (node.increment) {
        increment = generateCode(node.incrementNode)
      }
      // return a string using array.from. The length is the end - start + 1 / increment if it exists
      const lengthStr = `${end} - ${start} + 1 ${increment ? '/ ' + increment : ''}`
      return `Array.from({length: ${lengthStr}}, (_, i) => ${start} + i ${increment ? '*' + increment : ''})`
    }
  },
  if_block: {
    generator: (node) => {
      let useInlineIf = false
      // If we are in middle of a transform chain, we need to use inlineIf and create a new transformchain
      if (inTransformChain()) {
        // pushTransformChain()
        useInlineIf = true
      }
      const condition = generateCode(node.conditionNode)
      const consequence = generateCode(node.consequenceNode)
      const alternative = node.namedChildren[2] && generateCode(node.namedChildren[2])
      // node.alternativeNodes?.length > 0 && generateCode(node.alternativeNodes[1])
      if (useInlineIf) {
        // popTransformChain()
        return dedent`\n...inlineIf(${condition}, 
          (jscadObjects) => ${consequence}, 
          ${alternative ? `(jscadObjects) => ${alternative})` : '()=>[]),'}`
      } else {
        return dedent`if (${condition}) {\n${tabbed(consequence)}\n}\n
        ${alternative ? `else {\n${tabbed(alternative)}\n}\n` : ''}`
      }
    }
  },
  special_variable: {
    generator: (node) => {
      const name = node.text
      switch (name) {
        case '$t': return '1'
        case '$fn': return 'segments'
        default: return ''
      }
      //   '$children': 'jscadObjects',
      //   '$fa': '0.5',
      //   '$fs': '0.5',
      //   '$fn': '12',
      //  '$t': '0',
      //   '$vpr': '[0, 0, 0]',
      //   '$vpd': '[0, 0, -1]',
      //   '$vup': '[0, 1, 0]',
      //   '$vpc': '[0, 0, 0]',
      //   '$children': 'jscadObjects',
    }
  },
  modifier: {
    generator: () => '' // remove modifiers
  },
  function_declaration: {
    generator: (node) => {
      startNewScope()
      const name = generateCode(node.nameNode)
      const parameters = node.children[2].text
      const expression = generateCode(node.children[4]) // The expression is the 5th child (index 4)

      const result = `\n\nfunction ${name}${parameters} {\n${tabbed(`return ${expression};`)}\n}\n`

      endCurrentScope()
      return result
    }
  }
}

export function getCodeFormats (jscadCode: string) {
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
    jscadCode,
    jsCode: outputJs,
    caditCode: caditJs
  }
}
