import debug from 'debug'
import Surreal, { RecordId } from 'surrealdb'

export { RecordId }

const log = debug('bug-report:surreal')

export const recordId = (...args: ConstructorParameters<typeof RecordId>) => new RecordId(...args)

export const useDB = async (
  opts: {
    username?: string
    password?: string
    namespace?: string
    database?: string
  } = {},
) => {
  const db = new Surreal()

  await db.connect(`http://localhost:8000/rpc`, { versionCheck: false })

  if (opts.database || opts.namespace) {
    log(`Using namespace '${opts.namespace}' and database '${opts.database}'`)
    await db.use({
      namespace: opts.namespace,
      database: opts.database,
    })
  }

  if (opts.username || opts.password) {
    log(`Using username '${opts.username}'`)
    if(!opts.username) throw new Error('Username needs to be defined when password is set')
    if(!opts.password) throw new Error('Password needs to be defined when username is set')

    await db.signin({
      username: opts.username,
      password: opts.password,
    })
  }

  return db
}
