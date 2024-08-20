// Home.tsx
import dynamic from 'next/dynamic';
import React from 'react';

const Converter = dynamic(() => import('./components/converter'), { ssr: false });

export default function Home(): JSX.Element {
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <h1 className='text-4xl font-bold'>OpenSCAD to JSCAD Converter</h1>
      <Converter />
    </main>
  );
}