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

type TableRow = {
  key: string
  value: string
}

const loadingConfig = ref(false)
const loadingData = ref(false)
const error = ref('')

const stacks = ref<StackItem[]>([])
const selectedId = ref('')
const selectedData = ref<unknown>(null)

function toDisplayValue(value: unknown): string {
  if (value === null) return 'null'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map((item) => toDisplayValue(item)).join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const selectedStack = computed(() => stacks.value.find((s) => s.id === selectedId.value) || null)

const baseRows = computed<TableRow[]>(() => {
  if (!selectedData.value || typeof selectedData.value !== 'object' || Array.isArray(selectedData.value)) return []
  return Object.entries(selectedData.value as Record<string, unknown>)
    .filter(([key]) => key !== 'groups')
    .map(([key, value]) => ({ key, value: toDisplayValue(value) }))
})

const groupRows = computed(() => {
  if (!selectedData.value || typeof selectedData.value !== 'object' || Array.isArray(selectedData.value)) return []
  const groups = (selectedData.value as Record<string, unknown>).groups
  if (!Array.isArray(groups)) return []

  return groups.map((group, index) => {
    const groupObj = (group && typeof group === 'object') ? (group as Record<string, unknown>) : {}
    const groupName = typeof groupObj.groupName === 'string' ? groupObj.groupName : `分组${index + 1}`
    const items = Array.isArray(groupObj.items) ? groupObj.items : []

    return {
      groupName,
      items: items.map((item, itemIndex) => {
        const itemObj = (item && typeof item === 'object') ? (item as Record<string, unknown>) : {}
        const key = typeof itemObj.key === 'string' ? itemObj.key : `条目${itemIndex + 1}`
        const value = toDisplayValue(itemObj.value)
        return { key, value }
      }),
    }
  })
})

async function loadStacks() {
  loadingConfig.value = true
  error.value = ''
  try {
    const response = await fetch('/config/protocol-stacks.json')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const config = (await response.json()) as StackConfig
    stacks.value = config.stacks
    if (config.stacks.length > 0) {
      selectedId.value = config.stacks[0]!.id
      await loadSelectedData()
    }
  } catch (err) {
    error.value = '读取协议栈清单失败，请检查 /public/config/protocol-stacks.json。'
    console.error(err)
  } finally {
    loadingConfig.value = false
  }
}

async function loadSelectedData() {
  if (!selectedStack.value) return
  loadingData.value = true
  error.value = ''
  try {
    const response = await fetch(selectedStack.value.filePath)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    selectedData.value = await response.json()
  } catch (err) {
    error.value = `读取协议数据失败：${selectedStack.value?.filePath || ''}`
    console.error(err)
  } finally {
    loadingData.value = false
  }
}

onMounted(() => {
  void loadStacks()
})
</script>

<template>
  <section class="page-wrap">
    <div class="card">
      <h2>协议数据读取测试</h2>
      <p class="desc">用于单独验证协议 JSON 是否可正常读取和解析。</p>

      <p v-if="loadingConfig" class="hint">正在加载协议清单...</p>
      <p v-if="error" class="error">{{ error }}</p>

      <div v-if="stacks.length > 0" class="toolbar">
        <label for="stack-select">选择协议：</label>
        <select id="stack-select" v-model="selectedId" @change="loadSelectedData">
          <option v-for="stack in stacks" :key="stack.id" :value="stack.id">{{ stack.name }}</option>
        </select>
        <button class="btn" type="button" :disabled="loadingData" @click="loadSelectedData">
          {{ loadingData ? '读取中...' : '重新读取' }}
        </button>
      </div>

      <div v-if="selectedStack" class="meta">文件地址：{{ selectedStack.filePath }}</div>

      <p v-if="loadingData" class="hint">正在加载协议数据...</p>

      <table v-if="!loadingData && baseRows.length > 0" class="protocol-table">
        <thead>
          <tr><th>字段</th><th>值</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in baseRows" :key="row.key">
            <td class="key-col">{{ row.key }}</td>
            <td>{{ row.value }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="!loadingData && groupRows.length > 0" class="groups">
        <div v-for="group in groupRows" :key="group.groupName" class="group-card">
          <h3>{{ group.groupName }}</h3>
          <table class="protocol-table">
            <thead>
              <tr><th>条目</th><th>值</th></tr>
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
  </section>
</template>

<style scoped>
.page-wrap { padding: 16px; }
.card { background: #fff; border: 1px solid #e6e8eb; border-radius: 8px; padding: 16px; }
h2 { margin: 0 0 8px; }
.desc { margin: 0 0 12px; color: #66707c; }
.hint { color: #5f6873; }
.error { color: #c0392b; }
.toolbar { display: flex; align-items: center; gap: 10px; margin: 10px 0; }
.toolbar select { height: 32px; border: 1px solid #d0d7de; border-radius: 4px; padding: 0 8px; }
.btn { height: 32px; border: 1px solid #ff8a00; background: #fff7ed; color: #ff8a00; border-radius: 4px; padding: 0 12px; cursor: pointer; }
.meta { font-size: 13px; color: #8b949e; margin-bottom: 8px; }
.protocol-table { width: 100%; border-collapse: collapse; border: 1px solid #e6e8eb; margin-bottom: 10px; }
.protocol-table th, .protocol-table td { border: 1px solid #e6e8eb; padding: 8px 10px; text-align: left; }
.protocol-table th { background: #f8f9fb; }
.key-col { width: 220px; font-weight: 600; }
.groups { display: grid; gap: 12px; margin-top: 8px; }
.group-card { border: 1px solid #e6e8eb; border-radius: 6px; padding: 10px; background: #fcfdff; }
.group-card h3 { margin: 0 0 8px; font-size: 15px; }
</style>
