
import type { NextPageContext } from 'next/dist/next-server/lib/utils'
import Cookies from 'cookies'
import { v4 as uuidv4 } from 'uuid'

type Jsonlike = string | number | boolean | null | Jsonlike[] | { [key: string]: Jsonlike }

// imitates Express JS locals, which usually being used to pass down shared variables down the middleware chains
type ContextLocal = { [key: string]: Jsonlike }

// Middleware chain tuple
type MiddlewareChainableTuple = [NextPageContext, ContextLocal]

export type Middleware = (arg0: MiddlewareChainableTuple) => Promise<MiddlewareChainableTuple>

// imitating PHP cookie functionality
// instead of using express' req res type, we're using nodeJS native http req (IncomingMessage), res (ServerResponse).
// with the help of cookies and @types/cookies, it also uses native http req res.
export const phpSession: Middleware = async function ([context, locals]) {
  console.log('[middleware] going over php cookie setter')
  const PHPSESSID_COOKIE_KEY = 'PHPSESSID'
  const cookieConfig = {
    httpOnly: true
  }
  const thisLocals: Jsonlike = {}

  if (context.req && context.res) {
    const cookies = new Cookies(context.req, context.res)
    const PHPSESSID = cookies.get(PHPSESSID_COOKIE_KEY)
    if (PHPSESSID) {
      thisLocals.PHPSESSID = PHPSESSID
    } else {
      // imitates calling the get session API. we're using uuid v4 here for simplicity
      const newPHPSESSID = uuidv4()
      cookies.set(PHPSESSID_COOKIE_KEY, newPHPSESSID, cookieConfig)
      thisLocals.PHPSESSID = newPHPSESSID
    }
  }

  return [context, { ...locals, ...thisLocals }]
}

// imitating B2B cookie functionality
// instead of using express' req res type, we're using nodeJS native http req (IncomingMessage), res (ServerResponse).
// with the help of cookies and @types/cookies, it also uses native http req res.
export const b2bCookieSetter: Middleware = async function ([context, locals]) {
  console.log('[middleware] going over b2b cookie setter')
  const twhQuery = context.query?.twh
  const cookieConfig = {
    httpOnly: true
  }
  const thisLocals: Jsonlike = {}

  if (twhQuery && context.req && context.res) {
    const cookies = new Cookies(context.req, context.res)

    cookies.set('twh', String(twhQuery), cookieConfig)
    thisLocals.twh = twhQuery
  }

  return [context, { ...locals, ...thisLocals }]
}

// made-up middleware, for cases where you'll need to pass down variables the middleware chain
// imitating https://expressjs.com/en/5x/api.html#res.locals since locals does not exist in native http ServerResponse
export const b2bCookieConsumer: Middleware = async function ([context, locals]) {
  console.log('[middleware] going over b2b consumer')
  console.log('locals value: ', locals)
  return [context, locals]
}

export async function execMiddlewareChains(context: NextPageContext, registeredMiddlewares: Middleware[]): Promise<MiddlewareChainableTuple> {
  let overridableContext = context
  let overrideableLocals = {}
  for await (const middleware of registeredMiddlewares) {
    const [newContext, newLocals] = await middleware([overridableContext, overrideableLocals])
    overridableContext = newContext
    overrideableLocals = newLocals
  }

  return [overridableContext, overrideableLocals]
}