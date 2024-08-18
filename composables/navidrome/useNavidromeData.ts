import { axiosInstance, commonOptions, mergeOptions } from './shared'

export default async function () {
  let currentMusic
  let playing = true

  currentMusic = await getPlaying()

  if (!currentMusic) {
    currentMusic = await getHistory()
    playing = false
  }

  if (!currentMusic) {
    return {
      success: false
    }
  }

  return {
    success: true,
    data: {
      ...currentMusic,
      playing,
      albumCover: `/api/navidrome/album-cover/${currentMusic.coverArt}`
    }
  }
}

async function getHistory() {
  return await axiosInstance.post('/getAlbumList.view', null, mergeOptions({
    params: {
      type: 'recent',
      size: 1
    }
  }))
    .then(res => _get(res.data, 'subsonic-response.albumList.album.0', []))
}

async function getPlaying() {
  return await axiosInstance.post('/getNowPlaying.view', null, commonOptions)
    .then(res => _get(res.data, 'subsonic-response.nowPlaying.entry.0', null))
}
