export default function useMobileSize() {
  const { width: windowWidth } = useWindowSize()
  return {
    isMobileSize: computed(() => windowWidth.value < 670)
  }
}
