import fs from 'fs';
import path from 'path';
import Parser from 'tree-sitter';
import OpenSCAD from 'tree-sitter-openscad';
import nearley from 'nearley';
import grammar from './grammar';

// Load the OpenSCAD grammar
const parser = new Parser();
parser.setLanguage(OpenSCAD);

// Read the OpenSCAD file
// Take the filename from the command line arguments
const filename = process.argv[2];
if (!filename) {
    console.error('No filename provided. Usage: node index.js <filename.scad>');
    process.exit(1);
}
const code = fs.readFileSync(filename, 'utf8');

// Parse the OpenSCAD code
const tree = parser.parse(code);

// Traverse the syntax tree and generate JSCAD code
const jscadCode = generateJSCAD(tree.rootNode);
// const formattedCode = prettier.format(jscadCode, { parser: 'babel' });

// Output the JSCAD code
console.log('JSCAD code ---------------:');
console.log(jscadCode);

var STOP_PROCESSIMG = false;

function generateJSCAD(node) {
  if (STOP_PROCESSIMG) { return; }

  process.stdout.write(`${node.type} `);
  let result = '';
  for (let i = 0; i < node.namedChildCount; i++) {
    result += generateJSCAD(node.namedChild(i));
  }
  switch (node.type) {
    case 'source_file':
      const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
      parser.feed(result);
      return parser.results[0];
    case 'module_declaration':
      return generateJSCAD(node.child(1));
    case 'module_parameter_declaration':
      return generateJSCAD(node.child(1));
    case 'module_instance':
      return generateJSCAD(node.child(0));
    case 'function_call':
      return generateFunctionCall(node);
    case 'identifier':
      return node.text;
    case 'number':
      return node.text;
    case 'string':
      return node.text.slice(1, -1);
    case 'unary_expression':
      return generateUnaryExpression(node);
    case 'binary_expression':
      return generateBinaryExpression(node);
    case 'conditional_expression':
      return generateConditionalExpression(node);
    case 'parenthesized_expression':
      return '(' + generateJSCAD(node.child(1)) + ')';
    case 'array_expression':
      return generateArrayExpression(node);
    case 'object_expression':
      return generateObjectExpression(node);
    case 'property_identifier':
      return node.text;
    case 'property_access':
      return generatePropertyAccess(node);
    case 'assignment_expression':
      return generateAssignmentExpression(node);
    case 'variable_declaration':
      return generateVariableDeclaration(node);
    case 'variable_declarator':
      return generateVariableDeclarator(node);
    case 'if_statement':
      return generateIfStatement(node);
    case 'else_clause':
      return generateElseClause(node);
    case 'while_statement':
      return generateWhileStatement(node);
    case 'do_statement':
      return generateDoStatement(node);
    case 'for_statement':
      return generateForStatement(node);
    case 'block':
      return generateBlock(node);
    case 'return_statement':
      return generateReturnStatement(node);
    case 'comment':
      return generateComment(node);
    case 'assignment':
        return generateAssignment(node);  
    case '=':
      return generateAssignment(node);        
    case 'boolean':
      return node.text;  
    case 'list':
      return generateList(node);      
    case 'arguments':
      return generateArguments(node);
    case 'transform_chain':
      return generateTransformChain(node);      
    default:
      console.log(`Unrecognized node type: ${node.type}, text: ${node.text}`);
      const rule = grammar.rules[node.type];
      if (rule) {
        console.log(`Grammar rule: ${JSON.stringify(rule)}`);
      }
      STOP_PROCESSIMG = true;
      return '';
  }
}