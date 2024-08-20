// @ts-check
import fs from 'fs'
import path from 'path'
import { parseOpenSCAD, parseOpenSCADFormats, printOpenSCADTree } from './index.js'
import dedent from 'dedent'

// Read the OpenSCAD file
// Take the filename from the command line arguments
const filename = process.argv[2]
if (!filename) {
  console.error('No filename provided. Usage: node cli.js <filename.scad> <output folder>?')
  process.exit(1)
}

const outputFolder = process.argv[3] || './output'
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true })
}

const code = fs.readFileSync(filename, 'utf8')

// Parse the OpenSCAD code and generate formats
parseOpenSCAD(code)
  .then(async jscadCode => {
    console.log('JSCAD code ---------------:')
    console.log(jscadCode)

    const formats = await parseOpenSCADFormats(code, outputFolder)

    // Write the output JSCAD code and formats to files
    const outputJscadFilename = path.join(outputFolder, 'output.jscad')
    const outputJsFilename = path.join(outputFolder, 'output.js')
    const outputCaditJsFilename = path.join(outputFolder, 'output-cadit.js')

    fs.writeFileSync(outputJscadFilename, formats.jscad)
    fs.writeFileSync(outputJsFilename, formats.js)
    fs.writeFileSync(outputCaditJsFilename, formats.cadit)
  })
  .catch(error => {
    console.error('Failed to parse OpenSCAD code:', error)
  })

// Output the tree of node types to a file with each node on a separate line indented by its depth
const openscadTreeFilename = path.join(outputFolder, 'openscadTree.txt')
const treeRepresentation = printOpenSCADTree(code)
fs.writeFileSync(openscadTreeFilename, treeRepresentation)