import { z } from 'zod'
import { protectedProcedure, publicProcedure, router } from '../trpc'

export default router({
  // this is accessible for everyone
  hello: publicProcedure
    .input(z.string().nullish())
    .query((opts) => `hello ${opts.input ?? opts.ctx.user?.name ?? 'world'}`),
  admin: router({
    // this is accessible only to admins
    secret: protectedProcedure.query((opts) => {
      return {
        secret: 'sauce',
      }
    }),
  }),
})
