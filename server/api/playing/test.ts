import { axiosInfo } from '~/composables/navidrome/shared'

export default defineEventHandler(async () => {
  return await axiosInfo.instance.post('/getNowPlaying.view', null, axiosInfo.commonOptions)
    .then(res => _get(res.data, 'subsonic-response.nowPlaying.entry.0', null))
})
