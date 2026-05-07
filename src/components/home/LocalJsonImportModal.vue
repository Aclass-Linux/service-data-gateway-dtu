<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  imported: [payload: { fileName: string; jsonText: string; data: unknown }]
}>()

const selectedFileName = ref('')
const localJsonCode = ref('')
const localJsonError = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

function closeModal() {
  emit('close')
}

function triggerFileSelect() {
  fileInputRef.value?.click()
}

function handleLocalFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  localJsonError.value = ''

  if (!file.name.toLowerCase().endsWith('.json')) {
    selectedFileName.value = ''
    localJsonCode.value = ''
    localJsonError.value = '仅允许导入 .json 文件。'
    target.value = ''
    return
  }

  selectedFileName.value = file.name

  const reader = new FileReader()
  reader.onload = () => {
    const result = typeof reader.result === 'string' ? reader.result : ''

    try {
      const parsed = JSON.parse(result)
      localJsonCode.value = result
      emit('imported', {
        fileName: file.name,
        jsonText: result,
        data: parsed,
      })
    } catch {
      localJsonCode.value = ''
      localJsonError.value = '文件内容不是合法 JSON，请重新选择。'
      target.value = ''
    }
  }
  reader.readAsText(file)
}
</script>

<template>
  <div v-if="props.open" class="modal-overlay" @click.self="closeModal">
    <section class="modal-card">
      <div class="modal-head">
        <div>
          <p class="card-kicker">Local Import</p>
          <h3>导入本地 JSON</h3>
        </div>
        <button type="button" class="modal-close" @click="closeModal">关闭</button>
      </div>

      <div class="modal-body">
        <div class="field-block">
          <label class="field-label">本地文件位置</label>
          <div class="file-row">
            <input
              :value="selectedFileName || '尚未选择 JSON 文件'"
              type="text"
              class="field-input"
              readonly
            />
            <button type="button" class="pick-button" @click="triggerFileSelect">选择文件</button>
          </div>
          <input
            ref="fileInputRef"
            type="file"
            accept=".json,application/json"
            class="hidden-file-input"
            @change="handleLocalFileChange"
          />
        </div>

        <div class="field-block">
          <label class="field-label">代码预览</label>
          <textarea
            :value="localJsonCode"
            class="code-preview"
            readonly
            placeholder="选择本地 JSON 文件后，这里会显示文件内容。"
          />
          <p v-if="localJsonError" class="field-error">{{ localJsonError }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.card-kicker {
  color: #9aa6bd;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(24, 35, 56, 0.38);
  backdrop-filter: blur(4px);
}

.modal-card {
  width: min(760px, 100%);
  border: 1px solid rgba(223, 230, 244, 0.95);
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 24px 60px rgba(40, 57, 90, 0.2);
}

.modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px 16px;
  border-bottom: 1px solid rgba(233, 238, 247, 0.95);
}

.modal-head h3 {
  margin-top: 8px;
  color: #273248;
  font-size: 1.5rem;
  font-weight: 700;
}

.modal-close,
.pick-button {
  border: 1px solid rgba(223, 230, 244, 0.95);
  border-radius: 12px;
  background: #fff;
  color: #5f7090;
  cursor: pointer;
}

.modal-close {
  padding: 10px 14px;
}

.modal-body {
  display: grid;
  gap: 18px;
  padding: 20px 24px 24px;
}

.field-block {
  display: grid;
  gap: 10px;
}

.field-label {
  color: #6c7b96;
  font-size: 0.92rem;
  font-weight: 600;
}

.field-error {
  color: #d85a52;
  font-size: 0.9rem;
}

.file-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
}

.field-input,
.code-preview {
  width: 100%;
  border: 1px solid rgba(223, 230, 244, 0.95);
  border-radius: 14px;
  background: #f9fbff;
  color: #42506b;
}

.field-input {
  height: 48px;
  padding: 0 14px;
}

.pick-button {
  padding: 0 16px;
  font-weight: 600;
}

.code-preview {
  min-height: 280px;
  padding: 14px;
  resize: vertical;
  font-family:
    'SFMono-Regular',
    Consolas,
    'Liberation Mono',
    Menlo,
    monospace;
  font-size: 0.9rem;
  line-height: 1.6;
}

.hidden-file-input {
  display: none;
}

@media (max-width: 720px) {
  .file-row {
    grid-template-columns: 1fr;
  }
}
</style>
