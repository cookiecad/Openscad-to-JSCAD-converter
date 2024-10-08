// const STOP_PROCESSIMG = false

// function generateJSCAD(node) {
// switch (node.type) {
//   case 'source_file':
//     return result;
// case 'module_declaration':
//   return generateJSCAD(node.child(1));
// case 'module_parameter_declaration':
//   return generateJSCAD(node.child(1));
// case 'module_instance':
//   return generateJSCAD(node.child(0));
// case 'function_call':
//   return generateFunctionCall(node);
// case 'identifier':
//   return node.text;
// case 'number':
//   return node.text;
// case 'boolean':
//   return node.text;
// case 'string':
//   return node.text.slice(1, -1);
// case 'unary_expression':
//   return generateCode(node);
// return generateUnaryExpression(node);
// case 'binary_expression':
//   return generateBinaryExpression(node);
// case 'conditional_expression':
//   return generateConditionalExpression(node);
// case 'parenthesized_expression':
//   return '(' + generateJSCAD(node.child(1)) + ')';
// case 'array_expression':
//   return generateArrayExpression(node);
// case 'object_expression':
//   return generateObjectExpression(node);
// case 'property_identifier':
//   return node.text;
// case 'property_access':
//   return generatePropertyAccess(node);
// case 'assignment_expression':
//   return generateAssignmentExpression(node);
// case 'variable_declaration':
//   return generateVariableDeclaration(node);
// case 'variable_declarator':
//   return generateVariableDeclarator(node);
// case 'if_statement':
//   return generateIfStatement(node);
// case 'else_clause':
//   return generateElseClause(node);
// case 'while_statement':
//   return generateWhileStatement(node);
// case 'do_statement':
//   return generateDoStatement(node);
// case 'for_statement':
//   return generateForStatement(node);
// case 'block':
//   return generateBlock(node);
// case 'return_statement':
//   return generateReturnStatement(node);
// case 'comment':
//   return generateCode(node);
// case 'assignment':
//     return generateCode(node);
// case '=':
//   return generateAssignment(node);
// case 'list':
//   return generateCode(node);
// case 'arguments':
//   return generateArguments(node);
// case 'transform_chain':
//   return generateTransformChain(node);
// case 'module_call':
//   return generateModuleCall(node);
// case 'ternary_expression':
// return generateTernaryExpression(node);
// return generateCode(node);
// default:

// try {
//   // if (['identifier', 'number', 'boolean', 'function_call', 'arguments', 'ternary_expression',
//   //       'parenthesized_expression', 'index_expression', 'module_declaration', 'parameter_declaration', 'module_call'].includes(node.type)) {
//     return generateCode(node);
// }
// } catch (error) {
//   if (error.node) {
//     node = error.node;
//   }
//   console.trace(error);
//   process.stdout.write('\n');
//   out('red', `node type: `)
//   console.log(`${node.type}, text: ${node.text}`);
//   const rule = grammar.rules[node.type];
//   if (rule) {
//     out('red', `Grammar rule: `)
//     console.log(`${JSON.stringify(rule)}`);
//   }
//   STOP_PROCESSIMG = true;
//   return '';
// }
//   }
// }

// function generateUnaryExpression(node) {
//   const operator = node.child(0).text;
//   const argument = generateJSCAD(node.child(1));
//   return `${operator}${argument}`;
// }

// function generateBinaryExpression(node) {
//   const operator = node.child(1).text;
//   const left = generateJSCAD(node.child(0));
//   const right = generateJSCAD(node.child(2));
//   return `${left} ${operator} ${right}`;
// }

// function generateConditionalExpression(node) {
//   const test = generateJSCAD(node.child(0));
//   const consequent = generateJSCAD(node.child(2));
//   const alternate = generateJSCAD(node.child(4));
//   return `${test} ? ${consequent} : ${alternate}`;
// }

// function generateArrayExpression(node) {
//   const elements = [];
//   for (let i = 0; i < node.childCount; i++) {
//     elements.push(generateJSCAD(node.child(i)));
//   }
//   return `[${elements.join(', ')}]`;
// }

// function generateObjectExpression(node) {
//   const properties = [];
//   for (let i = 0; i < node.childCount; i++) {
//     properties.push(generateJSCAD(node.child(i)));
//   }
//   return `{${properties.join(', ')}}`;
// }

