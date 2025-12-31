<template>
  <el-container>
    <el-header height="60px" class="header">
      <h1>页面置换算法实验平台</h1>
    </el-header>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}
</style>