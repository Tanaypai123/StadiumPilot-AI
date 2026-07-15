type CacheRecord<T> = {
  value: T
  expiresAt: number
}

const cache = new Map<string, CacheRecord<unknown>>()

export function getCachedValue<T>(key: string) {
  const entry = cache.get(key) as CacheRecord<T> | undefined
  if (!entry) {
    return undefined
  }

  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return undefined
  }

  return entry.value
}

export function setCachedValue<T>(key: string, value: T, ttlMs: number) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  })
}
