import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { createContext } from './context'
import { appRouter, AppRouter } from './routers/_app'

export default {
  async fetch(request: Request): Promise<Response> {
    return fetchRequestHandler({
      router: appRouter,
      req: request,
      endpoint: '/',
      createContext,
    })
  },
}
