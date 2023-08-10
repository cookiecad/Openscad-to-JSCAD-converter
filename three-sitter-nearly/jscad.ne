@{%
function generateFunctionCall(node) {
  const functionName = node.child(0).text;
  const args = [];
  for (let i = 1; i < node.childCount; i++) {
    args.push(generateJSCAD(node.child(i)));
  }
  switch (functionName) {
    case 'cube':
      return `CSG.${functionName}({size: [${args.join(', ')}]})`;
    case 'sphere':
      return `CSG.${functionName}({radius: ${args[0]}})`;
    case 'cylinder':
      return `CSG.${functionName}({radius: ${args[0]}, height: ${args[1]}})`;
    // Add more function mappings here
    default:
      return `${functionName}(${args.join(', ')})`;
  }
}

function generateUnaryExpression(node) {
  const operator = node.child(0).text;
  const argument = generateJSCAD(node.child(1));
  return `${operator}${argument}`;
}

function generateBinaryExpression(node) {
  const operator = node.child(1).text;
  const left = generateJSCAD(node.child(0));
  const right = generateJSCAD(node.child(2));
  return `${left} ${operator} ${right}`;
}

function generateConditionalExpression(node) {
  const test = generateJSCAD(node.child(0));
  const consequent = generateJSCAD(node.child(2));
  const alternate = generateJSCAD(node.child(4));
  return `${test} ? ${consequent} : ${alternate}`;
}

function generateArrayExpression(node) {
  const elements = [];
  for (let i = 0; i < node.childCount; i++) {
    elements.push(generateJSCAD(node.child(i)));
  }
  return `[${elements.join(', ')}]`;
}

function generateObjectExpression(node) {
  const properties = [];
  for (let i = 0; i < node.childCount; i++) {
    properties.push(generateJSCAD(node.child(i)));
  }
  return `{${properties.join(', ')}}`;
}

function generatePropertyAccess(node) {
  const object = generateJSCAD(node.child(0));
  const property = generateJSCAD(node.child(2));
  return `${object}.${property}`;
}

function generateAssignmentExpression(node) {
  const left = generateJSCAD(node.child(0));
  const right = generateJSCAD(node.child(2));
  return `${left} = ${right}`;
}

function generateVariableDeclaration(node) {
  const kind = node.child(0).text;
  const declarations = [];
  for (let i = 1; i < node.childCount; i++) {
    declarations.push(generateJSCAD(node.child(i)));
  }
  process.stdout.write('\n')
  return `${kind} ${declarations.join(', ')}\n`;
}

function generateVariableDeclarator(node) {
  const name = generateJSCAD(node.child(0));
  const init = node.childCount > 1 ? ` = ${generateJSCAD(node.child(1))}` : '';
  return `let ${name}${init}`;
}
%}

@{%
const grammar = require('./grammar');
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
%}

start -> _ $ => parser.feed($._source).results[0];

_ -> " "*

number -> /[0-9]+/

identifier -> /[a-zA-Z_][a-zA-Z0-9_]*/

string -> /"(?:[^"\\]|\\.)*"/

boolean -> "true" | "false"

list -> "[" [number ("," number)*] "]"

arguments -> "(" [start ("," start)*] ")"

transform_chain -> "[" [start ("," start)*] "]"

property_identifier -> identifier

property_access -> start "." property_identifier

unary_expression -> "-" start
                  | "!" start

binary_expression -> start "+" start
                   | start "-" start
                   | start "*" start
                   | start "/" start
                   | start "%" start
                   | start "<" start
                   | start ">" start
                   | start "<=" start
                   | start ">=" start
                   | start "==" start
                   | start "!=" start
                   | start "&&" start
                   | start "||" start

conditional_expression -> start "?" start ":" start

parenthesized_expression -> "(" start ")"

array_expression -> list

object_expression -> "{" [property_access ":" start ("," property_access ":" start)*] "}"

assignment_expression -> identifier "=" start

variable_declaration -> "let" identifier "=" start

variable_declarator -> identifier ["=" start]

if_statement -> "if" parenthesized_expression start [ "else" start ]

while_statement -> "while" parenthesized_expression start

do_statement -> "do" start "while" parenthesized_expression ";"

for_statement -> "for" "(" variable_declaration ";" binary_expression ";" assignment_expression ")" start

block -> "{" [start]* "}"

return_statement -> "return" start ";"

comment -> /\/\/[^\n]*/

assignment -> identifier "=" start ";"

module_declaration -> "module" identifier arguments block

module_parameter_declaration -> "module" identifier arguments ";"

module_instance -> identifier arguments ";"

source_file -> [module_declaration | module_parameter_declaration | module_instance | start]*
