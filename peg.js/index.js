const fs = require('fs');
const peg = require('pegjs');


// Take the filename from the command line arguments
const filename = process.argv[2];
if (!filename) {
    console.error('No filename provided. Usage: node index.js <filename.scad>');
    process.exit(1);
}

const grammar = process.argv[3];

const pegGrammar = fs.readFileSync(grammar || 'openscad.pegjs', 'utf8');
const parser = peg.generate(pegGrammar);

try {
    const input = fs.readFileSync(filename, 'utf8');
    const ast = parser.parse(input);
//    console.log(JSON.stringify(ast, null, 2));
} catch (e) {
    console.error(`ERROR ${Object.prototype.toString.call(e)}`)
    if (e instanceof peg.SyntaxError) {
        const line = e.location.start.line;
        const lines = input.split('\n');
        console.error('Parsing Error on Line ' + line + ": ");
        console.error(lines[line - 1]);
    } else {
        throw e;
    }
}