// function generatePropertyAccess (node) {
//   const object = generateJSCAD(node.child(0))
//   const property = generateJSCAD(node.child(2))
//   return `${object}.${property}`
// }

// function generateAssignmentExpression (node) {
//   const left = generateJSCAD(node.child(0))
//   const right = generateJSCAD(node.child(2))
//   return `${left} = ${right}`
// }

// function generateVariableDeclaration (node) {
//   const kind = node.child(0).text
//   const declarations = []
//   for (let i = 1; i < node.childCount; i++) {
//     declarations.push(generateJSCAD(node.child(i)))
//   }
//   process.stdout.write('\n')
//   return `${kind} ${declarations.join(', ')}\n`
// }

// function generateVariableDeclarator (node) {
//   const name = generateJSCAD(node.child(0))
//   const init = node.childCount > 1 ? ` = ${generateJSCAD(node.child(1))}` : ''
//   return `let ${name}${init}`
// }

// function generateIfStatement (node) {
//   const test = generateJSCAD(node.child(2))
//   const consequent = generateJSCAD(node.child(4))
//   const alternate = generateJSCAD(node.child(6))
//   let result = `if (${test}) ${consequent}`
//   if (alternate) {
//     result += ` else ${alternate}`
//   }
//   return result
// }

// function generateElseClause (node) {
//   return generateJSCAD(node.child(1))
// }

// function generateWhileStatement (node) {
//   const test = generateJSCAD(node.child(2))
//   const body = generateJSCAD(node.child(4))
//   return `while (${test}) ${body}`
// }

// function generateDoStatement (node) {
//   const body = generateJSCAD(node.child(1))
//   const test = generateJSCAD(node.child(3))
//   return `do ${body} while (${test})`
// }

// function generateForStatement (node) {
//   const init = generateJSCAD(node.child(2))
//   const test = generateJSCAD(node.child(4))
//   const update = generateJSCAD(node.child(6))
//   const body = generateJSCAD(node.child(8))
//   return `for (${init}; ${test}; ${update}) ${body}`
// }

// function generateBlock (node) {
//   const statements = []
//   for (let i = 1; i < node.childCount - 1; i++) {
//     statements.push(generateJSCAD(node.child(i)))
//   }
//   return `{${statements.join('; ')}}`
// }

// function generateReturnStatement (node) {
//   const argument = generateJSCAD(node.child(1))
//   return `return ${argument}`
// }

// function generateComment (node) {
//   // Jscad and openscad use // for comments
//   process.stdout.write('\n')
//   return `${node.text}\n`
// }

// function generateAssignment (node) {
//   if (node.type === 'assignment') {
//     const left = generateJSCAD(node.child(0))
//     const right = generateJSCAD(node.child(1))
//     process.stdout.write('\n')
//     return `${left} = ${right};\n`
//   } else if (node.type === '=') {
//     const right = generateJSCAD(node.nextNamedSibling)
//     return `${right}`
//   }
// }

// function generateList (node) {
//   let result = '['
//   for (let i = 0; i < node.namedChildCount; i++) {
//     const child = node.namedChild(i)
//     if (child) {
//       result += generateJSCAD(child)
//       if (i < node.namedChildCount - 1) {
//         result += ', '
//       }
//     }
//   }
//   result += ']'
//   return result
// }

// function generateArguments (node) {
//   let result = '('
//   for (let i = 0; i < node.namedChildCount; i++) {
//     const child = node.namedChild(i)
//     result += generateJSCAD(child)
//     if (i < node.namedChildCount - 1) {
//       result += ', '
//     }
//   }
//   result += ')'
//   return result
// }

// function generateTransformChain(node) {
//   let result = '';
//   for (let i = 0; i < node.namedChildCount; i++) {
//     const child = node.namedChild(i);
//     result += generateJSCAD(child);
//   }
//   return result;
// }

// function generateModuleCall(node) {
//   const name = generateJSCAD(node.child(0));
//   const args = generateJSCAD(node.child(1));
//   return `${name}(${args})`;
// }

// function generateTernaryExpression(node) {
//   const condition = generateJSCAD(node.child(0));
//   const consequence = generateJSCAD(node.child(2));
//   const alternative = generateJSCAD(node.child(4));
//   return `${condition} ? ${consequence} : ${alternative}`;
// }
