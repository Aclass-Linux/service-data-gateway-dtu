import type { ProjectOverviewData, ProjectProtocolItem } from '@/types/project-parser'

const DEFAULT_PROJECT_OVERVIEW: ProjectOverviewData = {
  projectName: '未导入',
  updatedAt: '--',
  detailSections: [],
}

function formatDateTime(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return '--'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('zh-CN', {
    hour12: false,
  })
}

function formatSectionLabel(key: string) {
  return key
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function resolveSectionLabel(key: string, value: unknown) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Record<string, unknown>

    if (typeof record.describe === 'string' && record.describe.trim()) {
      return record.describe
    }
  }

  return formatSectionLabel(key)
}

function resolveSectionData(value: unknown) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Record<string, unknown>

    if (Array.isArray(record.instances)) {
      return record.instances
    }
  }

  return value
}

function resolveSectionCount(value: unknown) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Record<string, unknown>

    if (Array.isArray(record.instances)) {
      return `数量：${record.instances.length}个`
    }
  }

  return '数量：0个'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return []

  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

function extractProtocolInstances(data: unknown) {
  if (!isRecord(data)) return []

  const protocol = data.protocol
  if (!isRecord(protocol)) return []

  return Array.isArray(protocol.instances) ? protocol.instances : []
}

/**
 * 项目解析模块的第一阶段能力：
 * 从项目 JSON 中提取首页概览信息。
 * 后续协议列表、字段定义等解析能力也可以继续收敛到这个模块里。
 */
export function resolveProjectOverview(data: unknown, sourceName: string): ProjectOverviewData {
  const overview: ProjectOverviewData = {
    ...DEFAULT_PROJECT_OVERVIEW,
    projectName: sourceName,
  }

  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>

    if (typeof record.project === 'string' && record.project.trim()) {
      overview.projectName = record.project
    }

    if (typeof record['updated-time'] === 'string') {
      overview.updatedAt = formatDateTime(record['updated-time'])
    }

    overview.detailSections = Object.entries(record)
      .filter(([key]) => !['project', 'updated-time'].includes(key))
      .map(([key, value]) => ({
        key,
        label: resolveSectionLabel(key, value),
        count: resolveSectionCount(value),
        data: resolveSectionData(value),
      }))

    return overview
  }

  overview.projectName = sourceName
  overview.updatedAt = '--'
  overview.detailSections = []
  return overview
}

export function createDefaultProjectOverview(): ProjectOverviewData {
  return { ...DEFAULT_PROJECT_OVERVIEW }
}

/**
 * 从项目 JSON 中提取协议列表。
 * 页面只依赖 name / owner / path 这些稳定字段，
 * 其他协议属性统一收敛到 raw，便于协议详情区继续原样展示。
 */
export function resolveProjectProtocols(data: unknown): ProjectProtocolItem[] {
  return extractProtocolInstances(data)
    .filter(isRecord)
    .map((item) => ({
      name: typeof item.name === 'string' && item.name.trim() ? item.name : '未命名协议',
      owner: toStringArray(item.owner),
      path: typeof item.path === 'string' ? item.path : '',
      raw: item,
    }))
}
