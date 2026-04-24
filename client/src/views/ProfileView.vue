<script setup>
import { reactive, onMounted, ref } from 'vue'
import {
  getProfileApi,
  updateProfileApi,
  changePasswordApi,
  uploadAvatarApi,
} from '../api/user'

import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const form = reactive({
  username: '',
  nickname: '',
  email: '',
  avatar: '',
})

const passwordForm=reactive({
  oldPassword:'',
  newPassword:'',
  confirmPassword:'',
})

const passwordErrors=reactive({
  oldPassword:'',
  newPassword:'',
  confirmPassword:'',
})

const errors = reactive({
  nickname: '',
  email: '',
  avatar: '',
})

const message = ref('')
const messageType = ref('')
const pageLoading = ref(false)
const saveLoading = ref(false)
const passwordLoading = ref(false)

const validatePasswordForm=()=>{
  passwordErrors.oldPassword=''
  passwordErrors.newPassword=''
  passwordErrors.confirmPassword=''
  message.value=''

  let isValid=true

  if(!passwordForm.oldPassword.trim()){
    passwordErrors.oldPassword='请输入旧密码'
    isValid=false
  }

  if(!passwordForm.newPassword.trim()){
    passwordErrors.newPassword='请输入新密码'
    isValid=false
  }else if(passwordForm.newPassword.length<6){
   passwordErrors.newPassword='新密码长度不能少于 6 位'
    isValid = false
  }

  if(!passwordForm.confirmPassword.trim()){
    passwordErrors.confirmPassword='请再次输入新密码'
    isValid = false
  } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = '两次输入的新密码不一致'
    isValid = false

  }

  if(
    passwordForm.oldPassword&&
    passwordForm.newPassword&&
    passwordForm.oldPassword===passwordForm.newPassword
  ){
    passwordErrors.newPassword='新密码不能和旧密码相同'
    isValid = false
  }
  return isValid
}

const handleChangePassword=async()=>{
  if(!validatePasswordForm())return
  passwordLoading.value=true
  message.value=''
  messageType.value=''

  try{
    const res=await changePasswordApi({
      oldPassword:passwordForm.oldPassword,
      newPassword:passwordForm.newPassword,
      confirmPassword:passwordForm.confirmPassword,
    })

    message.value=res.data.message
    messageType.value='success'

    passwordForm.oldPassword=''
    passwordForm.newPassword=''
    passwordForm.confirmPassword=''

    setTimeout(()=>{
      userStore.logout()
      router.push('/login')
    },1200)
  }catch(error){
   message.value=error.response?.data?.message||'修改密码失败'
    messageType.value = 'error'
  } finally {
    passwordLoading.value = false
  }

}

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const validateForm = () => {
  errors.nickname = ''
  errors.email = ''
  errors.avatar = ''
  message.value = ''

  let isValid = true

  if (!form.nickname.trim()) {
    errors.nickname = '昵称不能为空'
    isValid = false
  }

  if (!form.email.trim()) {
    errors.email = '邮箱不能为空'
    isValid = false
  } else if (!validateEmail(form.email)) {
    errors.email = '邮箱格式不正确'
    isValid = false
  }

  if (
  form.avatar &&
  !form.avatar.startsWith('http://') &&
  !form.avatar.startsWith('https://') &&
  !form.avatar.startsWith('/uploads/')
) {
  errors.avatar = '头像地址格式不正确'
  isValid = false
}

  return isValid
}

const getProfile = async () => {
  pageLoading.value = true
  message.value = ''

  try {
    const res = await getProfileApi()
    const user = res.data.user

    form.username = user.username || ''
    form.nickname = user.nickname || ''
    form.email = user.email || ''
    form.avatar = user.avatar || ''

    userStore.setUserInfo(user)
  } catch (error) {
    message.value = error.response?.data?.message || '获取用户信息失败'
    messageType.value = 'error'

    if (error.response?.status === 401) {
      userStore.logout()
      router.push('/login')
    }
  } finally {
    setTimeout(() => {
      pageLoading.value = false
    }, 1200)
  }
}

const handleUpdate = async () => {
  if (!validateForm()) return

  saveLoading.value = true
  message.value = ''
  messageType.value = ''

  try {
    const res = await updateProfileApi({
      nickname: form.nickname,
      email: form.email,
      avatar: form.avatar,
    })
    message.value = res.data.message
    messageType.value = 'success'
    getProfile()
  } catch (error) {
    message.value = error.response?.data?.message || '更新失败'
    messageType.value = 'error'
  } finally {
    saveLoading.value = false
  }
}

const uploadLoading=ref(false)

const handleAvatarUpload=async(event)=>{
  const file=event.target.files[0]

  if(!file) return

  const allowedTypes =['image/jpeg','image/png','image/gif','image/webp']
  if(!allowedTypes.includes(file.type)){
    message.value='只能上传 jpg、jpeg、png、gif、webp 格式图片'
    messageType.value = 'error'
    return
  }

  if(file.size>2*1024*1024){
    message.value='图片大小不能超过 2MB'
    messageType.value = 'error'
    return
  }

  const formData=new FormData()
  formData.append('avatar',file)

  uploadLoading.value=true
  message.value=''
  messageType.value=''

  try{
   const res=await uploadAvatarApi(formData)
   form.avatar=res.data.avatarUrl
   message.value ='头像上传成功，请记得点击“保存修改”'
    messageType.value = 'success'
  }catch(error){
   message.value=error.response?.data?.message||'头像上传失败'
    messageType.value = 'error'
  }finally{
    uploadLoading.value=false
  }

}

