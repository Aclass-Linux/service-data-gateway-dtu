<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProjectStore } from '@/stores/project'
import type { ProjectProtocolItem } from '@/types/project-parser'

/**
 * 协议管理页使用标签页工作区：
 * 1. 固定首页签展示全部协议概览
 * 2. 点击协议的打开按钮后，为该协议创建独立标签
 * 3. 如果协议标签已经存在，则直接切换过去
 */
const projectStore = useProjectStore()
const overviewTabId = 'overview'

const projectName = computed(() => projectStore.overview.projectName)
const updatedAt = computed(() => projectStore.overview.updatedAt)
const protocols = computed(() => projectStore.protocols)
const hasImportedData = computed(() => Boolean(projectStore.rawProjectData))

interface ProtocolTabItem {
  id: string
  title: string
  protocol: ProjectProtocolItem
}

const openedProtocolTabs = ref<ProtocolTabItem[]>([])
const activeTabId = ref(overviewTabId)

function createProtocolTabId(protocol: ProjectProtocolItem) {
  return protocol.path.trim() || protocol.name.trim()
}

function openProtocolTab(protocol: ProjectProtocolItem) {
  const tabId = createProtocolTabId(protocol)
  const existingTab = openedProtocolTabs.value.find((tab) => tab.id === tabId)

  if (!existingTab) {
    openedProtocolTabs.value.push({
      id: tabId,
      title: protocol.name || '未命名协议',
      protocol,
    })
  }

  activeTabId.value = tabId
}

function activateTab(tabId: string) {
  activeTabId.value = tabId
}

function closeProtocolTab(tabId: string) {
  const nextTabs = openedProtocolTabs.value.filter((tab) => tab.id !== tabId)
  openedProtocolTabs.value = nextTabs

  if (activeTabId.value === tabId) {
    activeTabId.value = overviewTabId
  }
}

const activeProtocolTab = computed(() =>
  openedProtocolTabs.value.find((tab) => tab.id === activeTabId.value),
)

function formatProtocolFieldValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.length ? value.join('、') : '--'
  }

  if (value && typeof value === 'object') {
    return JSON.stringify(value)
  }

  if (value === '' || value === null || value === undefined) {
    return '--'
  }

  return String(value)
}
</script>

