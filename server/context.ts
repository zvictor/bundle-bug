import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'

export async function createContext(opts?: FetchCreateContextFnOptions) {
  // Create your context based on the request object
  // Will be available as `ctx` in all your resolvers

  // TODO! Properly get user from header
  // https://trpc.io/docs/server/authorization#create-context-from-request-headers
  // https://github.com/trpc/examples-kitchen-sink/blob/main/src/server/trpc/context.ts
  async function getUserFromHeader() {
    if (opts?.req.headers.authorization) {
      // return await decodeAndVerifyJwtToken(opts.req.headers.authorization.split(' ')[1])
      return opts.req.headers.authorization === `thdcietahrWDheaSTsti`
    }

    return null
  }

  const user = await getUserFromHeader()

  return {
    user,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
