<template>
  <div class="page">
    <header class="topbar">
      <div class="brand">
        <div class="logo">PNS</div>
        <span>光储集团协议管理平台</span>
      </div>
      <div class="notice">前后端分离示例：先实现协议管理权限校验，再逐步扩展页面。</div>
    </header>

    <div class="layout">
      <aside v-if="sidebarOpen" class="sidebar">
        <div class="sidebar-head">
          <span>导航</span>
          <button class="toggle-btn" type="button" @click="toggleSidebar">隐藏</button>
        </div>

        <nav class="nav-list">
          <button class="nav-item" :class="{ active: activePath === '/' }" type="button" @click="go('/')">首页</button>
          <button class="nav-item" :class="{ active: activePath.startsWith('/protocol') && !activePath.startsWith('/protocol/data-test') }" type="button" @click="go('/protocol')">协议管理</button>
          <button class="nav-item" :class="{ active: activePath.startsWith('/protocol/data-test') }" type="button" @click="go('/protocol/data-test')">协议数据测试</button>
        </nav>
      </aside>

      <aside v-else class="sidebar-mini">
        <button class="icon-btn" type="button" title="显示导航" aria-label="显示导航" @click="toggleSidebar">
          <span aria-hidden="true">☰</span>
        </button>
      </aside>

      <main class="main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'

const sidebarOpen = ref(true)
const route = useRoute()
const router = useRouter()

const activePath = computed(() => route.path)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function go(path: string) {
  if (route.path !== path) {
    void router.push(path)
  }
}
</script>

<style scoped>
:global(*) { box-sizing: border-box; }
:global(body) {
  margin: 0;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  background: #f3f4f6;
  color: #24292f;
}
.page { min-height: 100vh; }

.topbar {
  height: 52px;
  background: #fff;
  border-bottom: 1px solid #e6e8eb;
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 16px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 260px;
}
.logo {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #ff8a00;
  color: #fff;
  font-weight: 700;
  display: grid;
  place-items: center;
  font-size: 12px;
}
.notice {
  color: #ff8a00;
  font-size: 12px;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layout {
  display: flex;
  min-height: calc(100vh - 52px);
}

.sidebar {
  width: 200px;
  background: #fff;
  border-right: 1px solid #e6e8eb;
  padding: 10px;
}
.sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 13px;
  color: #66707c;
}
.nav-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.nav-item {
  border: 1px solid #eceff3;
  background: #f8f9fb;
  color: #333;
  height: 34px;
  border-radius: 4px;
  text-align: left;
  padding: 0 10px;
  cursor: pointer;
}
.nav-item.active {
  border-color: #ff8a00;
  color: #ff8a00;
  background: #fff7ed;
}

.sidebar-mini {
  width: 52px;
  background: #fff;
  border-right: 1px solid #e6e8eb;
  padding: 10px 6px;
}

.toggle-btn {
  border: 1px solid #d0d7de;
  background: #fff;
  color: #24292f;
  border-radius: 4px;
  height: 28px;
  padding: 0 8px;
  cursor: pointer;
  font-size: 12px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  background: #fff;
  color: #4b5563;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.main {
  flex: 1;
  min-width: 0;
  padding: 10px;
}
</style>
