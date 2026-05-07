import type { ProtocolSchema } from '@/types/protocol'

export function toDisplayValue(value: unknown): string {
  if (value === null) return 'null'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map((item) => toDisplayValue(item)).join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function deepCloneProtocol(data: ProtocolSchema): ProtocolSchema {
  return JSON.parse(JSON.stringify(data)) as ProtocolSchema
}

export function normalizeProtocol(data: unknown): ProtocolSchema {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {}
  const source = data as Record<string, unknown>
  const result: ProtocolSchema = { ...source }

  if (!Array.isArray(source.groups)) {
    result.groups = []
    return result
  }

  result.groups = source.groups.map((group, index) => {
    const groupObj = group && typeof group === 'object' ? (group as Record<string, unknown>) : {}
    const name = typeof groupObj.groupName === 'string' ? groupObj.groupName : `分组${index + 1}`
    const rawItems = Array.isArray(groupObj.items) ? groupObj.items : []

    return {
      groupName: name,
      items: rawItems.map((item, itemIndex) => {
        const itemObj = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
        const key = typeof itemObj.key === 'string' ? itemObj.key : `条目${itemIndex + 1}`
        return {
          key,
          value: itemObj.value,
        }
      }),
    }
  })

  return result
}
