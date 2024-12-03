import sharp from 'sharp'
import { navidromeRequest } from './shared'

export default async function (id: string) {
  const cover = await navidromeRequest.blob('/getCoverArt.view', {
    id,
    size: 300
  })

  if (!(cover instanceof Blob)) {
    return ''
  }

  const buffer = await cover.arrayBuffer()

  const compressed = sharp(buffer).webp({
    quality: 50,
    effort: 6
  }).toBuffer()

  return compressed
}
