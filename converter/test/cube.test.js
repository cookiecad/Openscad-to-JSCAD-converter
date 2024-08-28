import assert from 'assert'

import fs from 'fs'
import path from 'path'

import Parser from 'tree-sitter'

import { generateTreeCode } from '../codeGeneration.js'
import { dumpNode } from '../nodeHelpers.js'
import OpenSCAD from 'tree-sitter-openscad'

import { countOf } from './test_utils.js'

const parseSCAD = (scadcode, dump = false) => {
  // Load the OpenSCAD grammar
  const parser = new Parser()
  parser.setLanguage(OpenSCAD)

  // Parse the OpenSCAD code
  const tree = parser.parse(scadcode)

  // Traverse the syntax tree and generate JSCAD code
  const jscadcode = generateTreeCode(tree.rootNode).code;
  if (dump) {
    console.log('==================================================')
    console.log(dumpNode(tree.rootNode, 0))
    console.log('==================================================')
    console.log(jscadcode)
    console.log('==================================================')
  }
  return jscadcode
}

describe('cube() conversion', function () {
  const filepath = path.resolve('./test', 'cube.scad')
  const scadcode = fs.readFileSync(filepath, 'UTF8')

  const jscadcode = parseSCAD(scadcode, false)

  describe('parseSCAD()', function () {
    it('should convert to cuboid with appropriate options', function () {
      assert.equal(countOf('cuboid({size:', jscadcode), 9)
    })
  })
})
