<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <header class="topbar">
    <div class="topbar-title">
      <p class="eyebrow">Data Gateway</p>
      <h1>{{ title }}</h1>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 14px 18px;
  border: 1px solid rgba(223, 230, 244, 0.95);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 16px 40px rgba(195, 205, 226, 0.12);
}

.eyebrow {
  color: #9aa6bd;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.topbar-title h1 {
  color: #273248;
  font-size: 1.9rem;
  font-weight: 700;
}

@media (max-width: 720px) {
  .topbar {
    padding: 12px 14px;
  }
}
</style>
