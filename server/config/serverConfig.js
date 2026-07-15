export function createServerConfig(env = process.env) {
  const portValue = Number(env.PORT || 3001)

  return {
    port: Number.isFinite(portValue) && portValue > 0 ? portValue : 3001,
  }
}
