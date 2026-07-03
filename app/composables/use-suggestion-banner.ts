/**
 * 输入框上方的建议气泡（如「做个自我介绍」）：
 * - 挂载 `showAfterMs` 后浮现
 * - 仅在「输入为空」+「没有任何消息」时显示
 * - 点击后由 `onApply` 触发，传入默认文案（业务侧自行决定如何写输入框、调发送等）
 */
export function useSuggestionBanner(options: {
  inputValue: Ref<string>
  isEmpty: ComputedRef<boolean>
  noMessages: ComputedRef<boolean>
  defaultText: string
  onApply: () => void
  showAfterMs?: number
}) {
  const showAfterMs = options.showAfterMs ?? 2000

  const showSuggestion = ref(false)
  const shouldShowSuggestion = computed(() =>
    showSuggestion.value && options.isEmpty.value && options.noMessages.value
  )
  const suggestionAnimateState = computed(() =>
    shouldShowSuggestion.value
      ? { opacity: 1, y: -10 }
      : { opacity: 0, y: 30 }
  )

  onMounted(() => {
    setTimeout(() => {
      showSuggestion.value = true
    }, showAfterMs)
  })

  function applySuggestion() {
    options.inputValue.value = options.defaultText
    options.onApply()
  }

  return {
    defaultText: options.defaultText,
    showSuggestion,
    shouldShowSuggestion,
    suggestionAnimateState,
    applySuggestion
  }
}
