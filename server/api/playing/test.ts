export default defineEventHandler(async () => {
  const runtimeConfig = useRuntimeConfig()

  return {
    env: runtimeConfig.env
  }
})
