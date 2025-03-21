const imageBlobUrlMap = new Map<string, Promise<string>>()

export default async function useLoadImage(url: string, timeout = 5000): Promise<string> {
  if (imageBlobUrlMap.has(url)) {
    return imageBlobUrlMap.get(url)!
  }

  const blobUrl = new Promise<string>((resolve, reject) => {
    const controller = new AbortController()
    const signal = controller.signal

    const timer = setTimeout(() => {
      controller.abort()
      reject(new Error('Image load timeout'))
    }, timeout)

    fetch(url, { signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Image load error')
        }
        return response.blob()
      })
      .then((blob) => {
        clearTimeout(timer)
        const blobUrl = URL.createObjectURL(blob)
        resolve(blobUrl)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })

  imageBlobUrlMap.set(url, blobUrl)

  return blobUrl
}
