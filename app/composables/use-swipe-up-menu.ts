import { useEventListener } from '@vueuse/core'

/**
 * 移动端"按住输入框上滑"唤起功能菜单的手势 hook。
 *
 * - `origin`：手势起点（chat input）
 * - `isMobile`：仅移动端启用监听，非移动端早返回
 * - `containerRef`：菜单挂载所在的容器（input 行 + 菜单行的父元素）。点击落在
 *    这个容器**外**就自动关闭菜单；容器内点击（input / 菜单按钮）由各自 handler
 *    自己决定是否关
 * - `thresholdPx`：上滑阈值，默认 50
 *
 * 返回 `menuOpen`（给模板 `v-if` 用）+ `close()`（菜单内选具体功能时用）。
 *
 * 关于手势不直接开 picker / 录音：系统 file chooser 检查
 * `HasTransientUserActivation()`；picker dialog 关闭后 transient activation
 * 不可靠，从手势回调里直接 `.click()` 在第二次以后会失败。菜单本身只是普通 UI；
 * 菜单内具体功能由按钮点开 — 按钮 `@click` 是新 user-activation 上下文，每次必弹。
 *
 * `touch-action: pan-x pan-y`：父容器已禁掉 pinch / dblclick，原生 dblclick 也会
 * 被吞；走 touchstart / touchmove / touchend 不会被拦截。
 */
export function useSwipeUpMenu(options: {
  origin: Ref<HTMLElement | null>
  isMobile: ComputedRef<boolean> | Ref<boolean>
  containerRef: Ref<HTMLElement | null>
  thresholdPx?: number
}) {
  const threshold = options.thresholdPx ?? 50
  const menuOpen = ref(false)
  let swipeOriginY: number | null = null
  let swipeUpDetected = false

  function resetState() {
    swipeOriginY = null
    swipeUpDetected = false
  }

  function close() {
    menuOpen.value = false
    resetState()
  }

  // 点击落在菜单容器外则关闭；容器内点击由 input / 菜单按钮自身 handler 处理
  useEventListener(document, 'click', (e) => {
    if (!menuOpen.value)
      return
    const target = e.target as Node | null
    if (!target)
      return
    const container = options.containerRef.value
    if (!container)
      return
    if (!container.contains(target))
      close()
  })

  useEventListener(options.origin, 'touchstart', (e: TouchEvent) => {
    if (!options.isMobile.value)
      return
    const touch = e.touches[0]
    if (!touch)
      return
    swipeOriginY = touch.clientY
    swipeUpDetected = false
  }, { passive: true })

  // isMobile 在手势中途由 true 翻 false 时，主动清残留状态
  watch(options.isMobile, (enabled) => {
    if (!enabled)
      resetState()
  })

  useEventListener(document, 'touchmove', (e: TouchEvent) => {
    if (swipeOriginY == null)
      return
    const touch = e.touches[0]
    if (!touch)
      return
    if (touch.clientY - swipeOriginY < -threshold)
      swipeUpDetected = true
  }, { passive: true })

  useEventListener(document, 'touchend', () => {
    if (swipeUpDetected && options.isMobile.value)
      menuOpen.value = true
    resetState()
  })

  // touchcancel 是系统取消手势；不应当唤起菜单
  useEventListener(document, 'touchcancel', () => {
    resetState()
  })

  return { menuOpen, close }
}
