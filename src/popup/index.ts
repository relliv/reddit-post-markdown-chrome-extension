import type { GetPostMarkdownResponse, Message } from '../shared/messages'

const button = document.getElementById('copy') as HTMLButtonElement
const status = document.getElementById('status') as HTMLParagraphElement

button.addEventListener('click', async () => {
  status.textContent = ''
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) {
    status.textContent = 'No active tab.'
    return
  }

  const message: Message = { type: 'GET_POST_MARKDOWN' }
  const response = await chrome.tabs
    .sendMessage<Message, GetPostMarkdownResponse>(tab.id, message)
    .catch(() => null)

  if (!response) {
    status.textContent = 'Open a Reddit post and try again.'
    return
  }

  if (response.error) {
    status.textContent = response.error
    return
  }

  await navigator.clipboard.writeText(response.markdown)
  status.textContent = 'Copied to clipboard.'
})
