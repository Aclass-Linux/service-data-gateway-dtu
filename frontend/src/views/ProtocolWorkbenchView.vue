<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  clearDraft,
  loadDraft,
  loadProtocolSchema,
  loadStackConfig,
  saveDraft,
} from '@/services/protocol'
import { deepCloneProtocol, normalizeProtocol, toDisplayValue } from '@/utils/protocol'
import type { ProtocolSchema, StackItem } from '@/types/protocol'

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
  items: {
    key: string
    value: string
    rawValue: unknown
  }[]
}

const loading = ref(false)
const error = ref('')
const stacks = ref<StackItem[]>([])

const tabs = ref<TabItem[]>([{ id: 'home', title: '首页', closable: false }])
const activeTabId = ref('home')
const keyword = ref('')

const tabJsonMap = ref<Record<string, ProtocolSchema>>({})
const tabOriginalMap = ref<Record<string, ProtocolSchema>>({})
const tabLoadingMap = ref<Record<string, boolean>>({})
const tabErrorMap = ref<Record<string, string>>({})
const tabMessageMap = ref<Record<string, string>>({})

const activeTab = computed(() => tabs.value.find((t) => t.id === activeTabId.value) || null)
const activeTabData = computed(() => tabJsonMap.value[activeTabId.value])
const activeTabLoading = computed(() => tabLoadingMap.value[activeTabId.value] || false)
const activeTabError = computed(() => tabErrorMap.value[activeTabId.value] || '')
const activeTabMessage = computed(() => tabMessageMap.value[activeTabId.value] || '')

const keywordNormalized = computed(() => keyword.value.trim().toLowerCase())

function setTabMessage(tabId: string, message: string) {
  tabMessageMap.value[tabId] = message
  window.setTimeout(() => {
    if (tabMessageMap.value[tabId] === message) {
      tabMessageMap.value[tabId] = ''
    }
  }, 1800)
}

