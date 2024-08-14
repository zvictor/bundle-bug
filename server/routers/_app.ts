import { router } from '../trpc'
import hello from './hello'
import surreal from './surreal'

export const appRouter = router({
  hello, // put procedures under "hello" namespace
  surreal, // put procedures under "surreal" namespace
})

export type AppRouter = typeof appRouter
