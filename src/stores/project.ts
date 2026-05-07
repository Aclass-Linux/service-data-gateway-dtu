import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  createDefaultProjectOverview,
  resolveProjectOverview,
  resolveProjectProtocols,
} from '@/utils/project-parser'

/**
 * 全局项目状态：
 * 统一保存当前导入的项目 JSON，并派生首页概览、协议列表等页面数据。
 * 这样首页导入一次后，协议管理等页面都可以直接复用同一份结果。
 */
export const useProjectStore = defineStore('project', () => {
  const sourceName = ref('未导入')
  const rawProjectData = ref<unknown>(null)

  const overview = computed(() => {
    if (!rawProjectData.value) {
      return createDefaultProjectOverview()
    }

    return resolveProjectOverview(rawProjectData.value, sourceName.value)
  })

  const protocols = computed(() => resolveProjectProtocols(rawProjectData.value))

  function setProjectData(data: unknown, nextSourceName: string) {
    rawProjectData.value = data
    sourceName.value = nextSourceName
  }

  return {
    sourceName,
    rawProjectData,
    overview,
    protocols,
    setProjectData,
  }
})
