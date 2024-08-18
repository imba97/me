import useNavidromeCover from '~/composables/navidrome/useNavidromeCover'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  return await useNavidromeCover(id)
})
