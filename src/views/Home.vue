<template>
  <div class="home-container">
    <!-- 左侧：实验配置 -->
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>实验配置</span>
        </div>
      </template>

      <SequenceInput
          v-model="logicalSequence"
          @file-loaded="handleFileLoaded"
          @generate-random="handleGenerateRandom"
      />

      <el-divider />

      <ExperimentForm
          ref="experimentForm"
          @submit="handleSubmit"
      />
    </el-card>

    <!-- 右侧：算法执行卡片 -->
    <div class="algorithm-cards-container" v-if="experimentId">
      <h3>算法执行控制 (实验ID: {{ experimentId }})</h3>
      <div class="cards-grid">
        <AlgorithmCard
            v-for="algorithm in selectedAlgorithms"
            :key="algorithm"
            :experiment-id="experimentId"
            :algorithm-type="algorithm"
            @result-updated="handleResultUpdated"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useExperimentStore } from '../store/experiment'
import SequenceInput from '../components/SequenceInput.vue'
import ExperimentForm from '../components/ExperimentForm.vue'
import AlgorithmCard from '../components/AlgorithmCard.vue'

const experimentStore = useExperimentStore()
const experimentForm = ref(null)
const logicalSequence = ref('')
const experimentId = ref(null)
const selectedAlgorithms = ref([])

const handleFileLoaded = (content) => {
  logicalSequence.value = content
}

const handleGenerateRandom = (sequence) => {
  logicalSequence.value = sequence
}

const handleSubmit = async (formData) => {
  selectedAlgorithms.value = formData.algorithmTypes

  try {
    const response = await experimentStore.initExperiment({
      ...formData,
      logicalAddressSequence: logicalSequence.value
    })

    if (response.success) {
      experimentId.value = response.data.experimentId
      ElMessage.success(response.msg || '实验初始化成功')
    } else {
      ElMessage.error(response.msg || '实验初始化失败')
    }
  } catch (error) {
    ElMessage.error('初始化请求失败: ' + error.message)
  }
}

const handleResultUpdated = (algorithmType, result) => {
  console.log(`算法 ${algorithmType} 结果更新:`, result)
}
</script>

<style scoped>
.home-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  padding: 20px;
}

.config-card {
  min-height: 800px;
}

.algorithm-cards-container {
  padding: 10px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>