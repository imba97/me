export interface AnimatedDelay {
  getNextDelay: () => number
  resetDelay: () => void
}

export const AnimatedDelayKey = Symbol('ANIMATED_DELAY')
