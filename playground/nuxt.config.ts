
export default defineNuxtConfig({
  app: {
    head: {
      title: 'OIDC',
      link: [
        {
          rel: 'stylesheet',
          href: 'https://unpkg.com/@picocss/pico@latest/css/pico.min.css'
        }
      ]
    }
  },

  modules: [
    'nuxt-openid-connect'
  ],

  runtimeConfig: {
    openidConnect: {
      op: {
        issuer: '',
        clientId: '',
        clientSecret: '',
        callbackUrl: ''
      },
      config: {
        cookieFlags: {
          access_token: {
            httpOnly: true,
            secure: false
          }
        }
      }
    }
  },

  openidConnect: {
    addPlugin: true,
    op: {
      issuer: 'your_issuer_value',
      clientId: 'clientid',
      clientSecret: 'secret',
      callbackUrl: '',
      scope: [
        'openid',
        'email',
        'profile',
        // 'address'
      ]
    },
    config: {
      debug: true,
      response_type: 'code',
      secret: 'oidc._sessionid',
      cookie: { loginName: '' },
      cookiePrefix: 'oidc._',
      cookieEncrypt: true,
      cookieEncryptKey: 'bfnuxt9c2470cb477d907b1e0917oidc',
      cookieEncryptIV: 'ab83667c72eec9e4',
      cookieEncryptALGO: 'aes-256-cbc',
      cookieMaxAge: 24 * 60 * 60, //  default one day
      cookieFlags: {
        access_token: {
          httpOnly: true,
          secure: false
        }
      }
    }
  }
})
