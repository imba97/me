import { BroadcastChannel, createLeaderElection } from 'broadcast-channel'

interface SyncMessage<T = any> {
  type: 'update' | 'request'
  channel: string
  data?: T
  timestamp: number
}

/**
 * 多页面数据同步 Composable
 *
 * 使用 BroadcastChannel 和 Leader Election 实现多标签页数据同步
 * - 只有 Leader 页面负责请求 API
 * - 其他页面监听并接收数据更新
 * - Leader 关闭时自动选举新的 Leader
 */
export function useBroadcastSync<T>(
  channelName: string,
  fetchFn: () => Promise<T>,
  interval: number = 10000
) {
  const data = ref<T | null>(null)
  const isLeader = ref(false)
  const visible = useDocumentVisibility()

  let timer: NodeJS.Timeout | null = null
  let isActive = false
  let channel: any = null
  let elector: any = null

  // 只在客户端初始化
  onMounted(async () => {
    if (!import.meta.client)
      return

    channel = new BroadcastChannel(channelName)

    // 创建 Leader Elector
    elector = createLeaderElection(channel)

    // 监听成为 Leader
    elector.awaitLeadership().then(() => {
      isLeader.value = true
      startFetching()
    })

    // 接收数据更新和请求
    channel.onmessage = (msg: SyncMessage<T>) => {
      if (msg.type === 'update') {
        data.value = msg.data ?? null
      }
      else if (msg.type === 'request') {
        // Leader 收到数据请求，立即广播当前数据
        if (isLeader.value && data.value !== null) {
          // 使用 JSON 序列化来确保数据可以被克隆
          const clonedData = JSON.parse(JSON.stringify(data.value))
          channel.postMessage({
            type: 'update',
            channel: channelName,
            data: clonedData,
            timestamp: Date.now()
          } as SyncMessage<T>)
        }
      }
    }

    // 等待 Leader Election 初始化完成
    // 使用 hasLeader() 检查是否有 Leader，如果没有则等待
    await elector.hasLeader().then(() => {
      // 无论是否有 Leader，Follower 都主动请求一次数据
      // 如果当前实例不是 Leader，发送数据请求
      if (isLeader.value)
        return

      channel.postMessage({
        type: 'request',
        channel: channelName,
        timestamp: Date.now()
      } as SyncMessage<T>)
    })
  })

  // Leader 负责获取并广播数据
  async function startFetching() {
    if (isActive || !channel)
      return
    isActive = true

    const fetch = async () => {
      // 页面不可见时暂停请求
      if (visible.value !== 'visible') {
        return
      }

      try {
        const result = await fetchFn()
        data.value = result

        // 广播给其他页面
        if (channel) {
          // 使用 JSON 序列化来确保数据可以被克隆
          const clonedData = JSON.parse(JSON.stringify(result))
          await channel.postMessage({
            type: 'update',
            channel: channelName,
            data: clonedData,
            timestamp: Date.now()
          } as SyncMessage<T>)
        }
      }
      catch (error) {
        console.error(`[${channelName}] Fetch error:`, error)
      }
    }

    // 立即执行一次
    await fetch()

    // 设置定时器
    timer = setInterval(fetch, interval)
  }

  // 停止请求
  function stopFetching() {
    if (timer) {
      clearInterval(timer)
      timer = null
      isActive = false
    }
  }

  // 监听页面可见性变化
  watch(visible, (newVisible) => {
    if (newVisible === 'visible' && isLeader.value && !isActive) {
      startFetching()
    }
    else if (newVisible !== 'visible' && isActive) {
      stopFetching()
    }
  })

  // 清理
  function cleanup() {
    stopFetching()
    if (elector) {
      elector.die()
    }
    if (channel) {
      channel.close()
    }
  }

  onUnmounted(cleanup)

  return {
    data: readonly(data),
    isLeader: readonly(isLeader),
    channel
  }
}
