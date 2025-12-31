<template>
  <div class="sequence-input">
    <el-form-item label="逻辑地址序列" required>
      <el-input
          v-model="sequence"
          type="textarea"
          :rows="6"
          placeholder="请输入逻辑地址序列，如：0E4FH、53245H、1A3BH"
          :validate-event="false"
      />
      <div class="input-actions">
        <el-button-group>
          <el-button @click="importFromFile">
            <el-icon><Upload /></el-icon>
            从文件导入
          </el-button>
          <el-button @click="generateRandom">
            <el-icon><MagicStick /></el-icon>
            随机生成
          </el-button>
          <el-button @click="clearSequence">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </el-button-group>

        <el-upload
            ref="uploadRef"
            class="hidden-upload"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
        >
          <template #trigger>
            <div style="display: none"></div>
          </template>
        </el-upload>
      </div>

      <div class="sequence-preview" v-if="sequence">
        <el-tag type="info">格式示例：0E4FH、53245H、1A3BH</el-tag>
        <div class="sequence-items">
          <el-tag
              v-for="(item, index) in parsedSequence"
              :key="index"
              class="sequence-tag"
          >
            {{ item }}
          </el-tag>
        </div>
        <div class="sequence-count">
          共 {{ parsedSequence.length }} 个地址
        </div>
      </div>
    </el-form-item>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits, defineProps } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, MagicStick, Delete } from '@element-plus/icons-vue'
import { generateRandomAddressSeq } from '../utils/sequenceGenerator'

const props = defineProps({
  modelValue: String
})

const emit = defineEmits(['update:modelValue', 'file-loaded', 'generate-random'])
const uploadRef = ref()

const sequence = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const parsedSequence = computed(() => {
  if (!sequence.value) return []
  return sequence.value.split(/[、，]/).filter(item => item.trim())
})

const importFromFile = () => {
  uploadRef.value.$el.querySelector('input').click()
}

const handleFileChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target.result
    sequence.value = content
    emit('file-loaded', content)
    ElMessage.success('文件导入成功')
  }
  reader.readAsText(file.raw)
}

const generateRandom = () => {
  const randomSeq = generateRandomAddressSeq()
  sequence.value = randomSeq
  emit('generate-random', randomSeq)
  ElMessage.success('已生成随机地址序列')
}

const clearSequence = () => {
  sequence.value = ''
}
</script>

<style scoped>
.sequence-input {
  margin-bottom: 20px;
}

.input-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.hidden-upload {
  display: none;
}

.sequence-preview {
  margin-top: 15px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.sequence-items {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sequence-tag {
  font-family: 'Courier New', monospace;
}

.sequence-count {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}
</style>