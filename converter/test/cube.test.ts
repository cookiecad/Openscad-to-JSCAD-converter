import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Parser from 'tree-sitter'
import { generateTreeCode } from '../codeGeneration.js'
import { dumpNode } from '../nodeHelpers.js'
import OpenSCAD from 'tree-sitter-openscad'
import { countOf } from './test_utils.js'
import { describe, it } from 'mocha'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const files = [
  'cube.scad',
  '../../test-files/custom-honeycomb-wall-v2.1.scad',
  'function.scad'
]

const parseSCAD = (scadcode: string, dump = false): string => {
  // Load the OpenSCAD grammar
  const parser = new Parser()
  parser.setLanguage(OpenSCAD)

  // Parse the OpenSCAD code
  const tree = parser.parse(scadcode)

  // Traverse the syntax tree and generate JSCAD code
  const jscadcode = generateTreeCode(tree.rootNode, 'jscad').formats.jsCode; // code
  if (dump) {
    console.log('==================================================')
    console.log(dumpNode(tree.rootNode, 0))
    console.log('==================================================')
    console.log(jscadcode)
    console.log('==================================================')
  }
  return jscadcode
}

for (const file of files) {
  describe(`Testing ${file}`, function () { 
    const filepath = path.resolve(__dirname, file);
    const scadcode = fs.readFileSync(filepath, 'UTF8')

    console.log("Parsing SCAD code...");
    const jscadcode = parseSCAD(scadcode, false)

    // describe('parseSCAD()', function () {
    //   it('should convert to cuboid with appropriate options', function () {
    //     assert.equal(countOf('cuboid({size:', jscadcode), 9)
    //   })
    // })

    describe('Run the code', function() {
      it('should execute without throwing errors', async function() {
        // Try evaluating the generated code
          try {
            const tempFilePath = path.join(__dirname, 'tempCode.mjs');
            fs.writeFileSync(tempFilePath, jscadcode);

            try {
              const m = await import(`file://${tempFilePath}`);
              const result = m.main();
              // console.log("result", result);
            } catch (err) {
              assert.fail(`Exception thrown during execution: ${err.message}`);
            } finally {
              fs.unlinkSync(tempFilePath);
            }
          } catch (err) {
            // Log the error, code, and line number
            console.error('An error occurred while executing the code:');
            console.error(jscadcode); // Print the dynamic code
            console.error('Error message:', err.message);
            console.error('Stack trace:', err.stack); // Stack trace includes line number

            // You can add more sophisticated handling here if needed
            assert.fail(`Exception thrown during execution: ${err.message}`);
          }
            // },);
      })
    })
})
}

// describe('function() conversion', function () {
//   const filepath = path.resolve(__dirname, 'function.scad')
//   const scadcode = fs.readFileSync(filepath, 'UTF8')

//   const jscadcode = parseSCAD(scadcode, false)

//   describe('parseSCAD()', function () {
//     it('should convert functions with appropriate options', function () {
//       assert.equal(countOf('cuboid(', jscadcode), 1)
//     })
//   })
// })
