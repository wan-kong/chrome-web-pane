<template>
    <div class="h-full overflow-y-auto p-1 relative">
        <button 
            @click="copyToClipboard"
            class="absolute top-2 right-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded shadow-lg hover:shadow-xl transition-all duration-200 z-50"
            :disabled="!request"
        >
            {{ copied ? '已复制' : '复制' }}
        </button>
        <pre class="text-xs leading-tight font-mono text-gray-900 whitespace-pre-wrap break-words pt-0">{{ JSON.stringify(request, null, 2) }}</pre>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { NetworkRequest } from '../../hooks/useChromeRequest'

interface Props {
    request: NetworkRequest | null
}

const props = defineProps<Props>()

const copied = ref(false)

const copyToClipboard = async () => {
    if (!props.request) return
    
    const jsonString = JSON.stringify(props.request, null, 2)
    
    try {
        // 优先使用现代的 Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(jsonString)
        } else {
            // 降级方案：使用传统的 execCommand 方法
            fallbackCopyToClipboard(jsonString)
        }
        
        copied.value = true
        setTimeout(() => {
            copied.value = false
        }, 2000)
    } catch (error) {
        // 如果现代API失败，尝试降级方案
        try {
            fallbackCopyToClipboard(jsonString)
            copied.value = true
            setTimeout(() => {
                copied.value = false
            }, 2000)
        } catch (fallbackError) {
            alert('复制失败，请手动选择并复制文本')
            console.error('复制失败:', error, fallbackError)
        }
    }
}

// 降级复制方案
const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    if (!document.execCommand('copy')) {
        throw new Error('execCommand copy failed')
    }
    
    document.body.removeChild(textArea)
}
</script>

