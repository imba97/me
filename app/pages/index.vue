<template>
  <div size-full fcc>
    <div flex="~ col" items-center gap-2 animate-fade-in>
      <AnimatedProvider :delay-increment="0.2">
        <AnimatedSection>
          <div size-32>
            <NuxtImg src="/favicon.png" alt="logo" size-full />
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
const pkg = usePackage()

onMounted(() => {
  setTimeout(() => {
    const router = useRouter()
    router.push('/resume')
  }, 2000)
})
</script>
