<template>
  <div h-full w-full flex items-center justify-center>
    <div v-if="showFavicon" flex="~ col" items-center gap-2 animate-fade-in>
      <div h-32 w-32>
        <img src="/favicon.png">
      </div>
      <div text-8 bg-clip-text text-transparent bg-gradient-to-tr from="#bd34fe" to="#47caff">
        Hi
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const showFavicon = ref(false)

onMounted(() => {
  const faviconImage = new Image()
  faviconImage.src = '/favicon.png'

  faviconImage.onload = () => {
    showFavicon.value = true

    setTimeout(() => {
      const router = useRouter()
      router.push('/resume')
    }, 2000)
  }
})
</script>
