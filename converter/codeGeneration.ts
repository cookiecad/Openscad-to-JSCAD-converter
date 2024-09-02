//@ts-check
import { jscadSyntax, getCodeFormats as getCodeFormatsJscad } from './jscadSyntax';
import { manifoldSyntax, getCodeFormats as getCodeFormatsJManifold } from './manifoldSyntax';
import grammar from "tree-sitter-openscad/src/grammar.json" with { type: "json" }

import { out } from './utils.js';
import { SyntaxNode } from './types';

let syntax: typeof jscadSyntax | typeof manifoldSyntax;

export function generateTreeCode(node: SyntaxNode, language: 'jscad' | 'manifold') {
  let getCodeFormats: (code: string) => { [key: string]: string };
  if (language === 'jscad') {
    syntax = jscadSyntax;
    getCodeFormats = getCodeFormatsJscad;
  }
  else {
    syntax = manifoldSyntax;
    getCodeFormats = getCodeFormatsJManifold;
  }
  const code = generateCode(node)
  const formats = getCodeFormats(code)
  return { code, formats, node }
}

export function generateCode(node: SyntaxNode) {
  if (!node) {
    throw new Error('Node not provided');
  }
  const type = node.type;
  if (!syntax[type]) {
    const e = new Error(`Syntax not found for type: ${type}`);
    e.node = node;
    throw e;
  }

  // if (STOP_PROCESSIMG) { return; }

  try {
    process.stdout.write(`${node.type} `);
    let result = '';

    const open = syntax[type]?.open || '';
    const close = syntax[type]?.close || '';
    const separator = syntax[type]?.separator || '';
    if ('generator' in syntax[type]) {
      result = syntax[type].generator!(node);
    } else if ('children' in syntax[type]) {
      const children =
        syntax[type].children === 'all'
          ? node.namedChildren.map((namedChild) => generateCode(namedChild))
          : syntax[type].children!.map((child) => {
            const childNode = child.hasOwnProperty('childIndex')
              ? node.children[child.childIndex]
              : node[child.name];
            if (!childNode) {
              throw new {
                ...Error(`Child node not found: ${child.name}`),
                node
              }();
            }
            return child.isText ? childNode.text : generateCode(childNode);
          });
      result = `${open}${children.join(separator)}${close}`;
    } else {
      result = node.text;
    }

    node.outputCode = result;
    return result;
  } catch (error) {
    if (error.node) {
      node = error.node;
    }
    process.stdout.write('\n');
    out('red', 'node type: ');
    console.log(`${node.type}, text: ${node.text}`);
    const rule = grammar.rules[node.type];
    if (rule) {
      out('red', 'Grammar rule: ');
      console.log(`${JSON.stringify(rule)}`);
    }
    error.message = `Error in generateCode: ${error.message}\n node type: ${node.type}, text: ${node.text}
    grammar rule: ${JSON.stringify(rule)}`
    throw error
  }
}

export function generateFunctionCall (node: SyntaxNode) {
  //We can probably share code with module call 

  const functionName = node.child(0)?.text
  const args = []
  for (let i = 1; i < node.children.length; i++) {
    args.push(generateCode(node.children[i]))
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
      sqrt: 'Math.sqrt',
      PI: 'Math.PI',
      atan2: 'Math.atan2',
      round: 'Math.round',

      // Add more mappings here
    }
    const mappedName = mapping[functionName] || functionName
    return `${mappedName}(${args.join(', ')})`
  }
}

export function parseFunctionArguments (node: SyntaxNode) {
  const args: {[key: string]: any} = {}
  const positionalArgs = []
  let children = ''

  const childrenCount = node.namedChildren?.length || 0;

  for (let i = 0; i < childrenCount; i++) {
    const child = node.namedChild(i);
    if (!child) {throw new Error(`Child not found at index ${i}`)}

    // Openscad allows assignment as a way to pass named arguments
    if (child.type === 'named_argument' || child.type === 'assignment') {
      let child0 = child.namedChild(0);
      let child1 = child.namedChild(1);
      if (!child0 || !child1) {throw new Error(`Named argument children not found at index ${i}`)}
      const key = generateCode(child0)
      const value = generateCode(child1)
      args[key] = value
    } else if ((child as SyntaxNode).isModuleChildren) { // This is our flag to indicate this node is the "children" of a module call (ie difference() { children })
      children = generateCode(child)
    } else {
      args[i] = generateCode(child)
    }
  }
  args.length = childrenCount

  return { args, children }
}
