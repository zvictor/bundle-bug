import { Resource } from 'sst'
import { createTRPCClient, httpBatchLink } from '@trpc/client'

import type { AppRouter } from './routers/_app'

export default {
  async fetch(_req: Request) {
    const client = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: 'http://localhost/',
          async headers() {
            return {
              authorization: `Bearer thdcietahrWDheaSTsti`,
            }
          },
          fetch(req) {
            return Resource.Trpc.fetch(req)
          },
        }),
      ],
    })

    return new Response(
      await client.hello.hello.query('Patrick Star'),
      // (await client.hello.admin.secret.query()).secret,
    )
  },
}
