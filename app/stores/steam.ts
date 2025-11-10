export const useSteam = defineStore('steam', {
  state: () => ({
    playing: false,
    name: '',
    image: '',
    hasImage: false
  }),

  actions: {
    updateFromSync(data: any) {
      this.playing = data?.playing ?? false

      if (!this.playing || !data?.game) {
        return
      }

      this.name = data.game.name
      const headerImage = `/api/steam/game-image/${data.game.id}`

      if (this.image !== headerImage) {
        this.hasImage = false
        this.hasImage = !!headerImage
        this.image = headerImage
      }
    }
  }
})
