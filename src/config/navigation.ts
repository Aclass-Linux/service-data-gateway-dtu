import type { Component } from 'vue'
import IconBookOpen from '~icons/lucide/book-open'
import IconBlocks from '~icons/lucide/blocks'
import IconDatabase from '~icons/lucide/database'
import IconHouse from '~icons/lucide/house'
import IconPlugZap from '~icons/lucide/plug-zap'
import IconWorkflow from '~icons/lucide/workflow'

export interface NavigationItem {
  label: string
  icon: Component
  to: string
}

// Centralize navigation config so layout and route-related UI can share one source of truth.
export const navigationItems: NavigationItem[] = [
  { label: '首页', icon: IconHouse, to: '/' },
  { label: '协议管理', icon: IconBlocks, to: '/protocols' },
  { label: '基础数据管理', icon: IconDatabase, to: '/data' },
  { label: '流程管理', icon: IconWorkflow, to: '/flows' },
  { label: '对外 API 管理', icon: IconPlugZap, to: '/apis' },
  { label: '知识库', icon: IconBookOpen, to: '/knowledge' },
]
