import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080'

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

export const initExperiment = async (params) => {
    try {
        const response = await api.post('/experiment/init', params)
        return response.data
    } catch (error) {
        console.error('初始化实验失败:', error)
        throw error
    }
}

export const getExperimentResults = async (experimentId) => {
    try {
        const response = await api.get(`/experiment/results/${experimentId}`)
        return response.data
    } catch (error) {
        console.error('获取实验结果失败:', error)
        throw error
    }
}

export const getHistory = async (page = 1, size = 10) => {
    try {
        const response = await api.get('/experiment/history', {
            params: { page, size }
        })
        return response.data
    } catch (error) {
        console.error('获取历史记录失败:', error)
        throw error
    }
}

export const deleteExperiment = async (experimentId) => {
    try {
        const response = await api.delete(`/experiment/${experimentId}`)
        return response.data
    } catch (error) {
        console.error('删除实验失败:', error)
        throw error
    }
}