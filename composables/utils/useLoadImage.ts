export default async function useLoadImage(url: string, timeout = 5000): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const image = new Image()

    const timer = setTimeout(() => {
      reject(new Error('Image load timeout'))
    }, timeout)

    image.onload = () => {
      clearTimeout(timer)
      resolve(true)
    }

    image.onerror = () => {
      clearTimeout(timer)
      reject(new Error('Image load error'))
    }

    image.src = url
  })
}
