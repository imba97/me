export const useMusic = defineStore('music', {
  state: () => ({
    playing: false,
    name: '',
    artist: '',
    image: '',
    hasImage: false
  }),

  actions: {
    updateFromSync(data: any) {
      if (!data?.name || !data?.artist) {
        return
      }

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
