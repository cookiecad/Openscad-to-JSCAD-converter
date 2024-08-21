"use client"
// Converter.tsx
import { useState } from 'react';
import { parseOpenSCAD } from './parse-util';
import {Tabs, Tab, Card, CardBody} from "@nextui-org/react";

export default function Converter() {
  const [code, setCode] = useState<string>('');

  function handleConvert(): void {
    if (!code) {
      return;
    }

    parseOpenSCAD(code).then((result) => {
      console.log(result);
    });
  }

  return (
    <div className='flex flex-col items-center w-full'>
      <textarea
        className='w-full h-64 p-4 mb-4 border border-gray-300 rounded max-w-5xl'
        placeholder='Enter OpenSCAD code...'
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button className='px-4 py-2 text-white bg-blue-500 rounded' onClick={handleConvert}>
        Convert
      </button>
      

    <div className="flex w-full flex-col">
      <Tabs aria-label="Options">
        <Tab key="photos" title="Photos">
          <Card>
            <CardBody>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </CardBody>
          </Card>  
        </Tab>
        <Tab key="music" title="Music">
          <Card>
            <CardBody>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </CardBody>
          </Card>  
        </Tab>
        <Tab key="videos" title="Videos">
          <Card>
            <CardBody>
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </CardBody>
          </Card>  
        </Tab>
      </Tabs>
    </div>  
  );

    </div>
  );
}