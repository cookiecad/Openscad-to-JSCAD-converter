CommaSep
  = _ "," _

ParensGrouping
  = Parens _Expression
BracketsGrouping
  = Brackets _Expression
CurliesGrouping
  = Curlies _Expression

Parens
  = "(" _ ")"

Brackets
  = "[" _ "]"

Curlies
  = "{" _ "}"

BinaryOperator
  = _ operator:("+" / "-" / "*" / "/" / "||" / "&&" / "==" / "!=" / "<" / ">" / "<=" / ">=") _ { return operator; }

IdentifierPattern
  = [a-zA-Z_] [a-zA-Z0-9_]*
  
SourceFile
  = (UseStatement / _Item)*

extras
  = Space
  / Comment
  / ";"  // consider standalone semicolons as 'extra' and ignore them

Space
  = [ \t\n\r]*  // match any amount of whitespace

_
  = [ \t\n\r]*  // match any amount of whitespace

Comment
  = "/*" (!"*/" .)* "*/"
  / "//" (!"\n" .)* "\n"

_Item
  = Assignment ";"
  / _Statement
  / ModuleDeclaration
  / FunctionDeclaration

ModuleDeclaration
  = "module" Identifier ParametersDeclaration _Statement

ParametersDeclaration
  = Parens CommaSep(_ParameterDeclaration [","])

_ParameterDeclaration
  = _VariableName
  / Assignment

FunctionDeclaration
  = "function" Identifier ParametersDeclaration "=" _Expression

_Statement
  = ForBlock
  / IntersectionForBlock
  / IfBlock
  / LetBlock
  / AssignBlock
  / UnionBlock
  / ModifierChain
  / TransformChain
  / IncludeStatement
  / AssertStatement
  / ";"

IncludeStatement
  = "include" IncludePath

UseStatement
  = "use" IncludePath

IncludePath
  = "<" [^>]* ">"

Assignment
  = _VariableName "=" _Expression

UnionBlock
  = Curlies _Item*

BodiedBlock
  = Keyword effect:Effect block:_Statement { return { keyword, effect, block }; }

ForBlock
  = "for" effect:ParenthesizedAssignments block:_Statement { return { keyword: "for", effect, block }; }

IntersectionForBlock
  = "intersection_for" effect:ParenthesizedAssignments block:_Statement { return { keyword: "intersection_for", effect, block }; }

LetBlock
  = "let" effect:ParenthesizedAssignments block:_Statement { return { keyword: "let", effect, block }; }

AssignBlock
  = "assign" effect:ParenthesizedAssignments block:_Statement { return { keyword: "assign", effect, block }; }

IfBlock
  = "if" ParenthesizedExpression:condition _Statement:consequence ("else" _Statement:alternative)?

ModifierChain
  = Modifier _Statement

Modifier
  = "*" / "!" / "#" / "%"

TransformChain
  = ModuleCall _Statement

ModuleCall
  = Identifier Arguments:arguments

Arguments
  = Parens commaSep(_Expression / Assignment)

ParenthesizedAssignments
  = Parens commaSep(Assignment [","])

ParenthesizedExpression
  = Parens _Expression

ConditionUpdateClause
  = Parens Assignment:initializer [","] ";" _Expression:condition ";" Assignment:update

_Expression
  = ParenthesizedExpression
  / UnaryExpression
  / BinaryExpression
  / TernaryExpression
  / LetExpression
  / FunctionCall
  / IndexExpression
  / DotIndexExpression
  / AssertExpression
  / _Literal
  / _VariableName

LetExpression
  = "let" effect:ParenthesizedAssignments expression:_Expression { return { keyword: "let", effect, expression }; }
  
Identifier
  = IdentifierPattern

SpecialVariable
  = "$" IdentifierPattern

_VariableName
  = Identifier
  / SpecialVariable

_Literal
  = String
  / Number
  / Boolean
  / Undef
  / Function
  / Range
  / List

String
  = "\"" (!("\"") / "\\\"")* "\""

Number
  = [0-9]+ ("." [0-9]*)? ("e" "-"? [0-9]+)?

Boolean
  = "true" / "false"

Undef
  = "undef"

Function
  = "function" ParametersDeclaration _Expression

Range
  = Brackets _Expression:start (":" _Expression:increment? ":" _Expression:end)

List
  = Brackets commaSep(_ListCell [","])

_ListCell
  = _Expression
  / Each
  / ListComprehension

_ComprehensionCell
  = _Expression
  / opt_grouping(parens Each)
  / opt_grouping(parens ListComprehension)

Each
  = "each" _Expression / ListComprehension

ListComprehension
  = ForClause / IfClause

ForClause
  = "for" (ParenthesizedAssignments / ConditionUpdateClause) _ComprehensionCell

IfClause
  = "if" ParenthesizedExpression:condition _ComprehensionCell:consequence ("else" _ComprehensionCell:alternative)?

FunctionCall
  = _Expression:function Arguments:arguments

IndexExpression
  = _Expression:value Brackets _Expression:index

DotIndexExpression
  = _Expression:value "." Identifier:index

UnaryExpression
  = "!" _Expression
  / "-" _Expression
  / "+" _Expression

BinaryExpression
  = _Expression "||" _Expression
  / _Expression "&&" _Expression
  / _Expression "==" _Expression
  / _Expression "!=" _Expression
  / _Expression "<" _Expression
  / _Expression ">" _Expression
  / _Expression "<=" _Expression
  / _Expression ">=" _Expression
  / _Expression "+" _Expression
  / _Expression "-" _Expression
  / _Expression "*" _Expression
  / _Expression "/" _Expression
  / _Expression "%" _Expression
  / _Expression "^" _Expression

TernaryExpression
  = _Expression:condition "?" _Expression:consequence ":" _Expression:alternative

_AssertClause
  = "assert" Parens _Expression:condition [","] _Expression:message [","] _Expression:trailing_args*

AssertStatement
  = _AssertClause _Statement

AssertExpression
  = _AssertClause _Expression
