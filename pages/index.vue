<template>
  <div h-full w-full flex items-center justify-center>
    <div v-if="!loading" flex="~ col" items-center gap-2 animate-fade-in>
      <AnimatedProvider :delay-increment="0.2">
        <AnimatedSection>
          <div size-32>
            <img :src="url">
          </div>
        </AnimatedSection>
        <AnimatedSection>
          <div text-8 bg-clip-text text-transparent bg-gradient-to-tr from="#bd34fe" to="#47caff">
            Hi
          </div>
        </AnimatedSection>
        <AnimatedSection>
          <div text="3 gray-3">
            v{{ pkg.version }}
          </div>
        </AnimatedSection>
      </AnimatedProvider>
    </div>
  </div>
</template>

<script lang="ts" setup>
const loading = ref(true)
const url = ref('')

const pkg = usePackage()

onMounted(() => {
  useLoadImage('/favicon.png', 10000)
    .then((image: string) => {
      loading.value = false
      url.value = image

      setTimeout(() => {
        const router = useRouter()
        router.push('/resume')
      }, 2000)
    })
})
</script>
