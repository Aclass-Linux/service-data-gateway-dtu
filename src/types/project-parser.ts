export interface ProjectDetailSection {
  key: string
  label: string
  count: string
  data: unknown
}

export interface ProjectOverviewData {
  projectName: string
  updatedAt: string
  detailSections: ProjectDetailSection[]
}
