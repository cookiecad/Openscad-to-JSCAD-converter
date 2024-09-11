// Home.tsx
import dynamic from 'next/dynamic'
import React from 'react'

const Converter = dynamic(async () => await import('./components/converter'), { ssr: false })

export default function Home (): JSX.Element {
  return (
    <main className='flex flex-col min-h-screen items-center'>
      <h1 className='text-4xl font-bold'>OpenSCAD to JSCAD Converter</h1>
      <Converter />
    </main>
  )
}
