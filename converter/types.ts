import type { Tree, SyntaxNode as TreeSitterSyntaxNode } from 'tree-sitter'

export type SyntaxNode = TreeSitterSyntaxNode & {
  isModuleChildren?: boolean
  outputCode?: string
}

export interface generatorSyntax {
  [key: string]: {
    open?: string
    close?: string
    separator?: string
    generator?: (node: any) => string
    children?: 'all' | Array<{ name: string, isText?: boolean, childIndex?: number, optional?: boolean }>  
  }
}

export type { Tree }
