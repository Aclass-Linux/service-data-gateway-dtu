<script setup lang="ts">
import { ref } from 'vue'
import IconCloudDownload from '~icons/lucide/cloud-download'
import IconFolderOpen from '~icons/lucide/folder-open'
import LocalJsonImportModal from '@/components/home/LocalJsonImportModal.vue'

const showLocalImportModal = ref(false)
const importedJsonData = ref<unknown>(null)
const overviewSource = ref('未导入')
const overviewCount = ref('0')
const overviewRemoteStatus = ref('未连接')
const overviewUpdatedAt = ref('--')

function openLocalImportModal() {
  showLocalImportModal.value = true
}

function closeLocalImportModal() {
  showLocalImportModal.value = false
}

function formatDateTime(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return '--'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('zh-CN', {
    hour12: false,
  })
}

function updateOverviewFromJson(data: unknown, fileName: string) {
  importedJsonData.value = data
  overviewSource.value = fileName

  if (Array.isArray(data)) {
    overviewCount.value = String(data.length)
    overviewRemoteStatus.value = '本地导入'
    overviewUpdatedAt.value = '--'

    const lastItem = data[data.length - 1]
    if (
      lastItem &&
      typeof lastItem === 'object' &&
      'updatedAt' in lastItem &&
      typeof lastItem.updatedAt === 'string'
    ) {
      overviewUpdatedAt.value = formatDateTime(lastItem.updatedAt)
    }
    return
  }

  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>

    if (Array.isArray(record.records)) {
      overviewCount.value = String(record.records.length)
    } else {
      overviewCount.value = String(Object.keys(record).length)
    }

    if (typeof record.remoteStatus === 'string' && record.remoteStatus.trim()) {
      overviewRemoteStatus.value = record.remoteStatus
    } else if (typeof record.source === 'string' && record.source.trim()) {
      overviewRemoteStatus.value = record.source
    } else {
      overviewRemoteStatus.value = '本地导入'
    }

    if (typeof record.updatedAt === 'string') {
      overviewUpdatedAt.value = formatDateTime(record.updatedAt)
    } else {
      overviewUpdatedAt.value = '--'
    }
    return
  }

  overviewCount.value = '0'
  overviewRemoteStatus.value = '未知'
  overviewUpdatedAt.value = '--'
}

function handleLocalJsonImported(payload: { fileName: string; jsonText: string; data: unknown }) {
  updateOverviewFromJson(payload.data, payload.fileName)
}
</script>

<template>
  <section class="page-content">
    <article class="content-card import-card">
      <div class="card-head">
        <div>
          <p class="card-kicker">Import</p>
          <h2>数据导入</h2>
        </div>
        <p class="card-desc">提供本地 JSON 和远程 JSON 两种导入入口。</p>
      </div>

      <div class="import-actions">
        <button type="button" class="action-button primary-action" @click="openLocalImportModal">
          <IconFolderOpen class="action-icon" />
          <span>导入本地 JSON</span>
        </button>

        <button type="button" class="action-button secondary-action">
          <IconCloudDownload class="action-icon" />
          <span>导入远程 JSON</span>
        </button>
      </div>
    </article>

    <article class="content-card overview-card">
      <div class="card-head">
        <div>
          <p class="card-kicker">Overview</p>
          <h2>概览</h2>
        </div>
        <p class="card-desc">这里用于展示当前数据导入、协议接入和运行概况。</p>
      </div>

      <div class="overview-grid">
        <div class="overview-item">
          <p>数据来源</p>
          <strong>{{ overviewSource }}</strong>
        </div>
        <div class="overview-item">
          <p>记录数量</p>
          <strong>{{ overviewCount }}</strong>
        </div>
        <div class="overview-item">
          <p>远程状态</p>
          <strong>{{ overviewRemoteStatus }}</strong>
        </div>
        <div class="overview-item">
          <p>更新时间</p>
          <strong>{{ overviewUpdatedAt }}</strong>
        </div>
      </div>

      <div class="overview-placeholder">
        <p v-if="importedJsonData">已根据导入的 JSON 自动更新概览信息。</p>
        <p v-else>后续可以在这里接入表格摘要、最新导入结果、远程拉取状态和数据统计信息。</p>
      </div>
    </article>

    <LocalJsonImportModal
      :open="showLocalImportModal"
      @close="closeLocalImportModal"
      @imported="handleLocalJsonImported"
    />
  </section>
</template>

<style scoped>
.page-content {
  display: grid;
  gap: 18px;
}

.card-kicker {
  color: #9aa6bd;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.content-card {
  padding: 24px;
  border: 1px solid rgba(223, 230, 244, 0.95);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 16px 40px rgba(195, 205, 226, 0.1);
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.card-head h2,
.modal-head h3 {
  margin-top: 8px;
  color: #273248;
  font-size: 1.5rem;
  font-weight: 700;
}

.card-desc {
  max-width: 360px;
  color: #7f8ca4;
  font-size: 0.95rem;
  text-align: right;
}

.import-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 24px;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: 220px;
  padding: 14px 18px;
  border-radius: 16px;
  font-size: 0.98rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.action-button:hover {
  transform: translateY(-1px);
}

.primary-action {
  border: none;
  background: linear-gradient(135deg, #ffaf58, #ff8930);
  color: #fff;
  box-shadow: 0 14px 26px rgba(255, 157, 68, 0.2);
}

.secondary-action {
  border: 1px solid rgba(223, 230, 244, 0.95);
  background: #fff;
  color: #5f7090;
}

.action-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.overview-item {
  padding: 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, #f8faff, #eff4fd);
}

.overview-item p {
  color: #96a2b8;
  font-size: 0.88rem;
}

.overview-item strong {
  display: block;
  margin-top: 8px;
  color: #273248;
  font-size: 1.3rem;
  font-weight: 700;
}

.overview-placeholder {
  margin-top: 20px;
  padding: 18px;
  border-radius: 18px;
  border: 1px dashed rgba(213, 222, 240, 0.95);
  color: #7f8ca4;
  background: rgba(249, 251, 255, 0.8);
}

@media (max-width: 980px) {
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .content-card {
    padding: 18px;
  }

  .card-head {
    flex-direction: column;
  }

  .card-desc {
    max-width: none;
    text-align: left;
  }

  .import-actions {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
    min-width: 0;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
