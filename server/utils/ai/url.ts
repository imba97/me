export function stripTrailingSlash(s: string): string {
  return s.replace(/\/+$/, '')
}
