import defu from 'defu'

const runtimeConfig = useRuntimeConfig()

export const navidromeRequest = {
  baseURL: runtimeConfig.env.NAVIDROME_API_URL,

  commonOptions: {
    u: runtimeConfig.env.NAVIDROME_USERNAME,
    p: runtimeConfig.env.NAVIDROME_PASSWORD,
    v: '1.16.1',
    c: 'my-client',
    f: 'json'
  },

  async get(url: string, params: Record<string, any> = {}) {
    const queryString = new URLSearchParams(defu(this.commonOptions, params)).toString()
    const response = await fetch(`${this.baseURL}${url}?${queryString}`, {
      method: 'GET'
    })

    return response.json()
  },

  async blob(url: string, params: Record<string, any> = {}) {
    const queryString = new URLSearchParams(defu(this.commonOptions, params)).toString()
    const response = await fetch(`${this.baseURL}${url}?${queryString}`, {
      method: 'GET'
    })

    return response.blob()
  }
}
