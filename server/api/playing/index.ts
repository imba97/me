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

export default cachedEventHandler(async (): Promise<Result> => {
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

    return {
      success: true,
      data: result
    }
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (error) {
    await useStorage('cache').remove('navidrome:getPlaying:playing.json')
    return {
      success: false
    }
  }
}, {
  group: 'navidrome',
  name: 'getPlaying',
  maxAge: 30,
  getKey: () => 'playing'
})
