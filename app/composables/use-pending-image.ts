import type { ChatImage } from '~~/shared/ai/chat'
import { useEventListener } from '@vueuse/core'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_IMAGE_BYTES = 4 * 1024 * 1024
const MAX_IMAGE_EDGE = 1568
/** 双击退格删除图片的时间窗口。参考 blog-vite 搜索框的 tag 删除模式。 */
const DOUBLE_BACKSPACE_MS = 520

/**
 * 粘贴图片相关：服务端能力、FileReader/canvas 处理、双击退格删除的「prime」提示。
 * 入口：传入 `inputRef`（用于绑定 paste / keydown）和 `userInput`（用于空输入判定 + 任何键入重置 prime）。
 */
export function usePendingImage(
  inputRef: Ref<HTMLInputElement | null>,
  userInput: Ref<string>
) {
  const { data: aiCaps } = useFetch('/api/ai/capabilities')
  const supportsImage = computed(() => aiCaps.value?.supportsImage ?? false)

  const pendingImage = ref<ChatImage | null>(null)
  const imageError = ref('')
  const previewOpen = ref(false)
  const pendingImageUrl = computed(() =>
    pendingImage.value ? chatImageToDataUrl(pendingImage.value) : ''
  )

  // 预览打开时锁住 body 滚动，避免背景跟着滚
  watch(previewOpen, (open) => {
    if (typeof document === 'undefined')
      return
    document.body.style.overflow = open ? 'hidden' : ''
  })

  // 双击退格删除：状态机
  let lastEmptyBackspaceAt = 0
  let imageDeletePrimeTimer: ReturnType<typeof setTimeout> | null = null
  const imageDeletePrimed = ref(false)

  function resetImageDeletePrime() {
    imageDeletePrimed.value = false
    if (imageDeletePrimeTimer != null) {
      clearTimeout(imageDeletePrimeTimer)
      imageDeletePrimeTimer = null
    }
    lastEmptyBackspaceAt = 0
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key !== 'Backspace')
      return
    if (!pendingImage.value || userInput.value !== '')
      return

    e.preventDefault()
    const now = Date.now()
    if (now - lastEmptyBackspaceAt < DOUBLE_BACKSPACE_MS) {
      // 窗口内第二次按：删除
      deleteImage()
    }
    else {
      // 第一次按：进入"待删除"提示态
      imageDeletePrimed.value = true
      if (imageDeletePrimeTimer != null)
        clearTimeout(imageDeletePrimeTimer)
      imageDeletePrimeTimer = setTimeout(() => {
        imageDeletePrimed.value = false
        lastEmptyBackspaceAt = 0
        imageDeletePrimeTimer = null
      }, DOUBLE_BACKSPACE_MS)
      lastEmptyBackspaceAt = now
    }
  }

  // 任何键入都重置 prime 状态
  watch(userInput, () => {
    resetImageDeletePrime()
  })

  function deleteImage() {
    pendingImage.value = null
    imageError.value = ''
    resetImageDeletePrime()
    previewOpen.value = false
  }

  // ---------- File → ChatImage 工具 ----------

  function readAsDataUrl(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('read failed'))
      reader.readAsDataURL(file)
    })
  }

  async function fileToChatImage(file: File): Promise<ChatImage> {
    const mediaType = file.type

    // GIF 保留原图（保留动画帧）
    if (mediaType === 'image/gif') {
      const dataUrl = await readAsDataUrl(file)
      return { mediaType, data: stripBase64Prefix(dataUrl) }
    }

    // createImageBitmap 直接解码 File，跳过完整 base64 字符串这一中间态，
    // 内存峰值更低；对 4MB 截图可省约 4MB 同时驻留。
    const bitmap = await createImageBitmap(file)
    try {
      const longest = Math.max(bitmap.width, bitmap.height)
      if (longest <= MAX_IMAGE_EDGE) {
        // 不缩放：直接读原文件，避免 canvas 二次编码（JPEG 会有损）
        const dataUrl = await readAsDataUrl(file)
        return { mediaType, data: stripBase64Prefix(dataUrl) }
      }

      // 超长边：等比缩小到 MAX_IMAGE_EDGE
      const scale = MAX_IMAGE_EDGE / longest
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(bitmap.width * scale)
      canvas.height = Math.round(bitmap.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx)
        throw new Error('canvas context unavailable')
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      return { mediaType, data: stripBase64Prefix(canvas.toDataURL(mediaType)) }
    }
    finally {
      bitmap.close()
    }
  }

  function stripBase64Prefix(dataUrl: string): string {
    const comma = dataUrl.indexOf(',')
    return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl
  }

  // ---------- Paste ----------

  async function onPaste(e: ClipboardEvent) {
    if (!supportsImage.value)
      return
    const items = e.clipboardData?.items
    if (!items)
      return
    const item = Array.from(items).find(it => it.kind === 'file' && it.type.startsWith('image/'))
    if (!item)
      return
    e.preventDefault()
    const file = item.getAsFile()
    if (!file)
      return
    // 图片是用户表达的一部分：无法采用时提示并中止，不静默降级
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      imageError.value = '仅支持 JPEG / PNG / GIF / WEBP 图片'
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      imageError.value = '图片过大，请使用 4MB 以内的图片'
      return
    }
    try {
      // 多次粘贴替换上一张
      pendingImage.value = await fileToChatImage(file)
      imageError.value = ''
    }
    catch {
      imageError.value = '图片读取失败，请重试'
    }
  }

  // 粘贴监听始终注册，是否处理由 provider 能力决定
  useEventListener(inputRef, 'paste', onPaste)

  return {
    // 状态
    pendingImage,
    pendingImageUrl,
    imageError,
    previewOpen,
    imageDeletePrimed,
    // 行为
    handleKeydown,
    deleteImage
  }
}
