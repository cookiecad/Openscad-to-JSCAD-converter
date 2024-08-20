"use server"
import { parseOpenSCADFormats } from 'converter'

export async function parseOpenSCAD(code: string) {
  // let { parseOpenSCADFormats } = await import('converter')

  return parseOpenSCADFormats(code, '')
}