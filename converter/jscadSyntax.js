import generatedJscad from "./jscadSyntaxFromGrammar.json" assert { type: "json" }
import grammar from "tree-sitter-openscad/src/grammar.json" assert { type: "json" }
import chalk from 'chalk'
import dedent from 'dedent'
const log = (color, msg) => console.log(chalk[color](msg))
const out = (color, msg) => process.stdout.write(chalk[color](msg))

const scopes = [new Set()] // Initialize the global scope

// Whenever a new block scope starts (module or function)
function startNewScope () {
  scopes.push(new Set())
}

// Whenever a block scope ends
function endCurrentScope () {
  scopes.pop()
}

const transformChainCounter = [0]
const inTransformChain = () =>
  transformChainCounter[transformChainCounter.length - 1] > 0
function pushTransformChain () {
  transformChainCounter.push(0)
}
function popTransformChain () {
  transformChainCounter.pop()
}
function startTransformChain () {
  transformChainCounter[transformChainCounter.length - 1]++
}
function endTransformChain () {
  transformChainCounter[transformChainCounter.length - 1]--
}

const helperFunctions = [
  dedent`
  function inlineIf(condition, ifTrue, ifFalse) {
    let jscadObjects = [];
    if (condition) return ifTrue(jscadObjects)
    else return ifFalse(jscadObjects)
  }`,

  dedent`
  function inlineFor(init, test, increment, body) {
    let jscadObjects = []
    for (let i = init; test(i); i = increment(i)) {
      jscadObjects.push(body(i))
    }
    return jscadObjects
  }
`,
  // Rotate degrees, convert all args[0] to radians and pass to rotate along with the rest of the args
  dedent`
  function rotateDegrees(...args) {
    return rotate(args[0].map(i => i * Math.PI / 180), ...args.slice(1));
  }`,

  // We may need to make sure to only run this for extrudeLinear
  dedent`
  //Openscad accepts clockwise polygons for extrude. Ensure polygon points are counter clockwise
  function polygonEnsureCounterclockwise(...args) {
    let points = args[0].points;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      let j = (i + 1) % points.length;
      area += points[i][0] * points[j][1];
      area -= points[j][0] * points[i][1];
    }
    if (area < 0) {
      points.reverse();
    }
    return polygon(...args);
  }`
]

