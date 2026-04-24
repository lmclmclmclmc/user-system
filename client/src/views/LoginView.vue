<script setup>
import { reactive, ref } from 'vue'
import { loginApi } from '../api/user'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  username: '',
  password: '',
})

const errors=reactive({
  username:'',
  password:'',
})

const message=ref('')
const messageType=ref('')
const loading=ref(false)

const validateForm=()=>{
errors.username=''
errors.password=''
message.value=''

let isValid=true
if(!form.username.trim()){
  errors.username='请输入用户名'
  isValid=false
}

if(!form.password.trim()){
  errors.password='请输入密码'
    isValid = false
}else if(form.password.length < 6){
  errors.password='密码长度不能少于 6 位'
    isValid = false
}
 return isValid

}

const handleLogin = async () => {
  if(!validateForm()) return

  loading.value=true
  message.value=''
  messageType.value=''


  try {
    const res = await loginApi(form)
    const { token, user } = res.data

    userStore.setLogin(token, user)
    message.value = '登录成功，正在跳转...'
    messageType.value = 'success'
    setTimeout(()=>{
      router.push('/profile')
    },600)

  } catch (error) {
    message.value = error.response?.data?.message || '登录失败'
    messageType.value = 'error'
  }finally{
    loading.value=false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>登录</h2>
      <p class="sub-title">欢迎回来，请输入你的账号信息</p>

      <div v-if="message" class="message" :class="messageType">
        {{ message }}
      </div>

      <div class="form">
        <div class="form-item">
        <input v-model="form.username" placeholder="用户名" @input="errors.username = ''" />
        <p v-if="errors.username" class="error-text">{{ errors.username }}</p>
        </div>

        <div class="form-item">
        <input v-model="form.password" type="password" placeholder="密码" @input="errors.password = ''" />
        <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
        </div>

        <button :disabled="loading" @click="handleLogin">
          {{ loading ? '登录中...' : '登录' }}

        </button>
      </div>

      <p class="bottom-text">
        还没有账号？
        <router-link to="/register">去注册</router-link>
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
  background: #409eff;
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
