<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const password = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

async function submitAuth() {
  error.value = ''
  success.value = ''

  if (!password.value.trim()) {
    error.value = '请输入研发权限密码。'
    return
  }

  loading.value = true

  // 模拟前端本地校验（写死密码：admin123）
  await new Promise((resolve) => setTimeout(resolve, 300))

  if (password.value === 'admin123') {
    success.value = '校验通过，正在进入协议管理工作台...'
    // 校验成功后跳转到新页面
    await router.push('/protocol/workbench')
  } else {
    error.value = '密码错误，请重试。'
  }

  loading.value = false
}
</script>

<template>
  <section class="page-wrap">
    <div class="card">
      <h1>协议管理</h1>
      <p class="desc">该页面需要研发权限才能输入密码并进行后续配置。</p>

      <label class="field-label" for="pwd">研发权限密码</label>
      <input
        id="pwd"
        v-model="password"
        class="input"
        type="password"
        placeholder="请输入研发权限密码"
        @keyup.enter="submitAuth"
      />

      <button class="btn" type="button" :disabled="loading" @click="submitAuth">
        {{ loading ? '校验中...' : '提交校验' }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>
    </div>
  </section>
</template>

<style scoped>
.page-wrap { padding: 16px; }
.card {
  max-width: 520px;
  background: #fff;
  border: 1px solid #e6e8eb;
  border-radius: 8px;
  padding: 18px;
}
h1 { margin: 0 0 8px; font-size: 22px; }
.desc { margin: 0 0 14px; color: #5f6873; }
.field-label { display: block; margin-bottom: 8px; font-size: 14px; }
.input {
  width: 100%;
  height: 36px;
  border: 1px solid #d0d7de;
  border-radius: 4px;
  padding: 0 10px;
  margin-bottom: 12px;
}
.btn {
  border: 1px solid #ff8a00;
  background: #ff8a00;
  color: #fff;
  height: 36px;
  padding: 0 14px;
  border-radius: 4px;
  cursor: pointer;
}
.btn:disabled { opacity: 0.7; cursor: not-allowed; }
.error { color: #c0392b; margin-top: 10px; }
.success { color: #00a870; margin-top: 10px; }
</style>
