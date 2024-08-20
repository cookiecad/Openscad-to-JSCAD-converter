"use client"
// Converter.tsx
import { useState } from 'react';
import { parseOpenSCAD } from './parse-util';

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
    </div>
  );
}