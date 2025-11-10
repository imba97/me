/**
 * 音乐播放状态多页面同步
 *
 * 使用 BroadcastChannel 实现多标签页音乐播放状态同步
 */
export function useMusicSync() {
  const music = useMusic()

  const { data, isLeader } = useBroadcastSync(
    'music-sync',
    async () => {
      const res = await $fetch('/api/playing')
      return res.success ? res.data : null
    }
  )

  watch(data, (newData) => {
    if (newData) {
      music.updateFromSync(newData)
    }
  })

  return { isLeader }
}
