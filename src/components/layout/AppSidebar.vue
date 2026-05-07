<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { NavigationItem } from '@/config/navigation'

defineProps<{
  collapsed: boolean
  items: NavigationItem[]
  currentPath: string
}>()

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar-collapsed': collapsed }">
    <div class="sidebar-head">
      <div class="sidebar-brand">
        <div class="brand-mark">DTU</div>
        <div class="brand-copy">
          <strong>Data Gateway</strong>
          <span>Embedded Console</span>
        </div>
      </div>

      <button
        type="button"
        class="menu-toggle"
        :aria-expanded="!collapsed"
        aria-label="切换侧边栏"
        @click="emit('toggle')"
      >
        <span class="menu-toggle-track">
          <span></span>
          <span></span>
          <span></span>
        </span>
        <span class="menu-toggle-arrow"></span>
      </button>
    </div>

    <nav class="nav-list">
      <RouterLink
        v-for="item in items"
        :key="item.label"
        :to="item.to"
        class="nav-item"
        :class="{ 'nav-item-active': currentPath === item.to }"
      >
        <span class="nav-icon">
          <component :is="item.icon" class="nav-svg" />
        </span>
        <span class="nav-label">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 18px;
  border: 1px solid rgba(223, 230, 244, 0.95);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 16px 40px rgba(195, 205, 226, 0.1);
}

.sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #ffae58, #ff8530);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(255, 157, 68, 0.2);
  flex-shrink: 0;
}

.brand-copy {
  display: grid;
  min-width: 0;
}

.brand-copy strong {
  color: #273248;
  font-size: 1.02rem;
  font-weight: 700;
}

.brand-copy span {
  color: #96a2b8;
  font-size: 0.82rem;
}

.menu-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: 50px;
  height: 42px;
  border: 1px solid rgba(223, 230, 244, 0.95);
  border-radius: 999px;
  background: linear-gradient(180deg, #ffffff, #f7f9fe);
  box-shadow: 0 10px 20px rgba(196, 208, 233, 0.14);
  cursor: pointer;
  flex-shrink: 0;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.menu-toggle:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 194, 143, 0.45);
  box-shadow: 0 14px 24px rgba(196, 208, 233, 0.18);
}

.menu-toggle-track {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.menu-toggle-track span {
  display: block;
  width: 14px;
  height: 2px;
  border-radius: 999px;
  background: #70809d;
}

.menu-toggle-track span:nth-child(2) {
  width: 10px;
}

.menu-toggle-arrow {
  width: 9px;
  height: 9px;
  border-top: 2px solid #70809d;
  border-right: 2px solid #70809d;
  transform: rotate(45deg);
  transition: transform 0.2s ease;
}

.nav-list {
  display: grid;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 50px;
  padding: 0 12px;
  border-radius: 16px;
  color: #65748f;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease;
}

.nav-item:hover,
.nav-item-active {
  background: linear-gradient(135deg, rgba(255, 244, 232, 0.96), rgba(248, 250, 255, 0.96));
  color: #ef8d2b;
  box-shadow: inset 0 0 0 1px rgba(255, 194, 143, 0.36);
  transform: translateX(2px);
}

.nav-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: linear-gradient(180deg, #f8faff, #eef3fd);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.85),
    0 8px 16px rgba(196, 208, 233, 0.12);
  flex-shrink: 0;
}

.nav-svg {
  width: 18px;
  height: 18px;
}

.nav-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-collapsed {
  padding: 16px 12px;
}

.sidebar-collapsed .sidebar-head {
  justify-content: center;
}

.sidebar-collapsed .sidebar-brand {
  display: none;
}

.sidebar-collapsed .menu-toggle {
  width: 42px;
  border-radius: 16px;
}

.sidebar-collapsed .menu-toggle-arrow {
  transform: rotate(-135deg);
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
  .sidebar,
  .sidebar-collapsed {
    padding: 16px;
  }

  .sidebar-head,
  .sidebar-collapsed .sidebar-head {
    justify-content: space-between;
  }

  .sidebar-brand,
  .sidebar-collapsed .sidebar-brand {
    display: flex;
  }

  .sidebar-collapsed .nav-list {
    justify-items: stretch;
  }

  .sidebar-collapsed .nav-item {
    justify-content: flex-start;
    width: auto;
    padding: 0 12px;
  }

  .sidebar-collapsed .nav-label {
    display: inline;
  }
}
</style>
