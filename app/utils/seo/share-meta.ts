const SITE_NAME = 'imba97'
const SITE_URL = 'https://imba97.me'

export const DEFAULT_FAVICON = '/favicon.png'

/**
 * 已知分享图的真实尺寸
 * unhead v3 校验要求 `og:image` 同时声明 width/height，否则社媒可能不展示图片
 */
const IMAGE_SIZES: Record<string, { width: number, height: number }> = {
  [DEFAULT_FAVICON]: { width: 300, height: 300 }
}

function toAbsoluteSiteUrl(input: string): string {
  if (/^https?:\/\//i.test(input))
    return input
  if (input.startsWith('//'))
    return `https:${input}`
  const normalized = input.startsWith('/') ? input : `/${input}`
  return new URL(normalized, SITE_URL).toString()
}

export interface ShareMetaInput {
  path: string
  frontmatter?: Record<string, unknown>
  defaultImage?: string
}

function getStringField(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/** 页面可通过 frontmatter.imageWidth / imageHeight 指定自定义分享图尺寸 */
function getImageSize(image: string, frontmatter?: Record<string, unknown>) {
  const width = Number(frontmatter?.imageWidth)
  const height = Number(frontmatter?.imageHeight)
  if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0)
    return { width, height }

  return IMAGE_SIZES[image]
}

export function createShareMeta(input: ShareMetaInput) {
  const title = getStringField(input.frontmatter?.title) || SITE_NAME
  const description = getStringField(input.frontmatter?.description) || SITE_NAME
  const defaultImage = getStringField(input.defaultImage) || DEFAULT_FAVICON
  const image = getStringField(input.frontmatter?.image) || defaultImage
  const absoluteImage = toAbsoluteSiteUrl(image)
  const imageSize = getImageSize(image, input.frontmatter)
  const pagePath = input.path || '/'

  return {
    title,
    description,
    image: absoluteImage,
    url: toAbsoluteSiteUrl(pagePath),
    siteName: SITE_NAME,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: absoluteImage },
      ...(imageSize
        ? [
            { property: 'og:image:width', content: String(imageSize.width) },
            { property: 'og:image:height', content: String(imageSize.height) }
          ]
        : []),
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: toAbsoluteSiteUrl(pagePath) },
      { property: 'og:site_name', content: SITE_NAME }
    ]
  }
}
