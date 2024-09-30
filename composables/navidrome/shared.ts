import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import defu from 'defu'

let axiosInstance: AxiosInstance | null = null

export const axiosInfo = {
  get commonOptions() {
    const runtimeConfig = useRuntimeConfig()

    return {
      params: {
        u: runtimeConfig.env.NAVIDROME_USERNAME,
        p: runtimeConfig.env.NAVIDROME_PASSWORD,
        v: '1.16.1',
        c: 'my-client',
        f: 'json'
      }
    }
  },

  get instance() {
    if (axiosInstance) {
      return axiosInstance
    }

    const runtimeConfig = useRuntimeConfig()

    axiosInstance = axios.create({
      baseURL: runtimeConfig.env.NAVIDROME_API_URL
    })

    return axiosInstance
  },

  get testEnv() {
    const runtimeConfig = useRuntimeConfig()

    return {
      ...runtimeConfig.env
    }
  }
}

export function mergeOptions(...options: AxiosRequestConfig[]) {
  return defu(axiosInfo.commonOptions, ...options)
}
