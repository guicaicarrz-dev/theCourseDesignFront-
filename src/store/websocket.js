import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWebSocketStore = defineStore('websocket', () => {
    const wsConnections = ref(new Map())
    const messageHandlers = ref(new Set())
    const reconnectAttempts = ref(new Map())
    const maxReconnectAttempts = 5

    const connect = (experimentId) => {
        if (wsConnections.value.has(experimentId)) {
            return wsConnections.value.get(experimentId)
        }

        const wsUrl = `ws://localhost:8080/algorithm/ws/${experimentId}`
        const ws = new WebSocket(wsUrl)

        ws.onopen = () => {
            console.log(`WebSocket连接已建立: ${experimentId}`)
            reconnectAttempts.value.set(experimentId, 0)
        }

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data)
                messageHandlers.value.forEach(handler => handler(message))
            } catch (error) {
                console.error('WebSocket消息解析失败:', error)
            }
        }

        ws.onerror = (error) => {
            console.error(`WebSocket错误 (${experimentId}):`, error)
        }

        ws.onclose = () => {
            console.log(`WebSocket连接已关闭: ${experimentId}`)
            wsConnections.value.delete(experimentId)

            // 尝试重连
            const attempts = reconnectAttempts.value.get(experimentId) || 0
            if (attempts < maxReconnectAttempts) {
                setTimeout(() => {
                    reconnectAttempts.value.set(experimentId, attempts + 1)
                    connect(experimentId)
                }, 3000)
            }
        }

        wsConnections.value.set(experimentId, ws)
        return ws
    }

    const disconnect = (experimentId) => {
        const ws = wsConnections.value.get(experimentId)
        if (ws) {
            ws.close()
            wsConnections.value.delete(experimentId)
        }
    }

    const sendCommand = (command) => {
        const { experimentId } = command
        const ws = wsConnections.value.get(experimentId)

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(command))
        } else {
            console.error(`WebSocket未连接或未就绪: ${experimentId}`)
        }
    }

    const addMessageHandler = (handler) => {
        messageHandlers.value.add(handler)
    }

    const removeMessageHandler = (handler) => {
        messageHandlers.value.delete(handler)
    }

    const getConnection = (experimentId) => {
        return wsConnections.value.get(experimentId)
    }

    return {
        wsConnections,
        connect,
        disconnect,
        sendCommand,
        addMessageHandler,
        removeMessageHandler,
        getConnection
    }
})