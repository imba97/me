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
      albumCover: `/api/navidrome/album-cover/${currentMusic.id}`
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

      // 选出播放时间最新的一首；没有 played 记录的按 0 处理，_maxBy 平局取靠前
      return _maxBy(songs, (song: any) =>
        _has(song, 'played') ? new Date(song.played).getTime() : 0)
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
