"use client"
// Converter.tsx
import { useState } from 'react';
import { parseOpenSCAD, printOpenSCADTree } from './parse-util';
import { Tabs, Tab, Card, CardBody } from "@nextui-org/react";
// import TreeSitterWrapper, { Tree } from './TreeSitterWrapper';
import JsonViewer from './JsonViewer';

export default function Converter() {
  const [code, setCode] = useState<string>('');
  const [jscad, setJscad] = useState<string>('');
  const [js, setJs] = useState<string>('');
  const [openscadTree, setOpenscadTree] = useState<string>('');
  const [cadit, setCadit] = useState<string>('');
  const [tree, setTree] = useState<object | null>(null);

  async function handleConvert(): Promise<void> {
    if (!code) {
      return;
    }

    try {
      const result = await parseOpenSCAD(code);
      // const openscadTree = await printOpenSCADTree(code);
      console.log("result", result);
      setJscad(result.jscad);
      setJs(result.js);
      let treeObj = JSON.parse(result.tree);
      console.log('treeObj', treeObj);
      setTree(treeObj);
      setCadit(result.cadit);
    } catch (error) {
      console.error('Error parsing OpenSCAD:', error);
      setJscad(`Error parsing OpenSCAD: ${error}`);
      setJs(`Error parsing OpenSCAD: ${error}`);
      setOpenscadTree(`Error parsing OpenSCAD: ${error}`);
      setCadit(`Error parsing OpenSCAD: ${error}`);
    }
  }

  return (
    <div className='flex flex-1 flex-col items-center w-full'>
      <textarea
        className='w-full h-64 p-4 mb-4 border border-gray-300 rounded max-w-5xl'
        placeholder='Enter OpenSCAD code...'
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button className='px-4 py-2 text-white bg-blue-500 rounded' onClick={handleConvert}>
        Convert
      </button>
      
      <div className="flex flex-1 w-full flex-col max-w-5xl">
        <Tabs aria-label="Conversion Results">
          <Tab key="jscad" title="JSCAD" className='flex flex-1'>
          <Card className='flex flex-1'>
            <CardBody className='flex flex-1'>
                <textarea className="flex flex-1 whitespace-pre-wrap overflow-auto" readOnly={true}
                  value={jscad || 'JSCAD code will be displayed here after conversion'}
                />
            </CardBody>
          </Card>  
        </Tab>
          <Tab key="js" title="JavaScript" className='flex flex-1'>
          <Card className='flex flex-1'>
            <CardBody className='flex flex-1'>
                <textarea className="flex flex-1 whitespace-pre-wrap overflow-auto" readOnly={true}
             value={js || 'JavaScript code will be displayed here after conversion'}
            />
            </CardBody>
          </Card>  
        </Tab>
          <Tab key="openscadTree" title="openscadTree" className='flex flex-1'>
          <Card className='flex flex-1'>
            <CardBody className='flex flex-1'>
                <textarea className="flex flex-1 whitespace-pre-wrap overflow-auto" readOnly={true}
             value={openscadTree || 'openscadTree will be displayed here after conversion'}
                />
              </CardBody>
            </Card>
          </Tab>
          <Tab key="cadit" title="CADIT" className='flex flex-1'>
          <Card className='flex flex-1'>
            <CardBody className='flex flex-1'>
                <textarea className="flex flex-1 whitespace-pre-wrap overflow-auto" readOnly={true}
              value={cadit || 'CADIT code will be displayed here after conversion'}
                />
              </CardBody>
            </Card>
          </Tab>
          <Tab key="treeSitter" title="Tree-Sitter" className='flex flex-1'>
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
  );
}