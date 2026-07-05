import { useEventListener, useResizeObserver } from '@vueuse/core'

const BOTTOM_TOLERANCE = 4

/**
 * 消息列表的自动滚动行为：
 * - 用户滚上去 → 标记「userScrolledUp」，停止自动跟随
 * - 用户回到底部（含容差）→ 解除标记
 * - 最后一个 assistant 气泡高度变化（SSE chunk 到达 / markstream 动画）→ 若在底部则跟到底
 * 入口：传入滚动容器 ref；模板里把最后一个 assistant 气泡的 ref 用 `trackAssistantBubble` 绑定。
 */
export function useAutoScroll(containerRef: Ref<HTMLElement | null>) {
  const userScrolledUp = ref(false)
  const lastBubbleEl = ref<HTMLElement | null>(null)

  let prevScrollTop = 0
  useEventListener(containerRef, 'scroll', () => {
    const el = containerRef.value
    if (!el)
      return
    const newScrollTop = el.scrollTop
    // 用户真往上滚了 → 标记；阈值过滤 scroll anchoring 之类的小幅抖动
    if (newScrollTop < prevScrollTop - BOTTOM_TOLERANCE)
      userScrolledUp.value = true
    // 回到（含容差的）底部 → 解除标记
    if (el.scrollHeight - el.clientHeight - newScrollTop <= BOTTOM_TOLERANCE)
      userScrolledUp.value = false
    prevScrollTop = newScrollTop
  }, { passive: true })

  function trackAssistantBubble(el: unknown) {
    if (!el)
      return
    // 仅当 $el 是真正的 HTMLElement 时才记录；否则留空，避免把组件代理 / 文本节点等
    // 喂给 ResizeObserver 导致 "parameter 1 is not of type 'Element'"。
    const node = (el as { $el?: unknown }).$el
    if (node instanceof HTMLElement)
      lastBubbleEl.value = node
  }

  useResizeObserver(lastBubbleEl, () => {
    if (userScrolledUp.value)
      return
    const container = containerRef.value
    if (!container || container.scrollHeight <= container.clientHeight)
      return
    container.scrollTo({ top: container.scrollHeight, behavior: 'auto' })
  })

  function scrollToBottom() {
    if (!containerRef.value)
      return
    containerRef.value.scrollTop = containerRef.value.scrollHeight
  }

  function onInputFocus() {
    // 现代浏览器聚焦 input 时会自动滚到可见区，无需手动 hack
    containerRef.value?.scrollTo({ top: containerRef.value.scrollHeight, behavior: 'smooth' })
  }

  const showJumpButton = computed(() => userScrolledUp.value)

  return {
    showJumpButton,
    trackAssistantBubble,
    scrollToBottom,
    onInputFocus
  }
}
