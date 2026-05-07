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
    <div class="app-shell">
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
    </div>
  </main>
</template>

<style scoped>
.portal-page {
  min-height: 100vh;
  padding: 8px 6px 10px;
  background: #f5f7fb;
  color: #4f5d78;
}

.app-shell {
  width: 100%;
  margin: 0;
}

.workspace {
  display: grid;
  grid-template-columns: 284px minmax(0, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.main-panel {
  min-width: 0;
}

.sidebar-collapsed .workspace {
  grid-template-columns: 96px minmax(0, 1fr);
}

@media (max-width: 980px) {
  .workspace,
  .sidebar-collapsed .workspace {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .portal-page {
    padding: 6px;
  }

  .app-shell {
    width: 100%;
  }
}
</style>
