<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

type StackItem = {
  id: string
  name: string
  version: string
  status: string
  summary: string
  filePath: string
}

type StackConfig = {
  home: {
    name: string
    description: string
  }
  stacks: StackItem[]
}

type TabItem = {
  id: string
  title: string
  closable: boolean
  filePath?: string
}

type TableRow = {
  key: string
  value: string
}

type GroupRow = {
  groupName: string
  items: TableRow[]
}

const loading = ref(false)
const error = ref('')
const config = ref<StackConfig | null>(null)

const tabs = ref<TabItem[]>([{ id: 'home', title: '首页', closable: false }])
const activeTabId = ref('home')

const tabJsonMap = ref<Record<string, unknown>>({})
const tabLoadingMap = ref<Record<string, boolean>>({})
const tabErrorMap = ref<Record<string, string>>({})

async function loadConfig() {
  loading.value = true
  error.value = ''
  try {
    const response = await fetch('/config/protocol-stacks.json')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    config.value = (await response.json()) as StackConfig
  } catch (err) {
    error.value = '协议栈配置读取失败，请检查 /public/config/protocol-stacks.json。'
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function loadTabJson(tabId: string, filePath: string) {
  tabLoadingMap.value[tabId] = true
  tabErrorMap.value[tabId] = ''
  try {
    const response = await fetch(filePath)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    tabJsonMap.value[tabId] = data
  } catch (err) {
    tabErrorMap.value[tabId] = `读取失败：${filePath}`
    console.error(err)
  } finally {
    tabLoadingMap.value[tabId] = false
  }
}

async function openStackTab(stack: StackItem) {
  const exists = tabs.value.find((t) => t.id === stack.id)
  if (exists) {
    activeTabId.value = stack.id
    return
  }

  tabs.value.push({
    id: stack.id,
    title: stack.name,
    closable: true,
    filePath: stack.filePath,
  })
  activeTabId.value = stack.id
  await loadTabJson(stack.id, stack.filePath)
}

function switchTab(id: string) {
  activeTabId.value = id
}

function closeTab(id: string) {
  if (id === 'home') return
  const index = tabs.value.findIndex((t) => t.id === id)
  if (index === -1) return

  const isActive = activeTabId.value === id
  tabs.value.splice(index, 1)

  if (isActive) {
    activeTabId.value = tabs.value[index - 1]?.id || 'home'
  }
}

function toDisplayValue(value: unknown): string {
  if (value === null) return 'null'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map((item) => toDisplayValue(item)).join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const activeTab = computed(() => tabs.value.find((t) => t.id === activeTabId.value) || null)
const activeTabData = computed(() => tabJsonMap.value[activeTabId.value])
const activeTabLoading = computed(() => tabLoadingMap.value[activeTabId.value] || false)
const activeTabError = computed(() => tabErrorMap.value[activeTabId.value] || '')

const activeTabRows = computed<TableRow[]>(() => {
  const data = activeTabData.value
  if (!data || typeof data !== 'object' || Array.isArray(data)) return []

  return Object.entries(data as Record<string, unknown>)
    .filter(([key]) => key !== 'groups')
    .map(([key, value]) => ({
      key,
      value: toDisplayValue(value),
    }))
})

const activeGroupRows = computed<GroupRow[]>(() => {
  const data = activeTabData.value
  if (!data || typeof data !== 'object' || Array.isArray(data)) return []

  const groups = (data as Record<string, unknown>).groups
  if (!Array.isArray(groups)) return []

  return groups.map((group, index) => {
    const groupObj = (group && typeof group === 'object') ? (group as Record<string, unknown>) : {}
    const groupName = typeof groupObj.groupName === 'string' ? groupObj.groupName : `分组${index + 1}`
    const rawItems = Array.isArray(groupObj.items) ? groupObj.items : []

    const items = rawItems.map((item, itemIndex) => {
      const itemObj = (item && typeof item === 'object') ? (item as Record<string, unknown>) : {}
      const key = typeof itemObj.key === 'string' ? itemObj.key : `条目${itemIndex + 1}`
      const value = toDisplayValue(itemObj.value)
      return { key, value }
    })

    return { groupName, items }
  })
})

onMounted(() => {
  void loadConfig()
})
</script>

<template>
  <section class="page-wrap">
    <div class="card">
      <p v-if="loading" class="hint">正在加载协议栈配置...</p>
      <p v-else-if="error" class="error">{{ error }}</p>

      <template v-else-if="config">
        <div class="tabs">
          <div
            v-for="tab in tabs"
            :key="tab.id"
            class="tab"
            :class="{ active: tab.id === activeTabId }"
          >
            <button class="tab-title" type="button" @click="switchTab(tab.id)">{{ tab.title }}</button>
            <button v-if="tab.closable" class="tab-close" type="button" @click="closeTab(tab.id)">×</button>
          </div>
        </div>

        <div class="panel" v-if="activeTabId === 'home'">
          <h3 class="panel-title">打开协议栈标签</h3>

          <div class="list">
            <div v-for="stack in config.stacks" :key="stack.id" class="list-item">
              <div class="item-main">
                <div class="item-name">{{ stack.name }}</div>
                <div class="item-meta">版本 {{ stack.version }} | 状态 {{ stack.status }}</div>
                <div class="item-summary">{{ stack.summary }}</div>
                <div class="item-path">文件地址：{{ stack.filePath }}</div>
              </div>
              <button class="open-btn" type="button" @click="openStackTab(stack)">打开</button>
            </div>
          </div>
        </div>

        <div class="panel" v-else-if="activeTab">
          <h3 class="panel-title">{{ activeTab.title }} 协议条目</h3>
          <p class="path" v-if="activeTab.filePath">文件地址：{{ activeTab.filePath }}</p>
          <p v-if="activeTabLoading" class="hint">正在加载 JSON...</p>
          <p v-else-if="activeTabError" class="error">{{ activeTabError }}</p>
          <p v-else-if="activeTabRows.length === 0 && activeGroupRows.length === 0" class="hint">暂无可展示条目</p>

          <table v-else-if="activeTabRows.length > 0" class="protocol-table">
            <thead>
              <tr>
                <th>字段</th>
                <th>值</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in activeTabRows" :key="row.key">
                <td class="key-col">{{ row.key }}</td>
                <td>{{ row.value }}</td>
              </tr>
            </tbody>
          </table>

          <div v-if="activeGroupRows.length > 0" class="group-section">
            <div v-for="group in activeGroupRows" :key="group.groupName" class="group-card">
              <h4 class="group-title">{{ group.groupName }}</h4>
              <table class="protocol-table">
                <thead>
                  <tr>
                    <th>条目</th>
                    <th>值</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in group.items" :key="item.key">
                    <td class="key-col">{{ item.key }}</td>
                    <td>{{ item.value }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.page-wrap { padding: 16px; }
.card { background: #fff; border: 1px solid #e6e8eb; border-radius: 8px; padding: 18px; }
.hint { color: #5f6873; }
.error { color: #c0392b; }

.tabs {
  display: flex;
  align-items: flex-end;
  gap: 1px;
  background: #f3f4f6;
  border: 1px solid #e6e8eb;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  padding: 0 6px;
  overflow-x: auto;
}
.tab {
  display: flex;
  align-items: center;
  background: #eef0f3;
  color: #5b6570;
  min-height: 36px;
  border-top: 2px solid transparent;
}
.tab.active {
  background: #fff;
  color: #222;
  border-top-color: #ff8a00;
}
.tab-title {
  border: none;
  background: transparent;
  color: inherit;
  height: 34px;
  padding: 0 12px;
  cursor: pointer;
  white-space: nowrap;
}
.tab-close {
  border: none;
  background: transparent;
  color: inherit;
  width: 26px;
  height: 26px;
  margin-right: 4px;
  border-radius: 4px;
  cursor: pointer;
}
.tab-close:hover { background: #e8ebef; }

.panel {
  border: 1px solid #e6e8eb;
  border-top: none;
  background: #fff;
  color: #1f2937;
  border-radius: 0 0 6px 6px;
  padding: 14px;
}
.panel-title { margin: 0 0 10px; font-size: 16px; color: #111; }
.path { margin: 0 0 10px; color: #66707c; font-size: 13px; }

.list { display: grid; gap: 10px; }
.list-item {
  border: 1px solid #e6e8eb;
  border-radius: 6px;
  padding: 10px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.item-main { min-width: 0; }
.item-name { font-weight: 600; margin-bottom: 4px; }
.item-meta { font-size: 13px; color: #66707c; margin-bottom: 4px; }
.item-summary { color: #3f4852; margin-bottom: 4px; }
.item-path { font-size: 12px; color: #8b949e; word-break: break-all; }
.open-btn {
  border: 1px solid #ff8a00;
  background: #fff7ed;
  color: #ff8a00;
  border-radius: 4px;
  height: 30px;
  padding: 0 12px;
  cursor: pointer;
}

.protocol-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e6e8eb;
}
.protocol-table th,
.protocol-table td {
  border: 1px solid #e6e8eb;
  padding: 8px 10px;
  text-align: left;
  vertical-align: top;
}
.protocol-table th {
  background: #f8f9fb;
  color: #374151;
}
.key-col {
  width: 220px;
  font-weight: 600;
  color: #111827;
}

.group-section { margin-top: 12px; display: grid; gap: 12px; }
.group-card {
  border: 1px solid #e6e8eb;
  border-radius: 6px;
  padding: 10px;
  background: #fcfdff;
}
.group-title {
  margin: 0 0 8px;
  font-size: 14px;
  color: #1f2937;
}
</style>
