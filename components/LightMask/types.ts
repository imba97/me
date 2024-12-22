export const LIGHT_MASK_KEY = Symbol('light-mask')

export interface LightMaskProvide {
  src: ComputedRef<string>
  size?: [number, number]
}
