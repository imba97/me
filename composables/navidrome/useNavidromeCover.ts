import { navidromeRequest } from './shared'

export default async function (id: string) {
  const cover = await navidromeRequest.blob('/getCoverArt.view', {
    id
  })

  if (!(cover instanceof Blob)) {
    return ''
  }

  return cover
}
