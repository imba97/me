<template>
  <div size-full px-7 py-10 of-x-hidden>
    <div w-full max-w-4xl ma>
      <div mb-6 flex="~" items-center gap-2>
        <button text-gray-5 hover:text-gray-9 transition i-carbon-arrow-left @click="router.back()" />
        <div text-6 font-bold>
          {{ title }}
        </div>
      </div>

      <H2lRanking :rankings="rankings" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Rankings } from 'h2l-ranking'
import H2lRanking from 'h2l-ranking'
import 'h2l-ranking/style.css'

interface Props {
  title: string
  rankings: Rankings
}

defineProps<Props>()

const router = useRouter()
</script>