const jscadSyntax = {
  ...generatedJscad,

  source_file: {
    open: dedent`
      const { primitives, booleans, transforms, extrusions } = jscad;
      const { cube, sphere, cylinder, polygon, cuboid } = primitives;
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
      if (name === 'cube') {
        let size = convertVector3(parsedArgs[0] || parsedArgs['size'] || '1');
        let center = parsedArgs[1] || parsedArgs['center'];  
        let centerStr = (center?.toLowerCase() === 'true') ? '' : `vec3.scale(vec3.create(), ${size}, 0.5)`;
        result = `cuboid({size: ${size}${centerStr && `, center: ${centerStr}`}})`
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
      const assignments = node.child(1)
      const body = generateCode(node.child(2))
      // assignments is of type parenthesized_assignments
      const assignment = assignments.namedChildren[0]
      const varName = assignment.leftNode.text
      const range = assignment.rightNode
      const rangeText = generateCode(range)
      return `for (let ${varName} of ${rangeText}) {\n${tabbed(body)}\n}\n`
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

function customNodeCopy (node, map = new Map()) {
  if (map.has(node)) return map.get(node) // if node copy already exists, return it

  const copyNode = {
    type: node.type,
    parent: node.parent,
    text: node.text,
    namedChildren: [],
    children: [],
    namedChild: function (index) {
      return this.namedChildren[index]
    },
    child: function (index) {
      return this.children[index]
    }
  }
  map.set(node, copyNode) // add node and its copy to the identity map

  copyNode.namedChildren = node.namedChildren.map((i) =>
    customNodeCopy(i, map)
  )
  copyNode.children = node.children.map((i) => customNodeCopy(i, map))
  // Add namedChildren properties to copyNode
  // Loop through the node keys for keys that end in 'Node' and add them to the copyNode
  getAllProperties(node).forEach((key) => {
    if (key.endsWith('Node')) {
      copyNode[key] = customNodeCopy(node[key], map)
    }
  })
  return copyNode
}

function tabbed (str) {
  return str.replace(/^/gm, '  ')
}

// Find all methods of an object, up to the root prototype
function getAllProperties (obj, allProps = []) {
  if (!obj) {
    return [...new Set(allProps)]
  }

  const props = Object.getOwnPropertyNames(obj)
  return getAllProperties(Object.getPrototypeOf(obj), [...allProps, ...props])
}

let moduleNames
export function generateTreeCode (node) {
  function getModuleNames (node) {
    if (node.type === 'module_declaration') {
      return [node.child(1).text]
    } else {
      return node.namedChildren.map(getModuleNames).flat()
    }
  }

  moduleNames = getModuleNames(node)
  return generateCode(node)
}

export function generateCode (node) {
  const syntax = jscadSyntax
  if (!node) {
    throw new Error('Node not provided')
  }
  const type = node.type
  if (!syntax[type]) {
    const e = new Error(`Syntax not found for type: ${type}`)
    e.node = node
    throw e
  }

  // if (STOP_PROCESSIMG) { return; }

  try {
    process.stdout.write(`${node.type} `)
    let result = ''

    const open = syntax[type]?.open || ''
    const close = syntax[type]?.close || ''
    const separator = syntax[type]?.separator || ''
    if ('generator' in syntax[type]) {
      result = syntax[type].generator(node)
    } else if ('children' in syntax[type]) {
      const children =
        syntax[type].children === 'all'
          ? node.namedChildren.map((namedChild) => generateCode(namedChild))
          : syntax[type].children.map((child) => {
            const childNode = child.hasOwnProperty('childIndex')
              ? node.children[child.childIndex]
              : node[child.name]
            if (!childNode) {
              throw new {
                ...Error(`Child node not found: ${child.name}`),
                node
              }()
            }
            return child.isText ? childNode.text : generateCode(childNode)
          })
      result = `${open}${children.join(separator)}${close}`
    } else {
      result = node.text
    }

    // if ((node.parent?.type == 'source_file') && (node.type != 'module_declaration')
    //     || (node.parent?.type == 'module_declaration')) {
    //   process.stdout.write(`\n<${result}>\n`);
    // }

    return result
  } catch (error) {
    if (error.node) {
      node = error.node
    }
    // console.trace(error);
    process.stdout.write('\n')
    out('red', 'node type: ')
    console.log(`${node.type}, text: ${node.text}`)
    const rule = grammar.rules[node.type]
    if (rule) {
      out('red', 'Grammar rule: ')
      console.log(`${JSON.stringify(rule)}`)
    }
    throw error
  }
}

function generateFunctionCall (node) {
  //We can probably share code with module call 

  const functionName = node.child(0).text
  const args = []
  for (let i = 1; i < node.childCount; i++) {
    args.push(generateCode(node.child(i)))
  }
  // if (functionName === 'cube') {
  //   return `CSG.${functionName}({size: [${args.join(', ')}]})`;
  // } else
  if (functionName === 'sphere') {
    return `CSG.${functionName}({radius: ${args[0]}})`
  } else if (functionName === 'cylinder') {
    return `CSG.${functionName}({radius: ${args[0]}, height: ${args[1]}})`
  } else if (functionName === 'len') {
    return `${args[0]}.length`
  } else {
    const mapping = {
      floor: 'Math.floor',
      ceil: 'Math.ceil',
      abs: 'Math.abs',
      sin: 'Math.sin',
      cos: 'Math.cos',
      tan: 'Math.tan',
      asin: 'Math.asin',
      acos: 'Math.acos',
      atan: 'Math.atan',
      exp: 'Math.exp',
      log: 'Math.log',
      pow: 'Math.pow',
      min: 'Math.min',
      max: 'Math.max',
      random: 'Math.random',
      sqrt: 'Math.sqrt'
      // Add more mappings here
    }
    const mappedName = mapping[functionName] || functionName
    return `${mappedName}(${args.join(', ')})`
  }
}
