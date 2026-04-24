<script setup>
import { reactive, ref } from 'vue'
import { registerApi } from '../api/user'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  username: '',
  password: '',
  nickname: '',
  email: '',
})

const errors = reactive({
  username: '',
  password: '',
  nickname: '',
  email: '',
})

const message = ref('')
const messageType = ref('')
const loading = ref(false)

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const validateForm = () => {
  errors.username = ''
  errors.password = ''
  errors.nickname = ''
  errors.email = ''
  message.value = ''

  let isValid = true

  if (!form.username.trim()) {
    errors.username = '请输入用户名'
    isValid = false
  } else if (form.username.length < 3) {
    errors.username = '用户名至少 3 位'
    isValid = false
  }

  if (!form.password.trim()) {
    errors.password = '请输入密码'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = '密码长度不能少于 6 位'
    isValid = false
  }

  if (!form.nickname.trim()) {
    errors.nickname = '请输入昵称'
    isValid = false
  }

  if (!form.email.trim()) {
    errors.email = '请输入邮箱'
    isValid = false
  } else if (!validateEmail(form.email)) {
    errors.email = '邮箱格式不正确'
    isValid = false
  }

  return isValid
}

const handleRegister = async () => {
  if (!validateForm()) return

  loading.value = true
  message.value = ''
  messageType.value = ''

  try {
    const res = await registerApi(form)
    message.value = res.data.message
    messageType.value = 'success'

    setTimeout(() => {
      router.push('/login')
    }, 800)
  } catch (error) {
    message.value = error.response?.data?.message || '注册失败'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>注册</h2>
      <p class="sub-title">创建一个新的账号，开始使用用户系统</p>

      <div v-if="message" class="message" :class="messageType">
        {{ message }}
      </div>

      <div class="form">
        <div class="form-item">
          <input v-model="form.username" placeholder="用户名" />
          <p v-if="errors.username" class="error-text">{{ errors.username }}</p>
        </div>

        <div class="form-item">
          <input v-model="form.password" type="password" placeholder="密码" />
          <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
        </div>

        <div class="form-item">
          <input v-model="form.nickname" placeholder="昵称" />
          <p v-if="errors.nickname" class="error-text">{{ errors.nickname }}</p>
        </div>

        <div class="form-item">
          <input v-model="form.email" placeholder="邮箱" />
          <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
        </div>

        <button :disabled="loading" @click="handleRegister">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </div>

      <p class="bottom-text" id="name">
        已有账号？
        <router-link to="/login">去登录</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>

.auth-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #eef4ff, #f8fbff);
}

.auth-card {
  width: 420px;
  background: white;
  border-radius: 14px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.auth-card h2 {
  margin: 0 0 8px;
  font-size: 28px;
  text-align: center;
}

.sub-title {
  margin: 0 0 24px;
  color: #888;
  text-align: center;
  font-size: 14px;
}

.message {
  margin-bottom: 16px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
}

.message.success {
  background: #f0f9eb;
  color: #67c23a;
}

.message.error {
  background: #fef0f0;
  color: #f56c6c;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-item {
  display: flex;
  flex-direction: column;
}

.form input {
  height: 44px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
}

.form input:focus {
  border-color: #409eff;
}

.error-text {
  margin: 6px 0 0;
  font-size: 13px;
  color: #f56c6c;
}

.form button {
  height: 44px;
  border: none;
  background: #67c23a;
  color: white;
  border-radius: 8px;
  font-size: 16px;
  transition: 0.2s;
}

.form button:hover {
  opacity: 0.9;
}

.form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.bottom-text {
  margin-top: 18px;
  text-align: center;
  font-size: 14px;
  color: #666;
}
</style>
