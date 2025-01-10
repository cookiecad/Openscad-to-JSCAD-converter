import fs from 'fs';
import { translate } from './grammarToJscadSyntax.js';
import openscadGrammar from "tree-sitter-openscad/src/grammar.json" with { type: "json" }

try {
  const jscadSyntax = translate(openscadGrammar);
  // Convert to proper JSON format
  const jsonContent = {
    default: jscadSyntax,
    ...Object.fromEntries(
      Object.entries(jscadSyntax).map(([key, value]) => [
        key,
        typeof value === 'function' ? null : value
      ])
    )
  };
  const jscadSyntaxString = JSON.stringify(jsonContent, null, 2);
  fs.writeFileSync('../jscadSyntaxFromGrammar.json', jscadSyntaxString);
  console.log(jscadSyntax)
} catch (error) {
  console.error("Error processing grammar:", error);
}
