export interface ProjectDetailSection {
  key: string
  label: string
  count: string
  data: unknown
}

/**
 * 协议管理页先抽取一组稳定字段供列表和筛选使用，
 * 其余扩展字段统一保留在 raw 中，避免协议 JSON 一变就要改页面。
 */
export interface ProjectProtocolItem {
  name: string
  owner: string[]
  path: string
  raw: Record<string, unknown>
}

export interface ProjectOverviewData {
  projectName: string
  updatedAt: string
  detailSections: ProjectDetailSection[]
}
