<script setup lang="ts">
import { computed, ref } from 'vue'

type JsonImportMode = 'local' | 'remote'

const props = defineProps<{
  open: boolean
  mode: JsonImportMode
}>()

const emit = defineEmits<{
  close: []
  imported: [payload: { sourceName: string; jsonText: string; data: unknown; mode: JsonImportMode }]
}>()

const selectedFileName = ref('')
const jsonError = ref('')
const remoteRepo = ref('')
const remoteBranch = ref('main')
const remoteFilePath = ref('')
const remoteLoading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const isLocalMode = computed(() => props.mode === 'local')
const modalKicker = computed(() => (isLocalMode.value ? 'Local Import' : 'Remote Import'))
const modalTitle = computed(() => (isLocalMode.value ? '导入本地 JSON' : '导入远程 JSON'))

function closeModal() {
  emit('close')
}

function emitImported(sourceName: string, jsonText: string) {
  try {
    const parsed = JSON.parse(jsonText)
    emit('imported', {
      sourceName,
      jsonText,
      data: parsed,
      mode: props.mode,
    })
  } catch {
    jsonError.value = isLocalMode.value
      ? '文件内容不是合法 JSON，请重新选择。'
      : '远程 JSON 内容不是合法 JSON，请检查后再导入。'
  }
}

function buildGitHubRawUrl(repoInput: string, branch: string, filePath: string) {
  const trimmedRepo = repoInput.trim().replace(/\/+$/, '')
  const trimmedBranch = branch.trim()
  const trimmedPath = filePath.trim().replace(/^\/+/, '')

  if (/^https?:\/\/github\.com\//i.test(trimmedRepo)) {
    const repoPath = trimmedRepo.replace(/^https?:\/\/github\.com\//i, '')
    return `https://raw.githubusercontent.com/${repoPath}/${trimmedBranch}/${trimmedPath}`
  }

  return `https://raw.githubusercontent.com/${trimmedRepo}/${trimmedBranch}/${trimmedPath}`
}

function triggerFileSelect() {
  fileInputRef.value?.click()
}

function handleLocalFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  jsonError.value = ''

  if (!file.name.toLowerCase().endsWith('.json')) {
    selectedFileName.value = ''
    jsonError.value = '仅允许导入 .json 文件。'
    target.value = ''
    return
  }

  selectedFileName.value = file.name
}

function handleLocalImport() {
  jsonError.value = ''

  const file = fileInputRef.value?.files?.[0]

  if (!file) {
    jsonError.value = '请先选择本地 JSON 文件。'
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    const result = typeof reader.result === 'string' ? reader.result : ''
    emitImported(file.name, result)
  }
  reader.readAsText(file)
}

async function handleRemoteImport() {
  jsonError.value = ''

  if (!remoteRepo.value.trim()) {
    jsonError.value = '请输入 Git 仓库地址。'
    return
  }

  if (!remoteBranch.value.trim()) {
    jsonError.value = '请输入分支名称。'
    return
  }

  if (!remoteFilePath.value.trim()) {
    jsonError.value = '请输入仓库中的 JSON 文件路径。'
    return
  }

  if (!remoteFilePath.value.toLowerCase().endsWith('.json')) {
    jsonError.value = '仓库文件路径必须指向 .json 文件。'
    return
  }

  remoteLoading.value = true

  try {
    const rawUrl = buildGitHubRawUrl(remoteRepo.value, remoteBranch.value, remoteFilePath.value)
    const response = await fetch(rawUrl)

    if (!response.ok) {
      jsonError.value = '获取远程 JSON 失败，请检查仓库地址、分支和文件路径。'
      return
    }

    const jsonText = await response.text()
    emitImported(`${remoteRepo.value.trim()} / ${remoteFilePath.value.trim()}`, jsonText)
  } catch {
    jsonError.value = '远程请求失败，请确认仓库可公开访问且网络正常。'
  } finally {
    remoteLoading.value = false
  }
}
</script>

<template>
  <div v-if="props.open" class="modal-overlay" @click.self="closeModal">
    <section class="modal-card">
      <div class="modal-head">
        <div>
          <p class="card-kicker">{{ modalKicker }}</p>
          <h3>{{ modalTitle }}</h3>
        </div>
        <button type="button" class="modal-close" @click="closeModal">关闭</button>
      </div>

      <div class="modal-body">
        <div v-if="isLocalMode" class="field-block">
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

        <div v-else class="field-block">
          <label class="field-label">Git 仓库地址</label>
          <input
            v-model="remoteRepo"
            type="text"
            class="field-input"
            placeholder="例如：https://github.com/user/repo 或 user/repo"
          />
        </div>

        <div v-if="!isLocalMode" class="field-block">
          <label class="field-label">分支名称</label>
          <input
            v-model="remoteBranch"
            type="text"
            class="field-input"
            placeholder="例如：main"
          />
        </div>

        <div v-if="!isLocalMode" class="field-block">
          <label class="field-label">仓库内 JSON 路径</label>
          <input
            v-model="remoteFilePath"
            type="text"
            class="field-input"
            placeholder="例如：data/example.json 或 config/protocols/demo.json"
          />
        </div>

        <p v-if="jsonError" class="field-error">{{ jsonError }}</p>

        <div class="modal-actions">
          <button type="button" class="secondary-button" @click="closeModal">取消</button>
          <button
            type="button"
            class="primary-button"
            :disabled="!isLocalMode && remoteLoading"
            @click="isLocalMode ? handleLocalImport() : handleRemoteImport()"
          >
            {{ !isLocalMode && remoteLoading ? '获取中...' : '确定' }}
          </button>
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
.pick-button,
.secondary-button,
.primary-button {
  border-radius: 12px;
  cursor: pointer;
}

.modal-close,
.pick-button,
.secondary-button {
  border: 1px solid rgba(223, 230, 244, 0.95);
  background: #fff;
  color: #5f7090;
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
.primary-button:disabled {
  opacity: 0.7;
  cursor: wait;
}

.field-input {
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

.pick-button,
.secondary-button,
.primary-button {
  padding: 10px 16px;
  font-weight: 600;
}

.hidden-file-input {
  display: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.primary-button {
  border: none;
  background: linear-gradient(135deg, #ffaf58, #ff8930);
  color: #fff;
}

@media (max-width: 720px) {
  .file-row,
  .modal-actions {
    grid-template-columns: 1fr;
    flex-direction: column;
  }
}
</style>
