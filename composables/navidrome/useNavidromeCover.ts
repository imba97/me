import { Buffer } from 'node:buffer'

import { axiosInfo, mergeOptions } from './shared'

export default async function (id: string) {
  const cover = await axiosInfo.instance.post('/getCoverArt.view', null, mergeOptions({
    params: {
      id
    },
    responseType: 'arraybuffer'
  }))

  if (!(cover.data instanceof Buffer)) {
    return ''
  }

  return cover.data
}
