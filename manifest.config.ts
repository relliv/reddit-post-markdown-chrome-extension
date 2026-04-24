import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json' with { type: 'json' }

export default defineManifest({
  manifest_version: 3,
  name: 'Reddit Post Markdown',
  description: 'Copy Reddit posts as Markdown.',
  version: pkg.version,
  action: {
    default_popup: 'src/popup/index.html',
    default_title: 'Reddit Post Markdown',
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['*://*.reddit.com/*'],
      js: ['src/content/index.ts'],
      run_at: 'document_idle',
    },
  ],
  permissions: ['activeTab', 'clipboardWrite', 'storage'],
})
