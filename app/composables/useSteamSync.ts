/**
 * Steam 游戏状态多页面同步
 *
 * 使用 BroadcastChannel 实现多标签页 Steam 游戏状态同步
 */
export function useSteamSync() {
  const steam = useSteam()

  const { data, isLeader } = useBroadcastSync(
    'steam-sync',
    async () => {
      const res = await $fetch('/api/steam/playing', {
        timeout: 10000
      })
      return res
    }
  )

  watch(data, (newData) => {
    if (newData) {
      steam.updateFromSync(newData)
    }
  })

  return { isLeader }
}
