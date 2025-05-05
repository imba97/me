export const useMusic = defineStore('music', {
  state: () => ({
    playing: false,
    name: '',
    artist: '',
    image: '',
    hasImage: false,
    lastFetchTime: 0,
    fetchInterval: 10000
  }),

  actions: {
    async fetchMusic() {
      const now = new Date().getTime()

      if (this.lastFetchTime + (this.fetchInterval - 1000) > now) {
        return
      }

      const response = await $fetch('/api/playing')

      if (!response.success) {
        return
      }

      this.lastFetchTime = new Date().getTime()

      const data = response.data!

      if (!data.name || !data.artist) {
        return
      }

      this.name = data.name
      this.artist = data.artist

      this.playing = data.playing
      this.hasImage = !!data.albumCover

      if (this.hasImage && data.albumCover !== this.image) {
        this.image = data.albumCover!
      }
    }
  }
})
