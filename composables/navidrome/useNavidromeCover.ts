import sharp from 'sharp'
import { navidromeRequest } from './shared'

export default async function (id: string) {
  const cover = await navidromeRequest.blob('/getCoverArt.view', {
    id
  })

  if (!(cover instanceof Blob)) {
    return ''
  }

  // TODO: 待测试
  return sharp(await cover.arrayBuffer()).resize(300, 300).toBuffer()
}
