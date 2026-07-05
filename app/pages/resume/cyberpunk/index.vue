<template>
  <div
    class="dark" size-full of-hidden bg-slate-950
    pointer-events-none
    @contextmenu.prevent
  >
    <canvas ref="bgCanvas" size-full block />
  </div>
</template>

<script lang="ts" setup>
const bgCanvas = ref<HTMLCanvasElement | null>(null)

// 4x4 网格 mask 中取一块作为重复平铺图案
const GRID_SIZE = 4

// 赛博朋克调色板
const CYBER_COLORS = [
  '#1062af',
  '#7828be',
  '#6f75ed',
  '#54eff4',
  '#3c5fff',
  '#cd5abe',
  '#ff17f9',
  '#8a68e8',
  '#04ff03',
  '#f11f9a',
  '#f7baff',
  '#00aeec',
  '#33a474',
  '#d92e3b',
  '#9545f0',
  '#f8f005'
]

function pickCell(): { col: number, row: number, src: string } {
  const row = _random(1, GRID_SIZE)
  const col = _random(1, GRID_SIZE)
  const src = Math.random() > 0.5
    ? '/masks/background-1.png'
    : '/masks/background-2.png'
  return { col, row, src }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

let stopAnimation: (() => void) | null = null

onMounted(() => {
  console.warn('[cyberpunk] onMounted, bgCanvas=', bgCanvas.value)
  start()
})

onBeforeUnmount(() => {
  stopAnimation?.()
})

async function start() {
  const canvas = bgCanvas.value
  console.warn('[cyberpunk] start, canvas=', canvas, 'tagName=', canvas?.tagName)
  if (!canvas) {
    return
  }

  // 选定的格子 + 来源
  const cell = pickCell()
  console.warn('[cyberpunk] cell=', cell)
  const tileImg = await loadImage(cell.src)
  console.warn('[cyberpunk] loaded img, size=', tileImg.naturalWidth, 'x', tileImg.naturalHeight)

  // 该格子在源图中的像素范围
  const sourceW = tileImg.naturalWidth
  const sourceH = tileImg.naturalHeight
  const cellPixelW = sourceW / GRID_SIZE
  const cellPixelH = sourceH / GRID_SIZE
  const sx = (cell.col - 1) * cellPixelW
  const sy = (cell.row - 1) * cellPixelH

  // 把选中的格子画到离屏 canvas
  // mask 用 alpha 通道编码形状，黑色 RGB，alpha 越大越亮（白色）
  const maskTile = document.createElement('canvas')
  maskTile.width = cellPixelW
  maskTile.height = cellPixelH
  const maskCtx = maskTile.getContext('2d')!
  maskCtx.drawImage(tileImg, sx, sy, cellPixelW, cellPixelH, 0, 0, cellPixelW, cellPixelH)

  const ctx = canvas.getContext('2d')!
  let width = window.innerWidth
  let height = window.innerHeight
  let dpr = window.devicePixelRatio || 1

  let tintColor = CYBER_COLORS[_random(0, CYBER_COLORS.length - 1)]!

  let jitter: { y: number, h: number, offset: number, colorShift: boolean } | null = null
  let nextJitterAt = performance.now() + _random(200, 1200)

  const colorCanvas = document.createElement('canvas')
  const stable = document.createElement('canvas')

  function resize() {
    if (!bgCanvas.value) {
      return
    }
    width = window.innerWidth
    height = window.innerHeight
    dpr = window.devicePixelRatio || 1
    bgCanvas.value.width = width * dpr
    bgCanvas.value.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    colorCanvas.width = width
    colorCanvas.height = height
    stable.width = width
    stable.height = height
  }

  resize()

  const onResize = () => resize()
  window.addEventListener('resize', onResize)

  // 平铺大小
  const tileSize = Math.min(width, height) * 0.18

  function drawStable() {
    const sctx = stable.getContext('2d')!

    // 黑色背景
    sctx.fillStyle = '#000'
    sctx.fillRect(0, 0, width, height)

    // 1. 铺底色
    const cctx = colorCanvas.getContext('2d')!
    cctx.fillStyle = tintColor
    cctx.fillRect(0, 0, width, height)

    // 2. 用 mask 切形状
    cctx.globalCompositeOperation = 'destination-in'
    const cols = Math.ceil(width / tileSize) + 1
    const rows = Math.ceil(height / tileSize) + 1
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * tileSize
        const y = r * tileSize
        cctx.drawImage(maskTile, x, y, tileSize, tileSize)
      }
    }
    cctx.globalCompositeOperation = 'source-over'

    // 3. 把切好的图形画到稳定图层
    sctx.drawImage(colorCanvas, 0, 0)
  }

  function drawScanlines(target: CanvasRenderingContext2D) {
    target.save()
    target.globalCompositeOperation = 'multiply'
    target.fillStyle = 'rgba(0, 0, 0, 0.35)'
    for (let y = 0; y < height; y += 3) {
      target.fillRect(0, y, width, 1)
    }
    target.restore()
  }

  function drawVignette(target: CanvasRenderingContext2D) {
    const cx = width / 2
    const cy = height / 2
    const radius = Math.max(width, height) * 0.75
    const grad = target.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius)
    grad.addColorStop(0, 'rgba(0,0,0,0)')
    grad.addColorStop(1, 'rgba(0,0,0,0.55)')
    target.fillStyle = grad
    target.fillRect(0, 0, width, height)
  }

  function drawJitterBand(target: CanvasRenderingContext2D) {
    if (!jitter) {
      return
    }
    const { y, h, offset, colorShift } = jitter

    const band = document.createElement('canvas')
    band.width = width
    band.height = h
    const bctx = band.getContext('2d')!

    if (colorShift) {
      bctx.drawImage(stable, 0, y, width, h, offset, 0, width, h)
      bctx.globalCompositeOperation = 'lighter'
      bctx.fillStyle = 'rgba(255, 0, 80, 0.25)'
      bctx.fillRect(0, 0, width, h)
      bctx.fillStyle = 'rgba(0, 255, 200, 0.15)'
      bctx.fillRect(offset, 0, width, h)
      bctx.globalCompositeOperation = 'source-over'
    }
    else {
      bctx.drawImage(stable, 0, y, width, h, offset, 0, width, h)
    }

    target.drawImage(band, 0, y)
  }

  let rafId = 0
  let colorInterval: ReturnType<typeof setInterval> | null = null

  function render() {
    drawStable()
    if (!('debugged' in render)) {
      console.warn('[cyberpunk] first render call')
      ;(render as any).debugged = true
    }
    ctx.drawImage(stable, 0, 0)
    drawJitterBand(ctx)
    drawScanlines(ctx)
    drawVignette(ctx)

    const now = performance.now()
    if (now >= nextJitterAt) {
      if (jitter) {
        jitter = null
        nextJitterAt = now + _random(1500, 4000)
      }
      else {
        jitter = {
          y: _random(0, height - 20),
          h: _random(8, 40),
          offset: _random(-30, 30),
          colorShift: Math.random() > 0.5
        }
        nextJitterAt = now + _random(80, 220)
      }
    }

    rafId = requestAnimationFrame(render)
  }

  colorInterval = setInterval(() => {
    const idx = _random(0, CYBER_COLORS.length - 1)
    tintColor = CYBER_COLORS[idx]!
  }, 1500)

  render()

  stopAnimation = () => {
    cancelAnimationFrame(rafId)
    if (colorInterval) {
      clearInterval(colorInterval)
    }
    window.removeEventListener('resize', onResize)
  }
}
</script>
