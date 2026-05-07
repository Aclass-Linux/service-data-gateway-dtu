<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { navigationItems } from '@/config/navigation'

const route = useRoute()
const sidebarCollapsed = ref(false)

// Keep page title derivation in App so all pages can reuse the same shell logic.
const pageTitle = computed(() => {
  const current = navigationItems.find((item) => item.to === route.path)
  return current?.label ?? '数据网关平台'
})

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<template>
  <main class="portal-page" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <AppTopbar :title="pageTitle" />

    <section class="workspace">
      <AppSidebar
        :collapsed="sidebarCollapsed"
        :items="navigationItems"
        :current-path="route.path"
        @toggle="toggleSidebar"
      />

      <section class="main-panel">
        <RouterView />
      </section>
    </section>
  </main>
</template>

<style scoped>
.portal-page {
  min-height: 100vh;
  padding: 18px;
  background: #f5f7fb;
  color: #4f5d78;
}

.workspace {
  display: grid;
  grid-template-columns: 284px minmax(0, 1fr);
  gap: 18px;
  margin-top: 18px;
}

.main-panel {
  min-width: 0;
}

.sidebar-collapsed .workspace {
  grid-template-columns: 96px minmax(0, 1fr);
}

.sidebar-collapsed .sidebar {
  padding: 16px 12px;
}

.sidebar-collapsed .sidebar-head {
  justify-content: center;
}

.sidebar-collapsed .menu-toggle {
  width: 42px;
  border-radius: 16px;
}

.sidebar-collapsed .menu-toggle-arrow {
  transform: rotate(-135deg);
}

.sidebar-collapsed .sidebar-brand {
  display: none;
}

.sidebar-collapsed .nav-list {
  justify-items: center;
}

.sidebar-collapsed .nav-item {
  justify-content: center;
  width: 56px;
  padding: 0;
}

.sidebar-collapsed .nav-label {
  display: none;
}

@media (max-width: 980px) {
  .workspace,
  .sidebar-collapsed .workspace {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .portal-page {
    padding: 10px;
  }
}
</style>
