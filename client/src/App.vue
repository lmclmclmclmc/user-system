<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from './stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const showHeader = computed(() => {
  return route.path !== '/login' && route.path !== '/register'
})

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-container">
    <header v-if="showHeader" class="header">
      <div class="header-inner">
        <div class="logo" @click="$router.push('/profile')">用户系统</div>

        <nav class="nav">
          <router-link to="/profile">个人中心</router-link>
          <button class="logout-btn" @click="handleLogout">退出登录</button>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}
.nav a.router-link-active {
  color: #111;
  font-weight: bold;
}
body {
  margin: 0;
  font-family: Arial, "Microsoft YaHei", sans-serif;
  background: #f5f7fb;
  color: #333;
}

a {
  text-decoration: none;
  color: #409eff;
}

button {
  cursor: pointer;
}
</style>

<style scoped>
.app-container {
  min-height: 100vh;
}

.header {
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #eaecef;
  display: flex;
  align-items: center;
}

.header-inner {
  width: 1100px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 22px;
  font-weight: bold;
  color: #222;
  cursor: pointer;
}

.nav {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logout-btn {
  border: none;
  background: #ff4d4f;
  color: white;
  padding: 8px 14px;
  border-radius: 6px;
}

.main-content {
  width: 1100px;
  margin: 0 auto;
  padding: 32px 0;
}
.logout-btn {
  border: none;
  background: #ff4d4f;
  color: white;
  padding: 8px 14px;
  border-radius: 6px;
  transition: 0.2s;
}

.logout-btn:hover {
  opacity: 0.9;
}
</style>
