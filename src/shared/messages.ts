export type Message =
  | { type: 'GET_POST_MARKDOWN' }

export type GetPostMarkdownResponse = {
  markdown: string
  error?: string
}
