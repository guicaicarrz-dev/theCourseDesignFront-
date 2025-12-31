export const generateRandomAddressSeq = () => {
    const hexChars = '0123456789ABCDEF'
    const length = Math.floor(Math.random() * 8) + 3 // 3-10个地址
    const addresses = []

    for (let i = 0; i < length; i++) {
        const hexLength = Math.floor(Math.random() * 4) + 1 // 1-4位十六进制
        let hex = ''
        for (let j = 0; j < hexLength; j++) {
            hex += hexChars[Math.floor(Math.random() * 16)]
        }
        addresses.push(`${hex}H`)
    }

    return addresses.join('、')
}

export const validateAddressSequence = (sequence) => {
    if (!sequence) return '地址序列不能为空'

    const regex = /^([0-9A-Fa-f]+H)([、，]([0-9A-Fa-f]+H))*$/
    if (!regex.test(sequence)) {
        return '地址序列格式错误，应为十六进制数+H，以顿号或逗号分隔'
    }

    const addresses = sequence.split(/[、，]/)
    if (addresses.length < 2) {
        return '至少需要2个地址'
    }

    return null
}

export const parseAddressSequence = (sequence) => {
    if (!sequence) return []
    return sequence.split(/[、，]/).filter(addr => addr.trim())
}