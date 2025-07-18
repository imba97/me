import type { UserPlayingGameResponse } from 'steam-playing-game'
import { getUserPlayingGame } from 'steam-playing-game'

export default defineEventHandler(async (): Promise<UserPlayingGameResponse> => {
  const runtimeConfig = useRuntimeConfig()

  let result: UserPlayingGameResponse

  try {
    result = await getUserPlayingGame(
      runtimeConfig.steamApiKey,
      runtimeConfig.public.steamId
    )
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (e) {
    result = {
      playing: false
    }
  }

  return result
})
