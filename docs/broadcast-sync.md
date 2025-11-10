# 多页面数据同步方案

## 目标

使用 `broadcast-channel` 实现多标签页数据同步：
- 只有一个页面（Leader）负责请求 API
- 其他页面（Follower）接收数据更新
- Leader 关闭时自动切换

## 技术选型

**broadcast-channel v7.2.0**
- 支持 Leader Election
- 跨标签页通信
- 自动降级支持

## 核心实现

### 1. 同步管理器

`app/composables/useBroadcastSync.ts`：

```typescript
import { BroadcastChannel, createLeaderElection } from 'broadcast-channel'

interface SyncMessage<T = any> {
  type: 'update' | 'request'
  channel: string
  data?: T
  timestamp: number
}

export function useBroadcastSync<T>(
  channelName: string,
  fetchFn: () => Promise<T>,
  interval: number = 10000
) {
  const data = ref<T | null>(null)
  const isLeader = ref(false)
  const visible = useDocumentVisibility()

  let timer: NodeJS.Timeout | null = null
  let channel: any = null
  let elector: any = null

  onMounted(async () => {
    if (!import.meta.client)
      return

    channel = new BroadcastChannel(channelName)
    elector = createLeaderElection(channel)

    // 成为 Leader 后开始请求
    elector.awaitLeadership().then(() => {
      isLeader.value = true
      startFetching()
    })

    // 接收消息
    channel.onmessage = (msg: SyncMessage<T>) => {
      if (msg.type === 'update') {
        data.value = msg.data ?? null
      }
      else if (msg.type === 'request' && isLeader.value && data.value) {
        const clonedData = JSON.parse(JSON.stringify(data.value))
        channel.postMessage({
          type: 'update',
          channel: channelName,
          data: clonedData,
          timestamp: Date.now()
        })
      }
    }

    // Follower 主动请求数据
    await elector.hasLeader().then(() => {
      if (isLeader.value)
        return

      channel.postMessage({
        type: 'request',
        channel: channelName,
        timestamp: Date.now()
      })
    })
  })

  async function startFetching() {
    if (timer || !channel)
      return

    const fetch = async () => {
      if (visible.value !== 'visible')
        return

      try {
        const result = await fetchFn()
        data.value = result

        const clonedData = JSON.parse(JSON.stringify(result))
        await channel.postMessage({
          type: 'update',
          channel: channelName,
          data: clonedData,
          timestamp: Date.now()
        })
      }
      catch (error) {
        console.error(`[${channelName}] Fetch error:`, error)
      }
    }

    await fetch()
    timer = setInterval(fetch, interval)
  }

  // 页面可见性监听
  watch(visible, (newVisible) => {
    if (newVisible === 'visible' && isLeader.value && !timer) {
      startFetching()
    }
    else if (newVisible !== 'visible' && timer) {
      clearInterval(timer)
      timer = null
    }
  })

  // 清理
  onUnmounted(() => {
    if (timer)
      clearInterval(timer)
    if (elector)
      elector.die()
    if (channel)
      channel.close()
  })

  return {
    data: readonly(data),
    isLeader: readonly(isLeader)
  }
}
```

### 2. Store 改造

**Music Store** (`app/stores/music.ts`):

```typescript
export const useMusic = defineStore('music', {
  state: () => ({
    playing: false,
    name: '',
    artist: '',
    image: '',
    hasImage: false
  }),

  actions: {
    updateFromSync(data: MusicData) {
      if (!data.name || !data.artist)
        return

      this.name = data.name
      this.artist = data.artist
      this.playing = data.playing
      this.hasImage = !!data.albumCover

      if (this.hasImage && data.albumCover !== this.image) {
        this.image = data.albumCover
      }
    }
  }
})
```

**Steam Store** 类似实现。

### 3. 使用方式

`app/composables/useMusicSync.ts`：

```typescript
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
    if (newData)
      music.updateFromSync(newData)
  })

  return { isLeader }
}
```

`app.vue` 中调用：

```typescript
useMusicSync()
useSteamSync()
```

## 关键特性

### 1. Follower 主动请求

使用 `elector.hasLeader()` 等待初始化完成，Follower 立即请求数据：

```typescript
await elector.hasLeader().then(() => {
  if (isLeader.value)
    return

  channel.postMessage({
    type: 'request',
    channel: channelName,
    timestamp: Date.now()
  })
})
```

### 2. 数据序列化

使用 JSON 序列化确保数据可被 BroadcastChannel 传输：

```typescript
const clonedData = JSON.parse(JSON.stringify(data.value))
channel.postMessage({
  type: 'update',
  data: clonedData,
  timestamp: Date.now()
})
```

### 3. 页面可见性检测

页面不可见时自动暂停请求，节省资源。

### 4. SSR 兼容

通过 `onMounted` 和 `import.meta.client` 确保只在客户端运行。

## 优势

- ✅ 资源节约：避免重复请求
- ✅ 实时同步：所有页面数据一致
- ✅ 自动切换：Leader 关闭后自动选举
- ✅ 类型安全：完整 TypeScript 支持
- ✅ 代码简洁：`app.vue` 从 95 行减至 31 行

## 常见问题

**Q: 为什么不用 setTimeout 延迟？**
A: 使用 `elector.hasLeader()` 等待 Leader Election 初始化完成，更可靠。

**Q: 为什么需要 JSON 序列化？**
A: BroadcastChannel 使用结构化克隆算法，某些对象无法直接传输。

**Q: Leader 切换需要多久？**
A: 通常 < 100ms，由 `broadcast-channel` 自动处理。
