export type StackItem = {
  id: string
  name: string
  version: string
  status: string
  summary: string
  filePath: string
}

export type StackConfig = {
  home: {
    name: string
    description: string
  }
  stacks: StackItem[]
}

export type ProtocolGroupItem = {
  key: string
  value: unknown
}

export type ProtocolGroup = {
  groupName: string
  items: ProtocolGroupItem[]
}

export type ProtocolSchema = {
  groups?: ProtocolGroup[]
  [key: string]: unknown
}
