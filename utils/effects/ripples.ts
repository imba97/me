export function createRipples(svgId: string) {
  const canvas = document.getElementById(svgId) as HTMLCanvasElement
  const ctx = canvas.getContext('2d')!

  // canvas 等于浏览器窗口大小
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  let animationId: number
  let generateRipplesActive = true

  const width = canvas.width
  const height = canvas.height

  interface Ripple {
    x: number
    y: number
    radius: number
    alpha: number
    color: string
  }

  let ripples: Ripple[] = []

  function getRandomPosition() {
    const x = Math.random() * width
    const y = Math.random() * height
    return { x, y }
  }

  function drawRipple(ripple: Ripple) {
    ctx.beginPath()
    ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${ripple.color}, ${ripple.alpha})`
    ctx.fill()
  }

  function generateRipples() {
    const randomCount = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < randomCount; i++) {
      const { x, y } = getRandomPosition()
      const color = Math.random() > 0.5 ? '16, 98, 175' : '120, 40, 190'
      ripples.push({
        x,
        y,
        radius: 0,
        alpha: 0.5,
        color
      })
    }
  }

  let lastRippleTime = 0

  function animate(time: number) {
    ctx.clearRect(0, 0, width, height)
    ripples = ripples.filter((ripple) => {
      drawRipple(ripple)
      ripple.radius += 1
      ripple.alpha -= 0.005
      return ripple.alpha > 0
    })

    // Generate ripples every 1000ms
    if (generateRipplesActive && time - lastRippleTime > 1000) {
      generateRipples()
      lastRippleTime = time
    }

    animationId = requestAnimationFrame(animate)
  }

  animationId = requestAnimationFrame(animate)

  function stop() {
    cancelAnimationFrame(animationId)
    generateRipplesActive = false
    ctx.clearRect(0, 0, width, height)
  }

  return stop
}
