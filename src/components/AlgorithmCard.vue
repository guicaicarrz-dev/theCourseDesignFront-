<template>
  <el-card class="algorithm-card" :class="algorithmType.toLowerCase()">
    <template #header>
      <div class="card-header">
        <h4>{{ algorithmDisplayName }}</h4>
        <el-tag :type="statusColor">
          {{ statusText }}
        </el-tag>
      </div>
    </template>

    <!-- 控制按钮 -->
    <div class="control-buttons">
      <el-button-group>
        <el-button
            type="success"
            :disabled="isRunning"
            @click="startAlgorithm"
        >
          <el-icon><VideoPlay /></el-icon>
          开始
        </el-button>
        <el-button
            type="warning"
            :disabled="!isRunning || isPaused"
            @click="pauseAlgorithm"
        >
          <el-icon><VideoPause /></el-icon>
          暂停
        </el-button>
        <el-button
            type="info"
            :disabled="!isPaused"
            @click="resumeAlgorithm"
        >
          <el-icon><CaretRight /></el-icon>
          继续
        </el-button>
        <el-button
            type="danger"
            :disabled="!isRunning"
            @click="stopAlgorithm"
        >
          <el-icon><SwitchButton /></el-icon>
          停止
        </el-button>
      </el-button-group>
    </div>

    <!-- 进度条 -->
    <div class="progress-section" v-if="isRunning">
      <div class="progress-info">
        <span>进度: {{ progress }}%</span>
        <span>步骤: {{ currentStep }}/{{ totalSteps }}</span>
      </div>
      <el-progress
          :percentage="progress"
          :status="progressStatus"
          :stroke-width="10"
      />
      <div class="current-address">
        当前地址: <el-tag>{{ currentAddress }}</el-tag>
      </div>
    </div>

    <!-- 实时状态 -->
    <div class="status-grid" v-if="isRunning">
      <div class="status-item">
        <span class="label">内存状态:</span>
        <div class="memory-blocks">
          <div
              v-for="(page, index) in memoryList"
              :key="index"
              class="memory-block"
              :class="{ 'new-page': page === currentPageNumber }"
          >
            {{ page }}
          </div>
        </div>
      </div>

      <div class="status-item" v-if="showTLB">
        <span class="label">TLB状态:</span>
        <div class="tlb-blocks">
          <div
              v-for="(page, index) in tlbList"
              :key="index"
              class="tlb-block"
              :class="{ 'tlb-hit': page === currentPageNumber }"
          >
            {{ page }}
          </div>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <el-divider v-if="results">实验结果</el-divider>
    <div class="results-section" v-if="results">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="TLB命中率">
          {{ (results.tlbHitRate * 100).toFixed(2) }}%
        </el-descriptions-item>
        <el-descriptions-item label="缺页次数">
          {{ results.pageFaultCount }}
        </el-descriptions-item>
        <el-descriptions-item label="页面置换次数">
          {{ results.pageReplacementCount }}
        </el-descriptions-item>
        <el-descriptions-item label="缺页率">
          {{ (results.pageFaultRate * 100).toFixed(2) }}%
        </el-descriptions-item>
        <el-descriptions-item label="页面命中率">
          {{ (results.pageHitRate * 100).toFixed(2) }}%
        </el-descriptions-item>
        <el-descriptions-item label="实际运行时间">
          {{ results.realRunningTime }}ms
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  VideoPlay,
  VideoPause,
  CaretRight,
  SwitchButton
} from '@element-plus/icons-vue'
import { useWebSocketStore } from '../store/websocket'

const props = defineProps({
  experimentId: {
    type: Number,
    required: true
  },
  algorithmType: {
    type: String,
    required: true,
    validator: (value) => ['FIFO', 'LRU', 'OPT'].includes(value)
  }
})

const emit = defineEmits(['result-updated'])

const websocketStore = useWebSocketStore()

const algorithmDisplayName = computed(() => {
  const names = {
    FIFO: '先进先出算法 (FIFO)',
    LRU: '最近最少使用算法 (LRU)',
    OPT: '最优置换算法 (OPT)'
  }
  return names[props.algorithmType] || props.algorithmType
})

// 状态管理
const isRunning = ref(false)
const isPaused = ref(false)
const progress = ref(0)
const currentStep = ref(0)
const totalSteps = ref(0)
const currentAddress = ref('')
const currentPageNumber = ref(null)
const memoryList = ref([])
const tlbList = ref([])
const results = ref(null)

