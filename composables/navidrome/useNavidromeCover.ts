import { Buffer } from 'node:buffer'

import { axiosInstance, mergeOptions } from './shared'

export default async function (id: string) {
  const cover = await axiosInstance.post('/getCoverArt.view', null, mergeOptions({
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
