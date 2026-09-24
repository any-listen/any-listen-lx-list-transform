import path from 'node:path'

import type { ExtensionConfig } from '@any-listen/extension-kit/config'

import pkg from './package.json' with { type: 'json' }

const config: ExtensionConfig = {
  id: 'lx-list-transform',
  name: 'LX Music List Transform',
  description: '{description}',
  version: pkg.version,
  homepage: pkg.homepage,
  license: pkg.license,
  target_engine: '1.4.0',
  readme: path.join(import.meta.dirname, 'README.md'),
  categories: [],
  tags: [],
  download_url_template: 'https://github.com/any-listen/any-listen-extension-lx-list-transform/releases/download/v{version}',
  icon: './resources/icon.png',
  contributes: {
    commands: [
      {
        command: 'listTransform',
        name: '{list_transform}',
        description: '{list_transform_description}',
      },
    ],
  },
}

export default config
