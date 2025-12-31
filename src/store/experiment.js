import { defineStore } from 'pinia'
import { ref } from 'vue'
import { initExperiment, getExperimentResults } from '../api/experiment'

export const useExperimentStore = defineStore('experiment', () => {
    const experiments = ref([])
    const currentExperiment = ref(null)
    const loading = ref(false)
    const error = ref(null)

    const initExperiment = async (params) => {
        loading.value = true
        error.value = null

        try {
            const response = await initExperiment(params)

            if (response.success) {
                currentExperiment.value = {
                    id: response.data.experimentId,
                    ...params,
                    createTime: new Date().toISOString()
                }

                experiments.value.unshift(currentExperiment.value)
                return response
            } else {
                error.value = response.msg || '初始化失败'
                return response
            }
        } catch (err) {
            error.value = err.message
            return {
                success: false,
                msg: '请求失败: ' + err.message
            }
        } finally {
            loading.value = false
        }
    }

    const fetchResults = async (experimentId) => {
        try {
            const response = await getExperimentResults(experimentId)
            return response
        } catch (err) {
            error.value = err.message
            return null
        }
    }

    const clearError = () => {
        error.value = null
    }

    return {
        experiments,
        currentExperiment,
        loading,
        error,
        initExperiment,
        fetchResults,
        clearError
    }
})