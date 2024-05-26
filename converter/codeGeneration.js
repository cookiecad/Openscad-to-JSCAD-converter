import { jscadSyntax } from './jscadSyntax.js';
import grammar from "tree-sitter-openscad/src/grammar.json" assert { type: "json" }

import { out } from './utils.js';

export let moduleNames;

// Function to find module names
function getModuleNames(node) {
  if (node.type === 'module_declaration') {
    return [node.child(1).text];
  } else {
    return node.namedChildren.map(getModuleNames).flat();
  }
}

export function generateTreeCode(node) {
  moduleNames = getModuleNames(node);
  return generateCode(node);
}

export function generateCode(node) {
  const syntax = jscadSyntax;
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
      result = syntax[type].generator(node);
    } else if ('children' in syntax[type]) {
      const children =
        syntax[type].children === 'all'
          ? node.namedChildren.map((namedChild) => generateCode(namedChild))
          : syntax[type].children.map((child) => {
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
    throw error;
  }
}

export function generateFunctionCall (node) {
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
