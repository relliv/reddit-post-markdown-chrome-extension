import type { CommentNode } from './extract'

export type TreeNode = {
  comment: CommentNode
  children: TreeNode[]
}

export function buildTree(flat: CommentNode[]): TreeNode[] {
  const byId = new Map<string, TreeNode>()
  const roots: TreeNode[] = []

  for (const c of flat) {
    const node: TreeNode = { comment: c, children: [] }
    byId.set(c.id, node)

    const parent = c.parentId && c.parentId !== c.id ? byId.get(c.parentId) : undefined
    if (parent && c.depth > 0) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}
