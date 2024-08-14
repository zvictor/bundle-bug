/// <reference path="./.sst/platform/config.d.ts" />

import fs from 'fs'
import { temporaryFile } from 'tempy'

export default $config({
  app(input) {
    return {
      name: 'bug-report',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'local',
      providers: {
        cloudflare: true,
      },
    }
  },
  async run() {
    const trpc = new sst.cloudflare.Worker('Trpc', {
      url: true,
      handler: 'server/server.ts',
      build: {
        esbuild: {
          plugins: [
            {
              name: 'ignore-ws',
              setup(build) {
                build.onResolve({ filter: /^isows$/ }, () => {
                  const path = temporaryFile({ extension: '.js' })
                  fs.writeFileSync(path, 'module.exports = globalThis')

                  return { path }
                })
              },
            },
          ],
        },
      },
    })

    const client = new sst.cloudflare.Worker('Client', {
      url: true,
      link: [trpc],
      handler: 'server/client.ts',
    })

    return {
      api: trpc.url,
      client: client.url,
    }
  },
})
