declare const LA: any

export function initAnalytics() {
  if (!(window as any)?.LA) {
    return
  }

  LA.init({ id: 'KWE6mms5kDyn0BZQ', ck: 'KWE6mms5kDyn0BZQ' })
}
