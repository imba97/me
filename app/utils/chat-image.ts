import type { ChatImage } from '~~/shared/ai/chat'

/** 把 ChatImage(base64 + mediaType) 拼成可作 `<img src>` 的 data URL。 */
export function chatImageToDataUrl(img: ChatImage): string {
  return `data:${img.mediaType};base64,${img.data}`
}
