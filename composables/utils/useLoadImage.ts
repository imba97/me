const imageBlobUrlMap = new Map<string, Promise<string>>()

export default async function useLoadImage(url: string, timeout = 5000): Promise<string> {
  if (imageBlobUrlMap.has(url)) {
    return imageBlobUrlMap.get(url)!
  }

  const blobUrl = new Promise<string>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'

    const timer = setTimeout(() => {
      reject(new Error('Image load timeout'))
    }, timeout)

    image.onload = () => {
      clearTimeout(timer)
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')!
      canvas.width = image.width
      canvas.height = image.height
      context.drawImage(image, 0, 0)
      canvas.toBlob((blob) => {
        const blobUrl = URL.createObjectURL(blob!)
        resolve(blobUrl)
      })
    }

    image.onerror = () => {
      clearTimeout(timer)
      reject(new Error('Image load error'))
    }

    image.src = url
  })

  imageBlobUrlMap.set(url, blobUrl)

  return blobUrl
}
