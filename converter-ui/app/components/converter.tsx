'use client'
// Converter.tsx
import { useState } from 'react'
import { parseOpenSCAD, printOpenSCADTree } from './parse-util'
import { Tabs, Tab, Card, CardBody, RadioGroup, Radio } from '@nextui-org/react'
// import TreeSitterWrapper, { Tree } from './TreeSitterWrapper';
import JsonViewer from './JsonViewer'

export default function Converter () {
  const [openscadCode, setOpenscadCode] = useState<string>('')
  const [outputCodeFormats, setOutputCodeFormats] = useState<{ [key: string]: string }>({})
  const [openscadTree, setOpenscadTree] = useState<string>('')
  const [tree, setTree] = useState<object | null>(null)
  const [selected, setSelected] = useState<string>('jscad')

  async function handleConvert (): Promise<void> {
    if (!openscadCode) {
      return
    }

    try {
      const language: 'jscad' | 'manifold' = selected === 'jscad' ? 'jscad' : 'manifold'
      const result = await parseOpenSCAD(openscadCode, language)
      // const openscadTree = await printOpenSCADTree(openscadCode);
      console.log('result', result)
      if (result.error != null) {
        throw result.error
      }
      if (!result.outputCode || !result.rootNode) { throw new Error('Failed to parse OpenSCAD code') }
      setOutputCodeFormats(result.formats)
      const treeObj = JSON.parse(result.rootNode)
      console.log('treeObj', treeObj)
      setTree(treeObj)
    } catch (error: any) {
      console.error(error)
      const message = `Error: ${error.message}`
      setOutputCodeFormats({
        Error: message
      })
      setOpenscadTree(message)

      if (error.data && error.data.tree) {
        const treeObj = JSON.parse(error.data.tree)
        setTree(treeObj)
      }
    }
  }

  return (
    <div className='flex flex-1 flex-col items-center w-full'>
      <textarea
        className='w-full h-64 p-4 mb-4 border border-gray-300 rounded max-w-5xl'
        placeholder='Enter OpenSCAD code...'
        value={openscadCode}
        onChange={(e) => setOpenscadCode(e.target.value)}
      />
      <div className='flex flex-col gap-3'>
        <RadioGroup
          label='Language'
          value={selected}
          onValueChange={setSelected}
        >
          <Radio value='jscad'>JScad</Radio>
          <Radio value='manifold'>Manifold</Radio>
        </RadioGroup>
        <p className='text-default-500 text-small'>Selected: {selected}</p>
      </div>
      <button className='px-4 py-2 text-white bg-blue-500 rounded' onClick={handleConvert}>
        Convert
      </button>

      <div className='flex flex-1 w-full flex-col max-w-5xl'>
        <Tabs aria-label='Conversion Results'>
          {Object.keys(outputCodeFormats).map((key) => (
            <Tab key={key} title={key} className='flex flex-1'>
              <Card className='flex flex-1'>
                <CardBody className='flex flex-1'>
                  <textarea
                    className='flex flex-1 whitespace-pre-wrap overflow-auto' readOnly
                    value={outputCodeFormats[key]}
                  />
                </CardBody>
              </Card>
            </Tab>
          ))}
          <Tab key='openscadTree' title='openscadTree' className='flex flex-1'>
            <Card className='flex flex-1'>
              <CardBody className='flex flex-1'>
                <textarea
                  className='flex flex-1 whitespace-pre-wrap overflow-auto' readOnly
                  value={openscadTree || 'openscadTree will be displayed here after conversion'}
                />
              </CardBody>
            </Card>
          </Tab>
          <Tab key='treeSitter' title='Tree-Sitter' className='flex flex-1'>
            <Card className='flex flex-1'>
              <CardBody className='flex flex-1'>
                {/* <TreeSitterWrapper tsDocument={tree} /> */}
                <JsonViewer data={tree} />
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </div>
  )
}
