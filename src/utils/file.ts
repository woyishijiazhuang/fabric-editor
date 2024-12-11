export const downloadPNG = (base64: string, name?: string) => {
    down(base64, name || `${getFileName()}.png`)
}

export const downloadJSON = (data: any, name?: string) => {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    const href = URL.createObjectURL(blob)
    down(href, name || `${getFileName()}.json`)
    URL.revokeObjectURL(href)
}

// 选择JSON文件并转成字符串
export const selectJSON = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        input.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement
            const file = target.files?.[0]
            if (!file) {
                reject('No file selected')
            } else {
                // file转JSON
                const reader = new FileReader()
                reader.onload = (e) => {
                    const text = e.target?.result as string
                    resolve(text)
                }
                reader.readAsText(file)
            }
            input.remove()
        }
        input.click()
    })
}

function down(href: string, name: string) {
    const a = document.createElement('a')
    a.href = href
    a.download = name
    a.click()
    a.remove()
}

// 根据日期获取文件名
function getFileName() {
    const date = new Date()
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${date.getHours().toString().padStart(2, '0')}-${date.getMinutes().toString().padStart(2, '0')}-${date.getSeconds().toString().padStart(2, '0')}`
}