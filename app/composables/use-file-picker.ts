import { onUnmounted } from 'vue'

/**
 * 唤起系统文件选择器：每次 `trigger()` 创建一个临时 `<input type="file">`
 * 并 `.click()`；`change` 后把 File 透传给 `onFile` 并从 DOM 移除。
 *
 * 必须在 user-activation 上下文（button @click、用户手势回调）调用，
 * 否则 Chromium 抛 "File chooser dialog can only be shown with a user activation"。
 * file chooser 检查 `HasTransientUserActivation()`。
 *
 * 为什么每次新建 input（不重用）：同一元素连续 `.click()` 会被某些 Chromium
 * 版本的"已被激活过"标记拦截；一次性 input 绕开该问题。
 *
 * 取消兜底：`change` 不在 picker 取消时触发。如果用户连续取消不选文件就退出，
 * DOM 里的临时 input 会留着。每 60s 检查把还活着的清掉，避免堆积；
 * 同时 `onUnmounted` 通过 AbortController 中止所有挂着 change listener，
 * 防止用户在 picker 打开时切页后 listener 仍触发。
 */
export function useFilePicker(options: {
  accept?: string
  onFile: (file: File) => void
}) {
  const accept = options.accept ?? '*/*'
  const abortCtrl = new AbortController()
  onUnmounted(() => abortCtrl.abort())

  function trigger() {
    const fresh = document.createElement('input')
    fresh.type = 'file'
    fresh.accept = accept
    fresh.style.cssText = 'position:absolute;width:0;height:0;opacity:0;left:-9999px;'
    const cleanup = () => {
      if (fresh.parentNode)
        fresh.remove()
    }
    fresh.addEventListener('change', () => {
      const file = fresh.files?.[0]
      cleanup()
      if (file)
        options.onFile(file)
    }, { signal: abortCtrl.signal })
    // picker 取消时 change 不触发；60s 兜底清掉，避免用户多次取消后 DOM 堆积
    setTimeout(cleanup, 60_000)
    document.body.appendChild(fresh)
    fresh.click()
  }

  return { trigger }
}
