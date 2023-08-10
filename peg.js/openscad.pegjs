start 
  = _ code:(assignment / function_call / declaration)* _ 
      { return {type: 'program', body: code}; }
  
assignment 
  = variable:variable _ "=" _ value:assignmentExpression _ ";" 
      { return {type: 'assignment', variable, value}; }

function_call 
  = name:variable "(" _ args:(assignmentExpression (_ ",")? _)* lastArg:assignmentExpression _ ")" _ ";" 
      { return {type: 'function_call', name, args: [...args, lastArg]}; }

declaration
  = type:variable _ names:(variable (_ ",")? _)* lastVar:variable _ ";" 
      { return {type: 'declaration', type, names: [...names, lastVar]}; }

assignmentExpression = boolean / array / numeric / variable / ternary

boolean
  = "true"i { return true } 
  / "false"i { return false }

array
  = "[" _ elements:arrayElements _ "]" { return elements; }

arrayElements 
  = head:assignmentExpression _ "," _ tail:arrayElements { return [head].concat(tail); } 
  / assignmentExpression

variable 
  = $[a-zA-Z_][a-zA-Z_0-9]*

numeric 
  = $[0-9]+ ( "." [0-9]+ )?

_ "whitespace" 
  = ws:whitespace { return ws.join(''); }

whitespace 
  = [ \t\n\r] 
  / single_line_comment 
  / multi_line_comment

single_line_comment 
  = "//" (!"\n" .)* "\n"

multi_line_comment 
  = "/*" (!"*/" .)* "*/"

ternary = condition:assignmentExpression _ "?" _ trueExpr:assignmentExpression _ ":" _ falseExpr:assignmentExpression { return {type: 'ternary', condition, trueExpr, falseExpr}; }

expression
  = head:term tail:(_ ("+" / "-") _ term:term { return function(a, b) { return a + b; }; })*
    {
      var result = head;
      for (var i = 0; i < tail.length; i++) {
        result = tail[i][1](result, tail[i][3]);
      }

      return result;
    }
  
term
  = head:factor tail:(_ ("*" / "/") _ factor:factor { return function(a, b) { return a * b; }; })*
    {
      var result = head;
      for (var i = 0; i < tail.length; i++) {
        result = tail[i][1](result, tail[i][3]);
      }

      return result;
    }

factor
  = "(" _ expr:expression _ ")" { return expr; }
  / numeric
  / boolean
  / variable
  / ternary
  / array

