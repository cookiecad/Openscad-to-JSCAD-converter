import type { Tree, SyntaxNode as TreeSitterSyntaxNode } from 'tree-sitter'

type SyntaxNode = TreeSitterSyntaxNode & {
  isModuleChildren?: boolean
  outputCode?: string
}

export type { Tree, SyntaxNode }

export interface generatorSyntax {
  [key: string]: {
    open?: string
    close?: string
    separator?: string
    generator?: (node: any) => string
    children?: 'all' | Array<{ name: string, isText?: boolean } | { childIndex: number }>
  }
}
