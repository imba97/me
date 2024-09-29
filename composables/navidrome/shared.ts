import process from 'node:process'

import axios, { type AxiosRequestConfig } from 'axios'
import defu from 'defu'

export const commonOptions = {
  params: {
    u: process.env.NUXT_NAVIDROME_USERNAME,
    p: process.env.NUXT_NAVIDROME_PASSWORD,
    v: '1.16.1',
    c: 'my-client',
    f: 'json'
  }
}

export const axiosInstance = axios.create({
  baseURL: process.env.NUXT_NAVIDROME_API_URL
})

export function mergeOptions(...options: AxiosRequestConfig[]) {
  return defu(commonOptions, ...options)
}
