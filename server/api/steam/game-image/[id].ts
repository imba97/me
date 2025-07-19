export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!

  try {
    // Steam 游戏头图 URL 格式
    const steamImageUrl = `https://steamcdn-a.akamaihd.net/steam/apps/${id}/header.jpg`

    // 获取图片
    const response = await fetch(steamImageUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }

    // 获取图片 blob
    const imageBlob = await response.blob()

    // 设置响应头
    setHeader(event, 'Content-Type', imageBlob.type || 'image/jpeg')
    setHeader(event, 'Cache-Control', 'public, max-age=86400')

    return imageBlob
  }
  catch {
    // 如果获取失败，返回 404
    throw createError({
      statusCode: 404,
      statusMessage: 'Game image not found'
    })
  }
})
