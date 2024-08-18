import useNavidromeData from '~/composables/navidrome/useNavidromeData'

let cache: MusicInfo | null = null

interface MusicInfo {
  playing: boolean
  name: string
  artist: string
  albumCover?: string
}

interface Result {
  success: boolean
  data?: MusicInfo
}

export default defineEventHandler(async (): Promise<Result> => {
  if (cache) {
    return {
      success: true,
      data: cache
    }
  }

  try {
    const navidromeData = await useNavidromeData()

    if (!navidromeData.success) {
      return navidromeData
    }

    cache = {
      playing: _get(navidromeData.data, 'playing', false),
      name: _get(navidromeData.data, 'title', ''),
      artist: _get(navidromeData.data, 'artist', ''),
      albumCover: _get(navidromeData.data, 'albumCover', '')
    }

    setTimeout(() => {
      cache = null
    }, 10000)

    return {
      success: true,
      data: cache
    }
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (error) {
    cache = null
    return {
      success: false
    }
  }
})
