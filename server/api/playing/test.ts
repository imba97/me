import { axiosInfo } from '~/composables/navidrome/shared'

export default defineEventHandler(async () => {
  return {
    version: '1',
    env: axiosInfo.testEnv
  }
})