<template>
  <section class="protocols-page">
    <article class="content-card tabs-card">
      <div class="tabs-bar">
        <button
          type="button"
          class="tab-button"
          :class="{ active: activeTabId === overviewTabId }"
          @click="activateTab(overviewTabId)"
        >
          <span>协议概览</span>
          <small>固定</small>
        </button>

        <button
          v-for="tab in openedProtocolTabs"
          :key="tab.id"
          type="button"
          class="tab-button closable-tab"
          :class="{ active: activeTabId === tab.id }"
          @click="activateTab(tab.id)"
        >
          <span>{{ tab.title }}</span>
          <span
            class="tab-close"
            role="button"
            tabindex="0"
            @click.stop="closeProtocolTab(tab.id)"
            @keydown.enter.stop="closeProtocolTab(tab.id)"
          >
            ×
          </span>
        </button>
      </div>

      <section v-if="activeTabId === overviewTabId" class="tab-panel overview-panel">
        <div class="panel-head">
          <div>
            <p class="card-kicker">Summary</p>
            <h3>协议概览</h3>
          </div>
          <span class="panel-tag">{{ hasImportedData ? '已接入' : '未导入' }}</span>
        </div>

        <div class="summary-list">
          <div class="summary-item">
            <span>项目名称</span>
            <strong>{{ projectName }}</strong>
          </div>
          <div class="summary-item">
            <span>协议数量</span>
            <strong>{{ protocols.length }}个</strong>
          </div>
          <div class="summary-item">
            <span>最近更新</span>
            <strong>{{ updatedAt }}</strong>
          </div>
        </div>

        <div class="panel-head list-head">
          <div>
            <p class="card-kicker">List</p>
            <h3>全部协议</h3>
          </div>
          <span class="panel-tag">{{ protocols.length }}个协议</span>
        </div>

        <div v-if="protocols.length" class="protocol-list">
          <article
            v-for="protocol in protocols"
            :key="`${protocol.name}-${protocol.path}`"
            class="protocol-item"
          >
            <div class="protocol-meta">
              <strong>{{ protocol.name }}</strong>
              <span>所属板卡：{{ protocol.owner.length ? protocol.owner.join('、') : '--' }}</span>
              <span>协议路径：{{ protocol.path || '--' }}</span>
            </div>

            <button type="button" class="open-button" @click="openProtocolTab(protocol)">
              打开
            </button>
          </article>
        </div>
        <p v-else class="panel-placeholder">当前还没有可展示的协议数据，请先在首页导入项目 JSON。</p>
      </section>

      <section v-else-if="activeProtocolTab" class="tab-panel">
        <div class="panel-head">
          <div>
            <p class="card-kicker">Protocol</p>
            <h3>{{ activeProtocolTab.title }}</h3>
          </div>
          <span class="panel-tag">已打开</span>
        </div>

        <div class="protocol-inline-summary">
          <div class="inline-item">
            <span>协议名称</span>
            <strong>{{ activeProtocolTab.protocol.name }}</strong>
          </div>
          <div class="inline-item">
            <span>所属板卡</span>
            <strong>{{
              activeProtocolTab.protocol.owner.length
                ? activeProtocolTab.protocol.owner.join('、')
                : '--'
            }}</strong>
          </div>
          <div class="inline-item inline-item-wide">
            <span>协议路径</span>
            <strong>{{ activeProtocolTab.protocol.path || '--' }}</strong>
          </div>
        </div>

        <div class="raw-section">
          <div class="panel-head">
            <div>
              <p class="card-kicker">Protocol Content</p>
              <h3>{{ activeProtocolTab.protocol.path || '协议内容' }}</h3>
            </div>
          </div>

          <div class="table-shell">
            <table class="protocol-table">
              <thead>
                <tr>
                  <th>字段</th>
                  <th>内容</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="([fieldKey, fieldValue]) in Object.entries(activeProtocolTab.protocol.raw)"
                  :key="fieldKey"
                >
                  <td class="field-key">{{ fieldKey }}</td>
                  <td class="field-value">{{ formatProtocolFieldValue(fieldValue) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </article>
  </section>
</template>

<style scoped>
.protocols-page {
  display: grid;
  gap: 18px;
}

.content-card {
  padding: 26px 28px;
  border: 1px solid rgba(223, 230, 244, 0.95);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 16px 40px rgba(195, 205, 226, 0.1);
}

.tabs-card {
  padding: 0;
  overflow: hidden;
}

.summary-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.summary-item,
.protocol-meta {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, #f8faff, #eff4fd);
}

.summary-item span,
.protocol-meta span {
  color: #70809b;
  line-height: 1.6;
}

.summary-item strong,
.protocol-meta strong {
  color: #273248;
  font-size: 1rem;
  font-weight: 700;
}

.protocol-list {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.card-kicker {
  color: #9aa6bd;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.panel-head h3 {
  margin-top: 8px;
  color: #273248;
  font-weight: 700;
}

.panel-head h3 {
  font-size: 1.18rem;
}

.panel-placeholder {
  color: #6e7c96;
  line-height: 1.7;
}

.tabs-bar {
  display: flex;
  align-items: stretch;
  overflow-x: auto;
  background: #eef2f8;
  border-bottom: 1px solid rgba(213, 221, 236, 0.95);
}

.tab-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  min-width: 0;
  padding: 0 16px;
  height: 46px;
  border: none;
  border-right: 1px solid rgba(213, 221, 236, 0.95);
  border-radius: 0;
  background: transparent;
  color: #5f6d84;
  font-size: 0.92rem;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.tab-button small {
  color: #8c9ab0;
  font-size: 0.74rem;
}

.tab-button.active {
  background: #ffffff;
  color: #243147;
}

.tab-button.active::before {
  content: '';
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 2px;
  background: #2f80ed;
}

.closable-tab {
  padding-right: 12px;
}

.tab-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  color: #8a97ab;
  font-size: 0.9rem;
}

.tab-close:hover {
  background: rgba(223, 230, 244, 0.9);
  color: #465369;
}

.tab-panel {
  display: grid;
  gap: 18px;
  padding: 22px 28px 26px;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.list-head {
  margin-top: 8px;
}

.panel-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: #f2f5fb;
  color: #7b89a3;
  font-size: 0.82rem;
  font-weight: 600;
  white-space: nowrap;
}

.protocol-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
}

.open-button {
  padding: 11px 16px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #ffaf58, #ff8930);
  color: #fff;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(255, 157, 68, 0.16);
}

.protocol-inline-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 18px;
  padding: 14px 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, #f8faff, #eff4fd);
}

.inline-item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: #70809b;
  line-height: 1.6;
}

.inline-item span {
  flex: 0 0 auto;
  color: #70809b;
  font-size: 0.88rem;
}

.inline-item strong {
  min-width: 0;
  color: #273248;
  font-size: 0.94rem;
  font-weight: 700;
  word-break: break-word;
}

.inline-item-wide {
  flex: 1 1 320px;
}

.raw-section {
  display: grid;
  gap: 12px;
}

.table-shell {
  overflow: hidden;
  border: 1px solid rgba(223, 230, 244, 0.95);
  border-radius: 16px;
  background: #fbfcff;
}

.protocol-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.protocol-table thead th {
  padding: 10px 14px;
  border-bottom: 1px solid rgba(223, 230, 244, 0.95);
  background: #f4f7fc;
  color: #7f8ca2;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-align: left;
}

.protocol-table tbody td {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(236, 240, 248, 0.95);
  color: #425066;
  font-size: 0.9rem;
  line-height: 1.65;
  vertical-align: top;
}

.protocol-table tbody tr:last-child td {
  border-bottom: none;
}

.field-key {
  width: 180px;
  color: #6d7b93;
  font-weight: 600;
}

.field-value {
  overflow: auto;
  word-break: break-word;
}

@media (max-width: 720px) {
  .content-card {
    border-radius: 22px;
  }

  .tab-button {
    padding: 0 12px;
    height: 42px;
  }

  .tab-panel {
    padding: 18px;
  }

  .summary-list,
  .protocol-item {
    grid-template-columns: 1fr;
  }

  .protocol-inline-summary {
    flex-direction: column;
    align-items: flex-start;
  }

  .inline-item {
    display: grid;
    gap: 4px;
  }

  .open-button {
    width: 100%;
  }
}
</style>
