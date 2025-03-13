export const useSteam = defineStore('steam', {
  state: () => ({
    playing: false,
    name: '',
    headerImage: '',
    background: '',
    backgroundRaw: '',
    blobBackground: '',
    imageLoaded: false,
    lastFetchTime: 0,
    fetchInterval: 10000
  }),

  actions: {
    async fetchPlayingGame() {
      const now = new Date().getTime()

      if (this.lastFetchTime + (this.fetchInterval - 1000) > now) {
        return
      }

      const response = await $fetch('/api/steam/playing')
      this.playing = response.playing

      if (!this.playing) {
        return
      }

      this.lastFetchTime = new Date().getTime()

      const game = response.game!

      this.name = game.name

      if (this.background !== game.background) {
        this.imageLoaded = false

        this.headerImage = game.header_image
        this.background = game.background
        this.backgroundRaw = game.background_raw

        const encodedUrl = encodeURIComponent(this.backgroundRaw)
        const proxyUrl = `/api/image/${encodedUrl}`

        useLoadImage(proxyUrl).then((image) => {
          this.blobBackground = image
          this.imageLoaded = true
        }).catch(() => {
          this.imageLoaded = false
          this.headerImage = ''
          this.background = ''
          this.backgroundRaw = ''
          this.blobBackground = ''
        })
      }
    }
  }
})
