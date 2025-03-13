export default defineEventHandler(async (event) => {
  const url = getRouterParam(event, 'url')!
  const decodedUrl = decodeURIComponent(url)
  const res = await fetch(decodedUrl, { headers: { referer: decodedUrl } })

  if (!res.ok) {
    throw createError({ statusCode: res.status, statusMessage: 'Failed to fetch image' })
  }

  const contentType = res.headers.get('content-type') || 'application/octet-stream'
  setResponseHeaders(event, { 'Content-Type': contentType })

  return res.body
})
