<style scoped>
/* 与原 floating-vue（dropdown 主题）的视觉保持一致，可用 CSS 变量覆盖 */
.me-popper {
  z-index: 10000;
}

.me-popper__inner {
  position: relative;
  overflow: hidden;
  border: var(--me-popper-border, 1px solid #ddd);
  border-radius: var(--me-popper-radius, 6px);
  background: var(--me-popper-background, #fff);
  box-shadow: var(--me-popper-shadow, 0 6px 30px rgb(0 0 0 / 10%));
}

/* 给插槽根元素建层叠上下文，卡内 z-index: -1 的背景层才不会跑到白底下面 */
.me-popper__inner > :first-child {
  position: relative;
  z-index: 1;
  max-width: inherit;
  max-height: inherit;
}

.me-popper-enter-active {
  transition: opacity 0.15s;
}

.me-popper-leave-active {
  transition: opacity 0.15s, visibility 0.15s;
}

.me-popper-enter-from,
.me-popper-leave-to {
  opacity: 0;
}

.me-popper-leave-to {
  visibility: hidden;
  pointer-events: none;
}
</style>

<template>
  <div
    ref="reference"
    class="inline-flex"
    role="button"
    tabindex="0"
    aria-haspopup="true"
    :aria-expanded="open"
    @pointerenter="onReferenceEnter"
    @pointerleave="scheduleHide"
    @click="toggle"
    @keydown.enter.prevent="toggle"
    @keydown.space.prevent="toggle"
    @keydown.esc="hide"
  >
    <slot />
  </div>

  <Teleport to="body">
    <Transition name="me-popper">
      <div
        v-if="open"
        ref="floating"
        data-me-popper
        class="me-popper"
        :style="floatingStyles"
        @pointerenter="cancelHide"
        @pointerleave="scheduleHide"
      >
        <div class="me-popper__inner">
          <slot name="popper" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import type { Placement } from '@floating-ui/vue'
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue'

/**
 * MePopper：hover / 点击触发的浮层（替代 floating-vue 的 VMenu）
 *
 * - 默认插槽 = 触发元素，`#popper` 插槽 = 浮层内容
 * - 浮层 Teleport 到 body，并带 flip / shift，避免被父级 overflow 裁剪
 * - 桌面端悬停显示，触摸设备点击切换；鼠标从触发元素移入浮层不会闪关
 */
const props = withDefaults(defineProps<{
  /** 相对触发元素的位置 */
  placement?: Placement
  /** 主轴偏移（对应 floating-vue 的 distance） */
  distance?: number
  /** 交叉轴偏移（对应 floating-vue 的 skidding） */
  skidding?: number
  /** 显示延迟（ms） */
  showDelay?: number
  /** 隐藏延迟（ms），给「鼠标移入浮层」留出容错时间 */
  hideDelay?: number
}>(), {
  placement: 'bottom',
  distance: 16,
  skidding: 0,
  showDelay: 0,
  hideDelay: 120
})

const open = ref(false)
const reference = ref<HTMLElement | null>(null)
const floating = ref<HTMLElement | null>(null)

const { floatingStyles } = useFloating(reference, floating, {
  open,
  placement: () => props.placement,
  middleware: () => [
    offset({ mainAxis: props.distance, crossAxis: props.skidding }),
    flip({ padding: 8 }),
    shift({ padding: 8 })
  ],
  whileElementsMounted: autoUpdate
})

let showTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null

function clearTimers() {
  if (showTimer) {
    clearTimeout(showTimer)
    showTimer = null
  }
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

function show() {
  clearTimers()
  if (props.showDelay > 0)
    showTimer = setTimeout(() => (open.value = true), props.showDelay)
  else
    open.value = true
}

function hide() {
  clearTimers()
  open.value = false
}

function scheduleHide() {
  if (hideTimer)
    clearTimeout(hideTimer)
  hideTimer = setTimeout(() => (open.value = false), props.hideDelay)
}

function cancelHide() {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

function toggle() {
  if (open.value)
    hide()
  else
    show()
}

/** 只在有悬停能力的指针上走 hover 逻辑，触摸设备交给 click */
function onReferenceEnter(event: PointerEvent) {
  if (event.pointerType === 'mouse' || event.pointerType === 'pen')
    show()
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!open.value)
    return
  const target = event.target as Node | null
  if (reference.value?.contains(target) || floating.value?.contains(target))
    return
  hide()
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value)
    hide()
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
  document.addEventListener('keydown', onDocumentKeydown)
})

onBeforeUnmount(() => {
  clearTimers()
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  document.removeEventListener('keydown', onDocumentKeydown)
})
</script>
