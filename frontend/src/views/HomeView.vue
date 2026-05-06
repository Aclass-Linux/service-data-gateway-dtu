<script setup lang="ts">
// 引入 Vue 组合式 API：
// - onMounted: 组件挂载后执行（适合发起首次请求）
// - onUnmounted: 组件卸载前执行（适合清理定时器）
// - ref: 创建响应式状态
import { onMounted, onUnmounted, ref } from 'vue'

// 单条状态项的数据结构。
// 例如：{ key: "平台模式", value: "联调模式" }
type StatusItem = {
  key: string
  value: string
}

// 首页配置文件的整体结构。
// 对应 public/config/home-config.json。
type HomeConfig = {
  title: string
  subtitle: string
  status: StatusItem[]
}

// loading: 当前是否正在请求 JSON。
const loading = ref(false)

// error: 请求失败时显示给用户的提示信息。
const error = ref('')

// config: 请求成功后保存配置数据；初始为 null。
const config = ref<HomeConfig | null>(null)

// 定时器 ID：用于每 2 秒自动刷新。
// 组件卸载时会使用它来清理定时器。
let timer: number | undefined

// 加载配置文件的核心函数。
async function loadConfig() {
  // 开始请求前，先进入 loading 状态并清空旧错误。
  loading.value = true
  error.value = ''

  try {
    // 从静态资源目录读取 JSON 配置。
    // 在 Vite 中，public 目录会映射到站点根路径，所以这里用 /config/...。
    // 约定：后端可以定时或按事件覆盖该 JSON，让前端展示最新参数。
    const response = await fetch('/config/home-config.json', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })

    // HTTP 非 2xx 时主动抛错，进入 catch 统一处理。
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`)
    }

    // 解析 JSON 并写入响应式状态，页面会自动更新。
    config.value = (await response.json()) as HomeConfig
  } catch (err) {
    // 失败时给出用户可读提示，并在控制台打印真实错误用于排查。
    error.value = '配置加载失败，请检查 /public/config/home-config.json 是否存在且格式正确。'
    console.error(err)
  } finally {
    // 无论成功失败，最后都结束 loading 状态。
    loading.value = false
  }
}

onMounted(() => {
  // 首次进入页面时先请求一次，避免等 2 秒才看到数据。
  void loadConfig()

  // 启动轮询：每 2 秒自动刷新一次配置。
  timer = window.setInterval(() => {
    void loadConfig()
  }, 2000)
})

onUnmounted(() => {
  // 离开页面时清理定时器，防止内存泄漏或重复请求。
  if (timer !== undefined) {
    window.clearInterval(timer)
  }
})
</script>

<template>
  <section class="home">
    <div class="hero card">
      <!-- 配置文件里的页面标题；如果还没加载到，就显示默认值“首页”。 -->
      <h1>{{ config?.title || '首页' }}</h1>

      <!-- 配置文件里的副标题；未加载到时显示占位提示。 -->
      <p>{{ config?.subtitle || '正在读取配置...' }}</p>

      <!-- 说明当前页面已启用自动刷新。 -->
      <p class="hint">已开启自动刷新：每 2 秒同步一次配置</p>
    </div>

    <div class="card result">
      <h3>参数面板（JSON）</h3>

      <!-- 分支 1：请求中 -->
      <p v-if="loading" class="hint">正在加载配置...</p>

      <!-- 分支 2：请求失败 -->
      <p v-else-if="error" class="error">{{ error }}</p>

      <!-- 分支 3：请求成功且有配置 -->
      <div v-else-if="config" class="json-list">
        <!-- 按 status 数组逐条渲染参数 -->
        <div v-for="item in config.status" :key="item.key" class="json-item">
          <strong>{{ item.key }}:</strong>
          <span>{{ item.value }}</span>
        </div>
      </div>

      <!-- 分支 4：既不加载、也没报错、也没数据 -->
      <p v-else class="hint">暂无配置数据</p>
    </div>
  </section>
</template>

<style scoped>
/* 页面整体内边距。 */
.home { padding: 16px; }

/* 通用卡片样式：白底 + 边框 + 圆角。 */
.card { background: #fff; border: 1px solid #e6e8eb; border-radius: 8px; padding: 16px; }

/* 头部卡片与下方卡片的间距。 */
.hero { margin-bottom: 12px; }

/* 标题样式。 */
h1 { margin: 0 0 8px; font-size: 24px; }

/* 小标题样式。 */
h3 { margin: 0 0 10px; font-size: 16px; }

/* 段落基础样式。 */
p { margin: 0 0 10px; color: #5f6873; }

/* 结果卡片最小高度，避免内容抖动。 */
.result { min-height: 140px; }

/* 普通提示文本颜色。 */
.hint { color: #5f6873; }

/* 错误提示文本颜色。 */
.error { color: #c0392b; }

/* JSON 列表布局。 */
.json-list { color: #1f2937; display: grid; gap: 8px; }

/* 每一行 key-value 参数的水平布局。 */
.json-item { display: flex; gap: 8px; }
</style>
