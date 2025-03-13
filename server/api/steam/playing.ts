import type { UserPlayingGameResponse } from 'steam-playing-game'
import { getUserPlayingGame } from 'steam-playing-game'

export default defineEventHandler(async (): Promise<UserPlayingGameResponse> => {
  const runtimeConfig = useRuntimeConfig()

  let result: UserPlayingGameResponse

  try {
    result = await getUserPlayingGame(
      runtimeConfig.env.STEAM_API_KEY,
      runtimeConfig.env.STEAM_ID
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
