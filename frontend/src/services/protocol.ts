import type { ProtocolSchema, StackConfig } from '@/types/protocol'

const DRAFT_KEY_PREFIX = 'protocol-workbench-draft:'

export async function loadStackConfig(): Promise<StackConfig> {
  const response = await fetch('/config/protocol-stacks.json')
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return (await response.json()) as StackConfig
}

export async function loadProtocolSchema(filePath: string): Promise<ProtocolSchema> {
  const response = await fetch(filePath)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return (await response.json()) as ProtocolSchema
}

export function loadDraft(stackId: string): ProtocolSchema | null {
  const raw = window.localStorage.getItem(`${DRAFT_KEY_PREFIX}${stackId}`)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ProtocolSchema
  } catch {
    return null
  }
}

export function saveDraft(stackId: string, schema: ProtocolSchema): void {
  window.localStorage.setItem(`${DRAFT_KEY_PREFIX}${stackId}`, JSON.stringify(schema))
}

export function clearDraft(stackId: string): void {
  window.localStorage.removeItem(`${DRAFT_KEY_PREFIX}${stackId}`)
}
