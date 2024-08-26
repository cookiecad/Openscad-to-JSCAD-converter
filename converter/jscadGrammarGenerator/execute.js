import fs from 'fs';
import { translate } from './grammarToJscadSyntax.js';
import openscadGrammar from "tree-sitter-openscad/src/grammar.json" with { type: "json" }

try {
  const jscadSyntax = translate(openscadGrammar);
  const jscadSyntaxString = JSON.stringify(jscadSyntax, null, 2);
  fs.writeFileSync('jscadSyntaxFromGrammar.json', jscadSyntaxString);
  console.log(jscadSyntax)
} catch (error) {
  console.error("Error processing grammar:", error);
}