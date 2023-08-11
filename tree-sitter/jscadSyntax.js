import generatedJscad from './jscadSyntaxFromGrammar.json' assert { type: "json" };

const jscadSyntax = {
  ...generatedJscad,

  assignment: {
    open: '',
    close: '\n',
    children: [
      { name: 'leftNode', optional: false },
      { name: 'rightNode', optional: false }
    ],
    separator: ' = '
  },
  comment: {
    open: '', //comment already includes the "//"
    close: '',
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
  } ,
  function_call: {
    generator: generateFunctionCall
  },
  arguments: {
    open: '',
    close: '',
    children: 'all',
    separator: ', '
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
      { childIndex: 4, name: 'alternate', optional: false },
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
    children: [
      { childIndex: 1, name: 'expression', optional: false }
    ],
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
    generator: node => {
      const name = node.child(1).text;
      const parameters = node.child(2).text;
      const body = generateCode(node.child(3));
      return `\n\nfunction ${name}${parameters} {\n
        const jscadObjects = [];\n
        ${body}\n
        return jscadObjects;\n
      }\n`;
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
    generator: node => {
      const name = node.child(0).text;
      const args = generateCode(node.child(1));
      return `\n${name}(${args})`;
    }
  },
  union_block: { //I don't think we need the brackets as we are already adding it to module_declaration
    open: "",
    close: "",
    children: "all",
    separator: ""
  },
  for_block: {
    generator: node => {
      const assignments = node.child(1);
      const body = generateCode(node.child(2));
      //assignments is of type parenthesized_assignments
      const assignment = assignments.namedChildren[0];
      const varName = assignment['leftNode'].text;
      const range = assignment['rightNode'];
      const rangeText = generateCode(range);
      return `for (let ${varName} of ${rangeText}) {\n${body}\n}\n`;
    }
  },

  // [0:fill?max_grid_hexagons_x-1:(len(cols)-1)]
  range: {
    generator: node => {
      const start = generateCode(node['startNode']);
      const end = generateCode(node['endNode']);
      let increment = '';
      if(node['increment']) {
        increment = generateCode(node['incrementNode']);
      }
      //return a string using array.from. The length is the end - start + 1 / increment if it exists
      const lengthStr = `${end} - ${start} + 1 ${increment ? '/ ' + increment : ''}`
      return `Array.from({length: ${lengthStr}}, (_, i) => ${start} + i ${increment ? '*' + increment : ''})`;
    }
  }
};

  

export function generateCode(node) {
  const syntax = jscadSyntax;
  var result;
  if (!node) {
    throw new Error('Node not provided');
  }
  const type = node.type;
  if (!syntax[type]) {
    let e = new Error(`Syntax not found for type: ${type}`);
    e.node = node;
    throw e;
  }

  const open = syntax[type]?.open || '';
  const close = syntax[type]?.close || '';
  const separator = syntax[type]?.separator || '';
  if ('generator' in syntax[type]) {
    result = syntax[type].generator(node);
  }
  else if ('children' in syntax[type]) {
    const children = syntax[type].children === 'all'
      ? node.namedChildren.map(namedChild => generateCode(namedChild))
      : syntax[type].children.map(child => {
        const childNode = (child.hasOwnProperty('childIndex'))
          ? node.children[child.childIndex]
          : node[child.name];
        if (!childNode) {
            throw new Error(`Child node not found: ${child.name}`);
          }
          return child.isText ? childNode.text : generateCode(childNode);
        });
    result = `${open}${children.join(separator)}${close}`;
  } else if (type === 'comment') {
    const text = syntax[type]?.text || '';
    result = `${open}${node[text]}\n`;
  } else {
    result = node.text;
  }

  if (node.parent.type == 'source_file') {
    process.stdout.write(`\n<${result}>\n`);
  }
  
  return result;
}



function generateFunctionCall(node) {
  const functionName = node.child(0).text;
  const args = [];
  for (let i = 1; i < node.childCount; i++) {
    args.push(generateCode(node.child(i)));
  }
  if (functionName === 'cube') {
    return `CSG.${functionName}({size: [${args.join(', ')}]})`;
  } else if (functionName === 'sphere') {
    return `CSG.${functionName}({radius: ${args[0]}})`;
  } else if (functionName === 'cylinder') {
    return `CSG.${functionName}({radius: ${args[0]}, height: ${args[1]}})`;
  } else if (functionName === 'len') {
    return `${args[0]}.length`;
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
    };
    const mappedName = mapping[functionName] || functionName;
    return `${mappedName}(${args.join(', ')})\n`;
  }
}