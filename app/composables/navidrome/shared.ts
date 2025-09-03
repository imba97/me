import defu from 'defu'

const runtimeConfig = useRuntimeConfig()

export const navidromeRequest = {
  baseURL: runtimeConfig.navidromeApiUrl,

  commonOptions: {
    u: runtimeConfig.navidromeUsername,
    p: runtimeConfig.navidromePassword,
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
