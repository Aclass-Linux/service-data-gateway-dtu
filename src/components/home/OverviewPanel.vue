<script setup lang="ts">
import RawJsonViewer from '@/components/home/RawJsonViewer.vue'
import type { ProjectDetailSection } from '@/types/project-parser'

/**
 * 首页概览面板只负责展示，不承载导入逻辑。
 * 这样 HomeView 可以专注于状态管理，后续别的页面如果也要展示概览，
 * 也可以直接复用这个组件。
 */
defineProps<{
  projectName: string
  updatedAt: string
  detailSections: ProjectDetailSection[]
  hasImportedData: boolean
}>()
</script>

<template>
  <article class="content-card overview-card">
    <div class="card-head">
      <div>
        <p class="card-kicker">Overview</p>
        <h2>导入概览</h2>
      </div>
      <p class="card-desc">这里展示当前导入结果、数据状态以及最近一次更新时间。</p>
    </div>

    <div class="overview-grid">
      <div class="overview-item">
        <p>项目名称</p>
        <strong>{{ projectName }}</strong>
      </div>
      <div class="overview-item">
        <p>最近更新</p>
        <strong>{{ updatedAt }}</strong>
      </div>
    </div>

    <div class="overview-placeholder">
      <p v-if="hasImportedData">已根据导入的 JSON 自动更新概览信息。</p>
      <p v-else>导入成功后，这里会显示项目名称、最近更新时间以及下方的动态明细内容。</p>
    </div>

    <div
      v-for="section in detailSections"
      :key="section.key"
      class="detail-section"
    >
      <div class="detail-head">
        <h3>{{ section.label }}</h3>
        <span>{{ section.count }}</span>
      </div>

      <div class="detail-body">
        <RawJsonViewer :data="section.data" />
      </div>
    </div>
  </article>
</template>

<style scoped>
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
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 16px 40px rgba(195, 205, 226, 0.1);
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.card-head h2 {
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

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.overview-item {
  padding: 18px;
  border-radius: 6px;
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
  border-radius: 6px;
  border: 1px dashed rgba(213, 222, 240, 0.95);
  color: #7f8ca4;
  background: rgba(249, 251, 255, 0.8);
}

.detail-section {
  margin-top: 20px;
}

.detail-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-head h3 {
  color: #273248;
  font-size: 1.05rem;
  font-weight: 700;
}

.detail-head span {
  color: #7f8ca4;
  font-size: 0.88rem;
  font-weight: 600;
  margin-left: 8px;
}

.detail-body {
  margin-top: 14px;
}

.detail-empty {
  margin-top: 14px;
  padding: 16px 18px;
  border-radius: 6px;
  border: 1px dashed rgba(213, 222, 240, 0.95);
  color: #7f8ca4;
  background: rgba(249, 251, 255, 0.8);
}

@media (max-width: 980px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }
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

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .detail-head {
    flex-wrap: wrap;
  }

}
</style>
