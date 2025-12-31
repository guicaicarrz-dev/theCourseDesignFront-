export const parseTxtFile = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (event) => {
            try {
                const content = event.target.result
                // 清理文件内容，移除多余空格和换行
                const cleanedContent = content
                    .replace(/\r\n/g, '、')
                    .replace(/\n/g, '、')
                    .replace(/\s+/g, '')
                    .trim()

                resolve(cleanedContent)
            } catch (error) {
                reject(new Error('文件解析失败'))
            }
        }

        reader.onerror = () => {
            reject(new Error('文件读取失败'))
        }

        reader.readAsText(file)
    })
}

export const validateTxtContent = (content) => {
    const lines = content.split(/[、，]/)
    const invalidLines = []

    lines.forEach((line, index) => {
        const trimmedLine = line.trim()
        if (trimmedLine && !trimmedLine.match(/^[0-9A-Fa-f]+H$/)) {
            invalidLines.push({ line: index + 1, content: trimmedLine })
        }
    })

    return invalidLines
}