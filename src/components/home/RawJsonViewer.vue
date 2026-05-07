<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'RawJsonViewer',
})

const props = withDefaults(
  defineProps<{
    data: unknown
    level?: number
  }>(),
  {
    level: 0,
  },
)

const isArrayValue = computed(() => Array.isArray(props.data))
const isObjectValue = computed(
  () => Boolean(props.data) && typeof props.data === 'object' && !Array.isArray(props.data),
)

const objectEntries = computed(() =>
  isObjectValue.value ? Object.entries(props.data as Record<string, unknown>) : [],
)

const arrayItems = computed(() => (isArrayValue.value ? props.data : []))

function formatPrimitiveValue(value: unknown) {
  if (value === null) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'undefined') return 'undefined'
  return String(value)
}

function formatInstancesCount(value: unknown) {
  if (Array.isArray(value)) {
    return `${value.length}个`
  }

  return '0个'
}
</script>

<template>
  <div class="json-node" :class="`level-${level}`">
    <div v-if="isObjectValue" class="json-group">
      <div v-for="[key, value] in objectEntries" :key="key" class="json-row">
        <div class="json-row-main">
          <div class="json-key">
            <span>{{ key }}</span>
          </div>
        </div>
        <div class="json-value">
          <div v-if="key === 'instances'" class="json-inline-row">
            <div class="json-inline-key">数量</div>
            <div class="json-inline-value">{{ formatInstancesCount(value) }}</div>
          </div>
          <RawJsonViewer v-if="value && typeof value === 'object'" :data="value" :level="level + 1" />
          <div v-else class="json-primitive">{{ formatPrimitiveValue(value) }}</div>
        </div>
      </div>
    </div>

    <div v-else-if="isArrayValue" class="json-group">
      <div v-for="(item, index) in arrayItems" :key="index" class="json-array-item">
        <div class="json-value">
          <RawJsonViewer v-if="item && typeof item === 'object'" :data="item" :level="level + 1" />
          <div v-else class="json-primitive">{{ formatPrimitiveValue(item) }}</div>
        </div>
      </div>
    </div>

    <div v-else class="json-primitive">
      {{ formatPrimitiveValue(data) }}
    </div>
  </div>
</template>

<style scoped>
.json-node {
  width: 100%;
}

.json-group {
  display: grid;
  gap: 10px;
}

.json-row {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  gap: 12px;
  align-items: flex-start;
}

.json-row-main {
  display: grid;
  gap: 8px;
}

.json-inline-row {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.json-inline-key {
  color: #5c6d89;
  font-size: 0.88rem;
  font-weight: 600;
}

.json-inline-value {
  color: #33415c;
  font-size: 0.92rem;
  word-break: break-word;
}

.json-array-item {
  min-width: 0;
}

.json-key {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  background: #eef3fb;
  color: #5c6d89;
  font-size: 0.88rem;
  font-weight: 600;
  word-break: break-word;
}

.json-value {
  min-width: 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f9fbff;
  border: 1px solid rgba(223, 230, 244, 0.95);
}

.level-1 .json-key,
.level-2 .json-key,
.level-3 .json-key {
  background: #f4f7fd;
}

.json-primitive {
  color: #33415c;
  font-size: 0.92rem;
  word-break: break-word;
  white-space: pre-wrap;
}

@media (max-width: 720px) {
  .json-row {
    grid-template-columns: 1fr;
  }

  .json-inline-row {
    grid-template-columns: 1fr;
  }
}
</style>
