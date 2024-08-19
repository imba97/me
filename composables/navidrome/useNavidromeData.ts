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
  const recent = await axiosInstance.post('/getAlbumList.view', null, mergeOptions({
    params: {
      type: 'recent',
      size: 1
    }
  }))
    .then(res => _get(res.data, 'subsonic-response.albumList.album.0'))

  if (!recent) {
    return
  }

  return getAlbum(recent.id)
    .then((songs) => {
      if (songs.length === 0) {
        return
      }

      // 获取最新
      let recentMusic: any
      let recentTime = 0

      // 最近播放
      _forEach(songs, (song) => {
        if (!recentMusic) {
          recentMusic = song
          return
        }

        if (!_has(song, 'played')) {
          return
        }

        const currentSongPlayed = new Date(song.played).getTime()

        if (currentSongPlayed > recentTime) {
          recentMusic = song
          recentTime = currentSongPlayed
        }
      })

      return recentMusic
    })
}

async function getPlaying() {
  return await axiosInstance.post('/getNowPlaying.view', null, commonOptions)
    .then(res => _get(res.data, 'subsonic-response.nowPlaying.entry.0', null))
}

async function getAlbum(id: string) {
  return await axiosInstance.post('/getAlbum.view', null, mergeOptions({
    params: {
      id
    }
  }))
    .then(res => _get(res.data, 'subsonic-response.album.song', []))
}
