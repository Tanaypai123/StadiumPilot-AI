export function readStorageValue<T>(
  key: string,
  fallbackValue: T,
  parser: (value: string) => T = (value) => JSON.parse(value) as T,
) {
  if (typeof window === 'undefined') {
    return fallbackValue
  }

  try {
    const rawValue = window.localStorage.getItem(key)
    if (rawValue === null) {
      return fallbackValue
    }

    return parser(rawValue)
  } catch {
    return fallbackValue
  }
}

export function writeStorageValue<T>(
  key: string,
  value: T,
  serializer: (value: T) => string = (currentValue) => JSON.stringify(currentValue),
) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(key, serializer(value))
  } catch {
    // Ignore storage failures so the UI stays functional in restricted contexts.
  }
}

export function removeStorageValue(key: string) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.removeItem(key)
  } catch {
    // Ignore storage failures so the UI stays functional in restricted contexts.
  }
}
