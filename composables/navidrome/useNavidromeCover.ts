import { Buffer } from 'node:buffer'

import { navidromeRequest } from './shared'

export default async function (id: string) {
  const cover = await navidromeRequest.arrayBuffer('/getCoverArt.view', {
    id
  })

  if (!(cover instanceof ArrayBuffer)) {
    return ''
  }

  return Buffer.from(cover)
}
