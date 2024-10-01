import { navidromeRequest } from './shared'

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
  const recent = await navidromeRequest.get('/getAlbumList.view', {
    type: 'recent',
    size: 1
  })
    .then(res => _get(res, 'subsonic-response.albumList.album.0'))

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
  return await navidromeRequest.get('/getNowPlaying.view')
    .then(res => _get(res, 'subsonic-response.nowPlaying.entry.0', null))
}

async function getAlbum(id: string) {
  return await navidromeRequest.get('/getAlbum.view', {
    id
  })
    .then(res => _get(res, 'subsonic-response.album.song', []))
}
