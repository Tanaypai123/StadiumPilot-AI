import { useEffect, useState } from 'react'

import { readStorageValue, writeStorageValue } from '@/lib/storage'

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  parser: (value: string) => T = (value) => JSON.parse(value) as T,
) {
  const [storedValue, setStoredValue] = useState<T>(() =>
    readStorageValue(key, initialValue, parser),
  )

  useEffect(() => {
    writeStorageValue(key, storedValue)
  }, [key, storedValue])

  return [storedValue, setStoredValue] as const
}
