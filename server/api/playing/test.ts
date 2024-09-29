import process from 'node:process'

export default defineEventHandler(async () => {
  return {
    NAVIDROME_API_URL: process.env.NAVIDROME_API_URL,
    types: {
      NAVIDROME_API_URL: typeof process.env.NAVIDROME_API_URL
    },
    env: process.env,
    envKeys: Object.keys(process.env)
  }
})