onMounted(() => {
  getProfile()
})
</script>

<template>
  <div v-if="pageLoading" class="page-loading">
    正在加载用户信息...
  </div>

  <div v-else class="profile-page">
    <div class="left-card">
      <h2>个人中心</h2>
      <p>这里可以查看并修改你的个人资料。</p>

      <div class="avatar-box">
        <img v-if="form.avatar" :src="form.avatar" alt="avatar" />
        <div v-else class="avatar-placeholder">暂无头像</div>
      </div>

      <div class="user-summary">
        <p><strong>用户名：</strong>{{ form.username }}</p>
        <p><strong>昵称：</strong>{{ form.nickname || '未设置' }}</p>
        <p><strong>邮箱：</strong>{{ form.email || '未设置' }}</p>
      </div>
    </div>

    <div class="right-card">
      <h3>编辑资料</h3>

      <div v-if="message" class="message" :class="messageType">
        {{ message }}
      </div>

      <div class="form-item">
        <label>用户名</label>
        <input v-model="form.username" disabled />
      </div>

      <div class="form-item">
        <label>昵称</label>
        <input v-model="form.nickname" placeholder="请输入昵称" />
        <p v-if="errors.nickname" class="error-text">{{ errors.nickname }}</p>
      </div>

      <div class="form-item">
        <label>邮箱</label>
        <input v-model="form.email" placeholder="请输入邮箱" />
        <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
      </div>

      <div class="form-item">
        <label>头像上传</label>
        <input
          type="file"
          accept="image/*"
          @change="handleAvatarUpload"
        />

        <p class="upload-tip">
          支持 jpg、jpeg、png、gif、webp，大小不超过 2MB
        </p>

        <p v-if="uploadLoading" class="upload-loading">头像上传中...</p>
        <p v-if="errors.avatar" class="error-text">{{ errors.avatar }}</p>


      </div>

      <button class="save-btn" :disabled="saveLoading" @click="handleUpdate">
        {{ saveLoading ? '保存中...' : '保存修改' }}
      </button>

       <div class="password-section">
        <h3>修改密码</h3>
        <div class="form-item">
          <label>旧密码</label>
          <input
           v-model="passwordForm.oldPassword"
           type="password"
           placeholder="请输入旧密码"
          />
          <p v-if="passwordErrors.oldPassword" class="error-text">
            {{ passwordErrors.oldPassword }}
          </p>
        </div>
        <div class="form-item">
    <label>新密码</label>
    <input
      v-model="passwordForm.newPassword"
      type="password"
      placeholder="请输入新密码"
    />
    <p v-if="passwordErrors.newPassword" class="error-text">
      {{ passwordErrors.newPassword }}
    </p>
  </div>

  <div class="form-item">
    <label>确认新密码</label>
    <input
      v-model="passwordForm.confirmPassword"
      type="password"
      placeholder="请再次输入新密码"
    />
    <p v-if="passwordErrors.confirmPassword" class="error-text">
      {{ passwordErrors.confirmPassword }}
    </p>
  </div>

  <button
    class="password-btn"
    :disabled="passwordLoading"
    @click="handleChangePassword"
  >
    {{ passwordLoading ? '修改中...' : '修改密码' }}
  </button>
       </div>


    </div>
  </div>
</template>

<style scoped>

.password-section {
  margin-top: 36px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.password-btn {
  margin-top: 8px;
  width: 140px;
  height: 42px;
  border: none;
  background: #e6a23c;
  color: white;
  border-radius: 8px;
  font-size: 15px;
  transition: 0.2s;
}

.password-btn:hover {
  opacity: 0.9;
}

.password-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.page-loading {
  background: white;
  border-radius: 14px;
  padding: 40px;
  text-align: center;
  font-size: 16px;
  color: #666;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.profile-page {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
}
.upload-tip {
  margin: 6px 0 0;
  font-size: 12px;
  color: #999;
}

.upload-loading {
  margin: 6px 0 0;
  font-size: 13px;
  color: #409eff;
}
.left-card,
.right-card {
  background: white;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.left-card h2 {
  margin-top: 0;
  margin-bottom: 8px;
}

.left-card p {
  color: #666;
}

.avatar-box {
  margin: 20px 0;
  display: flex;
  justify-content: center;
}

.avatar-box img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
  font-size: 14px;
}

.user-summary {
  margin-top: 20px;
  line-height: 1.8;
}

.right-card h3 {
  margin-top: 0;
  margin-bottom: 20px;
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

.form-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.form-item label {
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.form-item input {
  height: 42px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
}

.form-item input:focus {
  border-color: #409eff;
}

.error-text {
  margin: 6px 0 0;
  font-size: 13px;
  color: #f56c6c;
}

.save-btn {
  margin-top: 8px;
  width: 140px;
  height: 42px;
  border: none;
  background: #409eff;
  color: white;
  border-radius: 8px;
  font-size: 15px;
  transition: 0.2s;
}

.save-btn:hover {
  opacity: 0.9;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .profile-page {
    grid-template-columns: 1fr;
  }
}
</style>
