import process from 'node:process'
import axios from 'axios'

let cache: MusicInfo | null = null

// 超时 10 秒
const axiosInstance = axios.create({
  timeout: 10000
})

interface Track {
  name: string
  artist: { '#text': string }
  albumCover?: string
  image: { 'size': string, '#text': string }[]
}

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

async function getItunesAlbumCover(songName: string, artistName: string): Promise<string> {
  const searchUrl = 'https://itunes.apple.com/search'
  const params = new URLSearchParams({
    term: `${songName} ${artistName}`,
    media: 'music',
    limit: '1'
  })

  const response = await axiosInstance.get(`${searchUrl}?${params.toString()}`)
  const results = response.data

  if (results.resultCount > 0) {
    let albumCoverUrl = results.results[0].artworkUrl100
    albumCoverUrl = albumCoverUrl.replace('100x100bb.jpg', '500x500bb.jpg')
    return albumCoverUrl
  }
  else {
    return ''
  }
}

export default defineEventHandler(async (): Promise<Result> => {
  if (cache) {
    return {
      success: true,
      data: cache
    }
  }

  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${process.env.LAST_API_USER}&api_key=${process.env.LAST_API_KEY}&format=json`
    const response = await axiosInstance.get(url)
    const first: Track = response.data.recenttracks.track[0]

    const itunesAlbumCover = await getItunesAlbumCover(first.name, first.artist['#text'])

    cache = {
      playing: _get(first, '@attr.nowplaying') === 'true',
      name: first.name,
      artist: first.artist['#text'],
      albumCover: itunesAlbumCover
    }

    // 没有的话拿 Last.fm 的
    if (itunesAlbumCover === '') {
      cache.albumCover = _get(_find(_get(first, 'image'), { size: 'extralarge' }), '#text')
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