const statusColor = computed(() => {
  if (!isRunning.value) return 'info'
  if (isPaused.value) return 'warning'
  return 'success'
})

const statusText = computed(() => {
  if (!isRunning.value) return '未开始'
  if (isPaused.value) return '已暂停'
  return '运行中'
})

const progressStatus = computed(() => {
  if (progress.value >= 100) return 'success'
  return null
})

const showTLB = computed(() => tlbList.value.length > 0)

// WebSocket 方法
const startAlgorithm = () => {
  websocketStore.sendCommand({
    experimentId: props.experimentId.toString(),
    algorithmType: props.algorithmType,
    command: 'START'
  })
  isRunning.value = true
  isPaused.value = false
}

const pauseAlgorithm = () => {
  websocketStore.sendCommand({
    experimentId: props.experimentId.toString(),
    algorithmType: props.algorithmType,
    command: 'PAUSE'
  })
  isPaused.value = true
}

const resumeAlgorithm = () => {
  websocketStore.sendCommand({
    experimentId: props.experimentId.toString(),
    algorithmType: props.algorithmType,
    command: 'RESUME'
  })
  isPaused.value = false
}

const stopAlgorithm = () => {
  websocketStore.sendCommand({
    experimentId: props.experimentId.toString(),
    algorithmType: props.algorithmType,
    command: 'STOP'
  })
  resetState()
}

const resetState = () => {
  isRunning.value = false
  isPaused.value = false
  progress.value = 0
  currentStep.value = 0
  totalSteps.value = 0
  currentAddress.value = ''
  currentPageNumber.value = null
  memoryList.value = []
  tlbList.value = []
  results.value = null
}

// 监听WebSocket消息
const handleWebSocketMessage = (message) => {
  if (message.algorithmType !== props.algorithmType) return

  switch (message.type) {
    case 'PROGRESS':
      updateProgress(message.data)
      break
    case 'ERROR':
      handleError(message.data)
      break
    case 'COMPLETE':
      handleComplete(message.data)
      break
  }
}

const updateProgress = (data) => {
  progress.value = data.progress || 0
  currentStep.value = data.stepIndex || 0
  totalSteps.value = data.totalSteps || 0
  currentAddress.value = data.currentAddress || ''
  currentPageNumber.value = data.currentPageNumber || null

  if (data.memoryList) {
    memoryList.value = data.memoryList
  }

  if (data.tlbList) {
    tlbList.value = data.tlbList
  }
}

const handleError = (error) => {
  ElMessage.error(`${props.algorithmType}算法错误: ${error}`)
  resetState()
}

const handleComplete = (data) => {
  results.value = data
  emit('result-updated', props.algorithmType, data)
  isRunning.value = false
  ElMessage.success(`${props.algorithmType}算法执行完成`)
}

// 生命周期
onMounted(() => {
  websocketStore.connect(props.experimentId.toString())
  websocketStore.addMessageHandler(handleWebSocketMessage)
})

onUnmounted(() => {
  websocketStore.removeMessageHandler(handleWebSocketMessage)
  stopAlgorithm()
})
</script>

<style scoped>
.algorithm-card {
  height: 100%;
  transition: all 0.3s ease;
}

.algorithm-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

.algorithm-card.fifo {
  border-top: 4px solid #409EFF;
}

.algorithm-card.lru {
  border-top: 4px solid #67C23A;
}

.algorithm-card.opt {
  border-top: 4px solid #E6A23C;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.control-buttons {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.progress-section {
  margin-bottom: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}

.current-address {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-grid {
  display: grid;
  gap: 15px;
  margin-bottom: 20px;
}

.status-item {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.status-item .label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #409EFF;
}

.memory-blocks, .tlb-blocks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.memory-block, .tlb-block {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: bold;
}

.memory-block {
  background-color: #ecf5ff;
  border: 1px solid #409EFF;
}

.memory-block.new-page {
  background-color: #409EFF;
  color: white;
  animation: pulse 1s infinite;
}

.tlb-block {
  background-color: #f0f9eb;
  border: 1px solid #67C23A;
}

.tlb-block.tlb-hit {
  background-color: #67C23A;
  color: white;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.results-section {
  font-size: 14px;
}
</style>