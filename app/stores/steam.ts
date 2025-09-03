export const useSteam = defineStore('steam', {
  state: () => ({
    playing: false,
    name: '',
    image: '',
    hasImage: false,
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

      const headerImage = `/api/steam/game-image/${game.id}`

      if (this.image !== headerImage) {
        this.hasImage = false

        this.hasImage = !!headerImage
        this.image = headerImage
      }
    }
  }
})
