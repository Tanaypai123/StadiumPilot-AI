export function logAiEvent(level, event, details = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...details,
  }

  console.log(JSON.stringify(payload))
}
