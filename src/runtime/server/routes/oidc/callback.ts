import { defineEventHandler, getCookie, setCookie } from 'h3'
import { initClient } from '../../../utils/issueclient'
import { encrypt } from '../../../utils/encrypt'
import { useRuntimeConfig } from '#imports'
import { logger } from '../../../utils/logger'

export default defineEventHandler(async (event) => {
  logger.debug('[CALLBACK]: oidc/callback calling')
  const { op, config } = useRuntimeConfig().openidConnect
  const sessionid = getCookie(event, config.secret)
  const req = event.node.req
  const res = event.node.res
  const issueClient = await initClient(op, req)
  const params = issueClient.callbackParams(req)
  const callBackUrl = op.callbackUrl.replace('cbt', 'callback')

  if (params.access_token) {
    logger.debug('[CALLBACK]: has access_token in params')
    await getUserInfo(params.access_token)
  } else if (params.code) {
    logger.debug('[CALLBACK]: has code in params')
    const tokenSet = await issueClient.callback(callBackUrl, params, { nonce: sessionid })
    if (tokenSet.access_token) {
      await getUserInfo(tokenSet.access_token)
    }
  } else {
    logger.debug('[CALLBACK]: empty callback')
  }
  res.writeHead(302, { Location: '/' })
  res.end()

  async function getUserInfo(accessToken: string) {
    try {
      const userinfo = await issueClient.userinfo(accessToken)
      setCookie(event, config.cookiePrefix + 'access_token', accessToken, {
        maxAge: config.cookieMaxAge,
        ...config.cookieFlags['access_token' as keyof typeof config.cookieFlags]
      })
      const cookie = config.cookie
      for (const [key, value] of Object.entries(userinfo)) {
        if (cookie && Object.prototype.hasOwnProperty.call(cookie, key)) {
          setCookie(event, config.cookiePrefix + key, JSON.stringify(value), {
            maxAge: config.cookieMaxAge,
            ...config.cookieFlags[key as keyof typeof config.cookieFlags]
          })
        }
      }
      const encryptedText = await encrypt(JSON.stringify(userinfo), config)
      setCookie(event, config.cookiePrefix + 'user_info', encryptedText, { ...config.cookieFlags['user_info' as keyof typeof config.cookieFlags] })
    } catch (err) {
      logger.error("[CALLBACK]: " + err)
    }
  }
})
