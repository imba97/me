export const useSteam = defineStore('steam', {
  state: () => ({
    playing: false,
    name: '',
    image: '',
    blobImage: '',
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

      const response = await $fetch('/api/steam/playing', {
        timeout: 10000
      })

      this.playing = response.playing

      if (!this.playing) {
        return
      }

      this.lastFetchTime = new Date().getTime()

      const game = response.game!

      this.name = game.name

      const headerImage = `https://steamcdn-a.akamaihd.net/steam/apps/${game.id}/header.jpg`

      if (this.image !== headerImage) {
        this.imageLoaded = false

        this.image = headerImage

        useLoadImage(headerImage).then((image) => {
          this.blobImage = image
          this.imageLoaded = true
        }).catch(() => {
          this.imageLoaded = false
          this.image = ''
          this.blobImage = ''
        })
      }
    }
  }
})
