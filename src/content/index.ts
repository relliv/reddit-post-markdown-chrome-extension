import type { GetPostMarkdownResponse, Message } from '../shared/messages'
import { extractPost, extractComments } from './extract'
import { buildTree } from './tree'
import { renderMarkdown } from './render'

chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  if (message.type === 'GET_POST_MARKDOWN') {
    sendResponse(buildResponse())
    return true
  }
  return false
})

function buildResponse(): GetPostMarkdownResponse {
  const post = extractPost()
  if (!post) return { markdown: '', error: 'Not a Reddit post page.' }

  const tree = buildTree(extractComments())
  return { markdown: renderMarkdown(post, tree) }
}
