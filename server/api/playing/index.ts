import useNavidromeData from '~/composables/navidrome/useNavidromeData'

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
  const kv = hubKV()
  const hasCache = await kv.has('playing')

  if (hasCache) {
    const data = (await kv.get<MusicInfo>('playing'))!
    return {
      success: true,
      data
    }
  }

  try {
    const navidromeData = await useNavidromeData()

    if (!navidromeData.success) {
      return navidromeData
    }

    const result: MusicInfo = {
      playing: _get(navidromeData.data, 'playing', false),
      name: _get(navidromeData.data, 'title', ''),
      artist: _get(navidromeData.data, 'artist', ''),
      albumCover: _get(navidromeData.data, 'albumCover', '')
    }

    kv.set('playing', result, {
      ttl: 10
    })

    return {
      success: true,
      data: result
    }
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (error) {
    kv.del('playing')
    return {
      success: false
    }
  }
})
