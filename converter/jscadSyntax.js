import { generateFunctionCall, generateCode } from './codeGeneration.js'
import { helperFunctions, out, scopes, startNewScope, endCurrentScope, inTransformChain, startTransformChain, endTransformChain, pushTransformChain, popTransformChain } from './utils.js';
import { getAllProperties, customNodeCopy, tabbed } from './nodeHelpers.js';

import generatedJscad from "./jscadSyntaxFromGrammar.json" assert { type: "json" }
import dedent from 'dedent';

export const jscadSyntax = {
  ...generatedJscad,

  source_file: {
    open: dedent`
      const { primitives, booleans, transforms, extrusions } = jscad;
      const { cube, sphere, cylinder, cylinderElliptic, polygon, cuboid } = primitives;
      const { union, subtract, intersection } = booleans;
      const { translate, rotate, scale, mirror } = transforms;
      const { extrudeLinear } = extrusions
      const { vec3 } = jscad.maths;
      ${helperFunctions.join('\n')}\n
      const jscadObjects = [];\n`,
    close: '\nreturn jscadObjects;\n',
    children: 'all',
    separator: ''
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
    children: [],
    text: 'text'
  },
  list: {
    open: '[',
    close: ']',
    children: 'all',
    separator: ', '
  },
  identifier: {
    text: 'text'
  },
  number: {
    text: 'text'
  },
  boolean: {
    text: 'text'
  },
  ';': {
    text: 'text'
  },
  '[': {
    text: 'text'
  },
  ']': {
    text: 'text'
  },
  ':': {
    text: 'text'
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
    text: 'text'
  },
  function_call: {
    generator: generateFunctionCall
  },
  arguments: {
    generator: (node) => {
      const args = [];
      for (let i = 0; i < node.namedChildren?.length; i++) {
        const child = node.namedChild(i);
        args.push(generateCode(child));
      }
      return args.join(', ');
    }
  },
  named_argument: {
    generator: (node) => {
      const key = generateCode(node.namedChild(0));
      const value = generateCode(node.namedChild(1));
      return `${key}: ${value}`;
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
      // const mapping = {
      //   difference: (args) => `subtract(${args})`,
      //   linear_extrude: (
      //     args
      //   ) => dedent`extrudeLinear( {height: ${generateCode(node.child(1).namedChild(0))}},
      //   ${node
      //     .child(1)
      //     .namedChildren.slice(1)
      //     .map((i) => generateCode(i))
      //     .join(', ')}          
      //     )`,
      //   polygon: (args) => `polygonEnsureCounterclockwise({points: ${args}})`,
      //   mirror: (
      //     args
      //   ) => `mirror( {normal: ${generateCode(node.child(1).namedChild(0))}},
      //   ${node
      //     .child(1)
      //     .namedChildren.slice(1)
      //     .map((i) => generateCode(i))
      //     .join(', ')}          
      //     )`,
      //   rotate: (args) => dedent`rotateDegrees(${args})`
      // }

      const name = node.child(0).text
      const argumentsNode = node.child(1)
      let result
      // if (name === 'linear_extrude') {
      //   //For linear extrude, the first argument is the height, the rest are the objects
      //   //TODO add support for named parameters
      //   args = dedent`{height: ${generateCode(node.child(1).namedChild(0))}}, ${node.child(1).namedChildren.slice(1).map((i) => generateCode(i)).join(', ') }`
      // }
      // else {
      // args = generateCode(node.child(1))
      // const args = generateCode(argumentsNode);

      //Map openscad function names and parameters to jscad
      
      const convertVector3 = (value) => {
        if (value === undefined) return ''
        if (value.startsWith('[')) return value
        return `[${value}, ${value}, ${value}]`
      }
      //Extract the arguments from the function call they can be passed a number of ways
      let parsedArgs = parseFunctionArguments(argumentsNode)
      // let children = node.child(1)?.namedChildren?.slice(1)?.map((i) => generateCode(i)).join(', ')
      let children = parsedArgs[1];
      //TODO: We may need a helper function to determine at runtime if size is a vector or a number. Center requires a vector
      const centerString = (center, size) => { return (center?.toLowerCase() === 'true') ? '' : `, center: vec3.scale(vec3.create(), ${size}, 0.5),` }
      if (name === 'cube') {
        let size = convertVector3(parsedArgs[0] || parsedArgs['size'] || '1');
        let center = parsedArgs[1] || parsedArgs['center'];  
        let centerStr = centerString(center, size);
        result = `cuboid({size: ${size}${centerStr}})`
      }
      else if (name === 'linear_extrude') {
        result = `extrudeLinear({height: ${parsedArgs[0] || parsedArgs['height']}}, ${children})`
      }
      else if (name === 'polygon') {
        let points = parsedArgs[0] || parsedArgs['points'];
        result = `polygonEnsureCounterclockwise({points: ${points}})`
      }
      else if (name === 'mirror') {
        let normal = parsedArgs[0] || parsedArgs['v'];
        result = `mirror({normal: ${normal}}, ${children})`
      }
      else if (name === 'rotate') {
        let degrees = convertVector3(parsedArgs[0] || parsedArgs['a']);
        let vector = parsedArgs['v'] || (parsedArgs.length > 2 ? parsedArgs[1] : '');
        if (vector) throw new Error(`${node.text}: Rotate around vector is not yet implemented`)
        result = `rotateDegrees(${degrees}, ${children})`
      }
      else if (name === 'difference') {
        result = `subtract(${generateCode(node.child(1))})`
      }
      else if (name === 'cylinder') {
        let h = parsedArgs[0] || parsedArgs['h'];
        let r1 = parsedArgs[1] || parsedArgs['r'] || parsedArgs['r1']
          || (parsedArgs['d'] && `${parsedArgs['d']} / 2`)
          || (parsedArgs['d1'] && `${parsedArgs['d1']} / 2`)
          || '1'
        let r2 = parsedArgs[2] || parsedArgs['r2'] || (parsedArgs['d2'] && `${parsedArgs['d2']} / 2`);
        let center = parsedArgs[3] || parsedArgs['center'] || 'false';
        //TODO - the center is actually the middle of (x2 - x1), (y2 - y1), (z2 - z1), or for a cylinder r, r, h/2
        let centerStr = centerString(center, `[${r1}, ${r1}, ${h}]`);
        if (r2) {
          result = `cylinderElliptic({height: ${h}, startRadius: [${r1}, ${r1}], endRadius: [${r2},${r2}]${centerStr}})`
        }
        else {
          result = `cylinder({height: ${h}, radius: ${r1}${centerStr}})`
        }
      }
      else {
        let args = node.namedChildren.slice(1).map(generateCode).join(', ')
        result = `${name}(${args})`
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
      const assignmentNode = node.namedChild(0).namedChild(0);
      const variable = generateCode(assignmentNode.child(0)); // get the variable name
      const valuesNode = assignmentNode.child(2); // get the range or list node

      let values;

      // Determine if it's a range or list
      if (valuesNode.type === 'range') {
        // Handle range
        const start = generateCode(valuesNode.child(1)) || '0';
        const increment = valuesNode.childCount === 7 ? generateCode(valuesNode.child(3)) : '1';
        const end = generateCode(valuesNode.child(valuesNode.childCount === 7 ? 5 : 3));
        values = `{start: ${start}, increment: ${increment}, end: ${end}}`;
      } else if (valuesNode.type === 'list') {
        // Handle list directly
        values = generateCode(valuesNode);
      } else {
        // Fallback to handle as list in case neither range nor list (unexpected case)
        values = `[${generateCode(valuesNode)}]`;
      }

      // Generate the body of the loop
      const body = generateCode(node.namedChild(1));
      
      let result;
      // if (inTransformChain()) {
      //   result = `\n...inlineFor('${variable}', ${values}, (context) => ${body.trim()}.map(obj => ({...obj, context}))),`
      // } else {
        result = dedent`
          inlineFor(${values}, (${variable}) => {
            ${body.trim()}\n
          });\n`
      // }

      return result;
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
  transform_chain: {
    generator: (node) => {
      let result
      startTransformChain()
      const child0 = node.namedChild(0)
      if (node.namedChildren.length === 1) {
        result = generateCode(child0)
      } else {
        const child0Copy = customNodeCopy(node.namedChild(0))
        const child1 = customNodeCopy(node.namedChild(1))

        const moduleArgs = child0Copy.namedChild(1)
        moduleArgs.namedChildren.push(child1)
        moduleArgs.children.push(child1)
        result = `${tabbed(generateCode(child0Copy))}`
      }
      endTransformChain()

      if (!inTransformChain()) {
        result = `jscadObjects.push(${result}\n);\n`
      }

      return result
    }
  },
  if_block: {
    generator: (node) => {
      let useInlineIf = false
      // If we are in middle of a transform chain, we need to use inlineIf and create a new transformchain
      if (inTransformChain()) {
        pushTransformChain()
        useInlineIf = true
      }
      const condition = generateCode(node.conditionNode)
      const consequence = generateCode(node.consequenceNode)
      if (useInlineIf) {
        popTransformChain()
        return `\n...inlineIf(${condition}, (jscadObjects) => ${consequence}, (jscadObjects) => {return []}),`
      } else {
        return `if (${condition}) {\n${tabbed(consequence)}\n}\n`
      }
    }
  },
  special_variable: {
    generator: (node) => {
      // const name = node.child(0).text;
      // const mapping = {
      //   '$children': 'jscadObjects',
      //   '$fa': '0.5',
      //   '$fs': '0.5',
      //   '$fn': '12',
      //   '$t': '0',
      //   '$vpr': '[0, 0, 0]',
      //   '$vpd': '[0, 0, -1]',
      //   '$vup': '[0, 1, 0]',
      //   '$vpc': '[0, 0, 0]',
      //   '$children': 'jscadObjects',
      // }
      return ''
    }
  }
}

function parseFunctionArguments(node) {
  const args = {};
  const positionalArgs = [];
  
  const childrenCount = node.namedChildren?.length;

  for (let i = 0; i < childrenCount; i++) {
    const child = node.namedChild(i);
    
    //Openscad allows assignment as a way to pass named arguments
    if (child.type === 'named_argument' || child.type === 'assignment')  {
      const key = generateCode(child.namedChild(0));
      const value = generateCode(child.namedChild(1));
      args[key] = value;
    } else {
      args[i] = generateCode(child);
    }
  }
  
  return args;
}




