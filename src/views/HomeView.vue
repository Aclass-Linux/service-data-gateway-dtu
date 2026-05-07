<script setup lang="ts">
import { computed, ref } from 'vue'
import IconCloudDownload from '~icons/lucide/cloud-download'
import IconFolderOpen from '~icons/lucide/folder-open'
import JsonImportModal from '@/components/home/JsonImportModal.vue'
import OverviewPanel from '@/components/home/OverviewPanel.vue'
import { useProjectStore } from '@/stores/project'

const showLocalImportModal = ref(false)
const projectStore = useProjectStore()
const overview = computed(() => projectStore.overview)
const hasImportedData = computed(() => Boolean(projectStore.rawProjectData))

function openLocalImportModal() {
  showLocalImportModal.value = true
}

function closeLocalImportModal() {
  showLocalImportModal.value = false
}

/**
 * 页面只负责接收导入结果，并调用独立的解析模块产出概览数据。
 * 这样后续如果 JSON 解析逻辑扩展，这里不需要继续堆积判断分支。
 */
function updateOverviewFromJson(data: unknown, fileName: string) {
  projectStore.setProjectData(data, fileName)
}

function handleLocalJsonImported(payload: {
  sourceName: string
  jsonText: string
  data: unknown
  mode: 'local' | 'remote'
}) {
  updateOverviewFromJson(payload.data, payload.sourceName)
  closeLocalImportModal()
}

</script>

<template>
  <section class="page-content">
    <article class="content-card import-card">
      <div class="card-head">
        <div>
          <p class="card-kicker">Import</p>
          <h2>JSON 数据导入</h2>
        </div>
        <p class="card-desc">支持导入本地 JSON 文件，远程 JSON 导入入口暂时保留，后续再接入。</p>
      </div>

      <div class="import-actions">
        <button type="button" class="action-button primary-action" @click="openLocalImportModal">
          <IconFolderOpen class="action-icon" />
          <span>导入本地 JSON</span>
        </button>

        <button type="button" class="action-button secondary-action" disabled>
          <IconCloudDownload class="action-icon" />
          <span>导入远程 JSON（暂未实现）</span>
        </button>
      </div>
    </article>

    <OverviewPanel
      :project-name="overview.projectName"
      :updated-at="overview.updatedAt"
      :detail-sections="overview.detailSections"
      :has-imported-data="hasImportedData"
    />

    <JsonImportModal
      :open="showLocalImportModal"
      mode="local"
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
  padding: 30px;
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

.action-button:disabled {
  cursor: not-allowed;
  transform: none;
  opacity: 0.58;
  box-shadow: none;
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

@media (max-width: 720px) {
  .content-card {
    padding: 16px;
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
}
</style>
