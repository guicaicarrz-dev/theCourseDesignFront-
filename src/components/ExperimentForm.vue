<template>
  <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="180px"
      size="default"
      @submit.prevent="handleSubmit"
  >
    <el-form-item label="实验名称" prop="experimentName">
      <el-input
          v-model="formData.experimentName"
          placeholder="请输入实验名称"
          style="width: 300px"
      />
    </el-form-item>

    <el-divider>内存配置</el-divider>

    <el-form-item label="驻留内存集数量" prop="residentMemorySetCount">
      <el-input-number
          v-model="formData.residentMemorySetCount"
          :min="1"
          :max="10"
          controls-position="right"
      />
      <span class="form-tip">(1-10之间)</span>
    </el-form-item>

    <el-form-item label="是否启用TLB" prop="isUseTlb">
      <el-switch
          v-model="formData.isUseTlb"
          active-text="启用"
          inactive-text="禁用"
      />
    </el-form-item>

    <el-form-item
        v-if="formData.isUseTlb"
        label="快表(TLB)大小"
        prop="tlbSize"
    >
      <el-input-number
          v-model="formData.tlbSize"
          :min="1"
          :max="100"
          controls-position="right"
      />
    </el-form-item>

    <el-divider>时间配置 (单位: ms)</el-divider>

    <el-form-item label="内存访问时间" prop="memoryAccessTime">
      <el-input-number
          v-model="formData.memoryAccessTime"
          :min="1"
          :step="10"
          controls-position="right"
      />
    </el-form-item>

    <el-form-item label="快表访问时间" prop="fastTableAccessTime">
      <el-input-number
          v-model="formData.fastTableAccessTime"
          :min="1"
          :step="1"
          controls-position="right"
      />
    </el-form-item>

    <el-form-item label="缺页处理时间" prop="pageFaultTime">
      <el-input-number
          v-model="formData.pageFaultTime"
          :min="100"
          :step="100"
          controls-position="right"
      />
    </el-form-item>

    <el-divider>算法选择</el-divider>

    <el-form-item label="选择算法" prop="algorithmTypes">
      <el-checkbox-group v-model="formData.algorithmTypes">
        <el-checkbox label="FIFO">FIFO (先进先出)</el-checkbox>
        <el-checkbox label="LRU">LRU (最近最少使用)</el-checkbox>
        <el-checkbox label="OPT">OPT (最优置换)</el-checkbox>
      </el-checkbox-group>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">
        <el-icon><VideoPlay /></el-icon>
        初始化实验
      </el-button>
      <el-button @click="resetForm">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoPlay, Refresh } from '@element-plus/icons-vue'

const emit = defineEmits(['submit'])
const formRef = ref()

const formData = reactive({
  experimentName: '',
  residentMemorySetCount: 3,
  isUseTlb: true,
  tlbSize: 100,
  memoryAccessTime: 100,
  fastTableAccessTime: 10,
  pageFaultTime: 2000,
  algorithmTypes: ['FIFO', 'LRU', 'OPT']
})

const rules = {
  experimentName: [
    { required: true, message: '请输入实验名称', trigger: 'blur' }
  ],
  residentMemorySetCount: [
    { required: true, message: '请设置驻留内存集数量', trigger: 'blur' }
  ],
  algorithmTypes: [
    { required: true, message: '请至少选择一个算法', trigger: 'change' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate((valid) => {
      if (valid) {
        emit('submit', { ...formData })
      }
    })
  } catch (error) {
    ElMessage.error('表单验证失败: ' + error.message)
  }
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}
</script>

<style scoped>
.form-tip {
  margin-left: 10px;
  color: #999;
  font-size: 12px;
}
</style>