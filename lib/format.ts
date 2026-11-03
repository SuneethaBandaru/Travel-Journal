export type ProfileLite = {
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
}

export function fullName(
  p?: { first_name?: string | null; last_name?: string | null } | null,
  fallback = 'A traveler'
) {
  return [p?.first_name, p?.last_name].filter(Boolean).join(' ') || fallback
}

export function timeAgo(iso: string) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  const steps: [number, string][] = [
    [60 * 60 * 24 * 7, 'w'],
    [60 * 60 * 24, 'd'],
    [60 * 60, 'h'],
    [60, 'm'],
  ]
  for (const [size, unit] of steps) {
    if (seconds >= size) return `${Math.floor(seconds / size)}${unit}`
  }
  return `${seconds}s`
}
