import axios, { type AxiosRequestConfig } from 'axios'
import defu from 'defu'

const runtimeConfig = useRuntimeConfig()

export const commonOptions = {
  params: {
    u: runtimeConfig.env.NAVIDROME_USERNAME,
    p: runtimeConfig.env.NAVIDROME_PASSWORD,
    v: '1.16.1',
    c: 'my-client',
    f: 'json'
  }
}

export const axiosInstance = axios.create({
  baseURL: runtimeConfig.env.NAVIDROME_API_URL
})

export function mergeOptions(...options: AxiosRequestConfig[]) {
  return defu(commonOptions, ...options)
}
