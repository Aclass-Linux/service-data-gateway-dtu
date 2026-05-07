<script setup lang="ts">
import { ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { navigationItems } from '@/config/navigation'

const route = useRoute()
const sidebarCollapsed = ref(false)

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<template>
  <main class="portal-page" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <div class="app-shell">
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
  padding: 0;
  background: #f5f7fb;
  color: #4f5d78;
}

.app-shell {
  width: 100%;
  margin: 0;
}

.workspace {
  min-height: 100vh;
}

.main-panel {
  min-width: 0;
  margin-left: 284px;
  padding: 8px 6px 10px;
}

.sidebar-collapsed .main-panel {
  margin-left: 96px;
}

@media (max-width: 980px) {
  .workspace {
    min-height: auto;
  }

  .main-panel,
  .sidebar-collapsed .main-panel {
    margin-left: 0;
    padding: 6px;
  }
}

@media (max-width: 720px) {
  .app-shell {
    width: 100%;
  }
}
</style>
