<script lang="ts" setup>
setTimeout(() => {
  const router = useRouter()
  router.push('/resume')
}, 2000)
</script>

<template>
  <div h-full w-full flex items-center justify-center>
    <div flex="~ col" items-center gap-2 animate-fade-in>
      <div h-32 w-32>
        <img src="/favicon.png">
      </div>
      <div text-8 bg-clip-text text-transparent bg-gradient-to-tr from="#bd34fe" to="#47caff">
        Hi
      </div>
    </div>
  </div>
</template>
