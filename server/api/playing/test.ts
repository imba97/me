import process from 'node:process'

export default defineEventHandler(async (): Promise<NodeJS.ProcessEnv> => {
  return process.env
})