async function loadConfig() {
  loading.value = true
  error.value = ''
  try {
    const config = await loadStackConfig()
    stacks.value = config.stacks
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
    const remote = normalizeProtocol(await loadProtocolSchema(filePath))
    tabOriginalMap.value[tabId] = deepCloneProtocol(remote)

    const draft = loadDraft(tabId)
    tabJsonMap.value[tabId] = draft ? normalizeProtocol(draft) : remote
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

function updateBaseValue(key: string, value: string) {
  const tabId = activeTabId.value
  const schema = tabJsonMap.value[tabId]
  if (!schema) return
  schema[key] = value
}

function updateGroupValue(groupIndex: number, itemIndex: number, value: string) {
  const tabId = activeTabId.value
  const schema = tabJsonMap.value[tabId]
  if (!schema?.groups?.[groupIndex]?.items?.[itemIndex]) return
  schema.groups[groupIndex].items[itemIndex].value = value
}

function saveActiveDraft() {
  const tabId = activeTabId.value
  if (tabId === 'home') return
  const schema = tabJsonMap.value[tabId]
  if (!schema) return

  saveDraft(tabId, schema)
  setTabMessage(tabId, '草稿已保存')
}

function resetActiveData() {
  const tabId = activeTabId.value
  if (tabId === 'home') return
  const original = tabOriginalMap.value[tabId]
  if (!original) return

  tabJsonMap.value[tabId] = deepCloneProtocol(original)
  clearDraft(tabId)
  setTabMessage(tabId, '已重置为原始配置')
}

const activeTabRows = computed<TableRow[]>(() => {
  const data = activeTabData.value
  if (!data || typeof data !== 'object' || Array.isArray(data)) return []

  return Object.entries(data)
    .filter(([key]) => key !== 'groups')
    .map(([key, value]) => ({
      key,
      value: toDisplayValue(value),
    }))
})

const activeGroupRows = computed<GroupRow[]>(() => {
  const data = activeTabData.value
  if (!data || typeof data !== 'object' || Array.isArray(data)) return []

  const groups = data.groups
  if (!Array.isArray(groups)) return []

  return groups.map((group) => ({
    groupName: group.groupName,
    items: group.items.map((item) => ({
      key: item.key,
      value: toDisplayValue(item.value),
      rawValue: item.value,
    })),
  }))
})

const filteredBaseRows = computed(() => {
  const kw = keywordNormalized.value
  if (!kw) return activeTabRows.value
  return activeTabRows.value.filter((row) => row.key.toLowerCase().includes(kw) || row.value.toLowerCase().includes(kw))
})

const filteredGroupRows = computed(() => {
  const kw = keywordNormalized.value
  if (!kw) return activeGroupRows.value

  return activeGroupRows.value
    .map((group) => ({
      groupName: group.groupName,
      items: group.items.filter((item) => item.key.toLowerCase().includes(kw) || item.value.toLowerCase().includes(kw)),
    }))
    .filter((group) => group.groupName.toLowerCase().includes(kw) || group.items.length > 0)
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

      <template v-else>
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
            <div v-for="stack in stacks" :key="stack.id" class="list-item">
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
          <div class="panel-head">
            <h3 class="panel-title">{{ activeTab.title }} 协议条目</h3>
            <div class="ops">
              <button class="small-btn" type="button" @click="saveActiveDraft">保存草稿</button>
              <button class="small-btn gray" type="button" @click="resetActiveData">重置</button>
            </div>
          </div>

          <p class="path" v-if="activeTab.filePath">文件地址：{{ activeTab.filePath }}</p>
          <p v-if="activeTabMessage" class="success">{{ activeTabMessage }}</p>

          <div class="filter-row">
            <input v-model="keyword" class="search" type="text" placeholder="搜索字段名或值" />
          </div>

          <p v-if="activeTabLoading" class="hint">正在加载 JSON...</p>
          <p v-else-if="activeTabError" class="error">{{ activeTabError }}</p>
          <p v-else-if="filteredBaseRows.length === 0 && filteredGroupRows.length === 0" class="hint">暂无匹配条目</p>

          <table v-else-if="filteredBaseRows.length > 0" class="protocol-table">
            <thead>
              <tr>
                <th>字段</th>
                <th>值（可编辑）</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredBaseRows" :key="row.key">
                <td class="key-col">{{ row.key }}</td>
                <td>
                  <input
                    class="edit-input"
                    :value="row.value"
                    type="text"
                    @change="updateBaseValue(row.key, ($event.target as HTMLInputElement).value)"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="filteredGroupRows.length > 0" class="group-section">
            <div v-for="(group, groupIndex) in filteredGroupRows" :key="group.groupName" class="group-card">
              <h4 class="group-title">{{ group.groupName }}</h4>
              <table class="protocol-table">
                <thead>
                  <tr>
                    <th>条目</th>
                    <th>值（可编辑）</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, itemIndex) in group.items" :key="item.key">
                    <td class="key-col">{{ item.key }}</td>
                    <td>
                      <input
                        class="edit-input"
                        :value="item.value"
                        type="text"
                        @change="updateGroupValue(groupIndex, itemIndex, ($event.target as HTMLInputElement).value)"
                      />
                    </td>
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
.success { color: #00a870; margin: 8px 0; }

.tabs {
  display: flex;
  align-items: flex-end;
  gap: 1px;
  background: #f3f4f6;
  border: 1px solid #e6e8eb;
  border-radius: 6px 6px 0 0;
  padding: 4px 4px 0;
}

.tab {
  display: flex;
  align-items: center;
  border: 1px solid #d8dee4;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  background: #f8f9fb;
  height: 34px;
}
.tab.active {
  background: #fff;
  border-color: #ff8a00;
}

.tab-title {
  border: none;
  background: transparent;
  height: 100%;
  padding: 0 12px;
  cursor: pointer;
  color: #333;
}
.tab-close {
  border: none;
  background: transparent;
  width: 26px;
  height: 26px;
  cursor: pointer;
  color: #777;
}

.panel {
  border: 1px solid #e6e8eb;
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 14px;
}
.panel-title { margin: 0 0 10px; }
.path { margin: 0 0 10px; font-size: 13px; color: #8b949e; }

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.ops {
  display: flex;
  gap: 8px;
}

.small-btn {
  height: 30px;
  border: 1px solid #ff8a00;
  background: #fff7ed;
  color: #ff8a00;
  border-radius: 4px;
  padding: 0 10px;
  cursor: pointer;
}

.small-btn.gray {
  border-color: #d0d7de;
  background: #fff;
  color: #5f6873;
}

.filter-row {
  margin: 10px 0;
}

.search {
  width: 280px;
  max-width: 100%;
  height: 32px;
  border: 1px solid #d0d7de;
  border-radius: 4px;
  padding: 0 10px;
}

.list {
  display: grid;
  gap: 10px;
}
.list-item {
  border: 1px solid #e6e8eb;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.item-main { min-width: 0; }
.item-name { font-weight: 700; color: #1f2937; }
.item-meta { margin-top: 4px; color: #5f6873; font-size: 13px; }
.item-summary { margin-top: 6px; color: #4b5563; font-size: 14px; }
.item-path { margin-top: 6px; color: #8b949e; font-size: 12px; }
.open-btn {
  height: 32px;
  border: 1px solid #ff8a00;
  background: #ff8a00;
  color: #fff;
  border-radius: 4px;
  padding: 0 12px;
  cursor: pointer;
}

.protocol-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e6e8eb;
  margin-bottom: 12px;
}
.protocol-table th,
.protocol-table td {
  border: 1px solid #e6e8eb;
  padding: 8px 10px;
  text-align: left;
  vertical-align: top;
}
.protocol-table th { background: #f8f9fb; }
.key-col { width: 220px; font-weight: 600; }

.edit-input {
  width: 100%;
  height: 30px;
  border: 1px solid #d0d7de;
  border-radius: 4px;
  padding: 0 8px;
}

.group-section {
  display: grid;
  gap: 12px;
}
.group-card {
  border: 1px solid #e6e8eb;
  border-radius: 6px;
  padding: 10px;
  background: #fcfdff;
}
.group-title {
  margin: 0 0 8px;
  font-size: 15px;
}
</style>
