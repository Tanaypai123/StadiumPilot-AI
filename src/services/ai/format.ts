export function formatBulletList(items: string[]) {
  return items.map((item) => `- ${item}`).join('\n')
}

export function formatAssistantText(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
}
