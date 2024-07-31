import process from 'node:process'
import axios from 'axios'

// 超时 10 秒
const axiosInstance = axios.create({
  timeout: 10000,
})

interface Track {
  name: string
  artist: { '#text': string }
  albumCover?: string
}

async function getItunesAlbumCover(songName: string, artistName: string): Promise<string> {
  const searchUrl = 'https://itunes.apple.com/search'
  const params = new URLSearchParams({
    term: `${songName} ${artistName}`,
    media: 'music',
    limit: '1',
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

export default defineEventHandler(async () => {
  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${process.env.LAST_API_USER}&api_key=${process.env.LAST_API_KEY}&format=json`
    const response = await axios.get(url)
    const first: Track = response.data.recenttracks.track[0]

    const albumCoverUrl = await getItunesAlbumCover(first.name, first.artist['#text'])
    first.albumCover = albumCoverUrl

    return first
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (error) {
    return { error: '获取数据时出错' }
  }
})
