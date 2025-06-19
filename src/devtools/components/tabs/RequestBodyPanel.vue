<template>
  <div class="h-full overflow-y-auto p-3">
    <div v-if="request && hasRequestBody" class="space-y-4">
      <!-- 请求体信息 -->
      <div class="border-b border-gray-200 pb-2">
        <div class="flex gap-4 text-xs">
          <span class="text-gray-600">
            <span class="font-medium text-gray-800">Content-Type:</span> 
            {{ getContentType() }}
          </span>
          <span class="text-gray-600">
            <span class="font-medium text-gray-800">Size:</span> 
            {{ getBodySize() }}
          </span>
        </div>
      </div>

      <!-- 请求体内容 -->
      <div>
        <h4 class="text-xs font-semibold text-gray-700 mb-2">Request Body</h4>
        <div class="bg-gray-50 rounded border p-3">
          <pre class="text-xs leading-tight font-mono text-gray-900 whitespace-pre-wrap break-words">{{ formatRequestBody() }}</pre>
        </div>
      </div>
    </div>

    <div v-else-if="request" class="flex items-center justify-center h-full text-gray-500 text-sm">
      <div class="text-center">
        <div class="text-4xl mb-2">📝</div>
        <p class="font-medium">No Request Body</p>
        <p class="text-xs text-gray-400 mt-1">{{ request.method }} requests typically don't have a request body</p>
      </div>
    </div>

    <div v-else class="flex items-center justify-center h-full text-gray-500 text-sm">
      Select a request to view request body
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NetworkRequest } from '../../hooks/useChromeRequest'

interface Props {
  request: NetworkRequest | null
}

const props = defineProps<Props>()

// 检查是否有请求体
const hasRequestBody = computed(() => {
  if (!props.request) return false
  const methodsWithBody = ['POST', 'PUT', 'PATCH']
  return methodsWithBody.includes(props.request.method) && props.request.requestBody
})

// 获取 Content-Type
const getContentType = () => {
  if (!props.request?.requestHeaders) return 'Unknown'
  const contentType = props.request.requestHeaders['content-type'] || 
                     props.request.requestHeaders['Content-Type'] ||
                     props.request.requestHeaders['Content-type']
  return contentType || 'application/octet-stream'
}

// 获取请求体大小
const getBodySize = () => {
  if (!props.request?.requestBody) return '0 B'
  const bodyStr = typeof props.request.requestBody === 'string' 
    ? props.request.requestBody 
    : JSON.stringify(props.request.requestBody)
  const bytes = new Blob([bodyStr]).size
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${Math.round(bytes / (1024 * 1024))} MB`
}

// 格式化请求体内容
const formatRequestBody = () => {
  if (!props.request?.requestBody) return ''
  
  const body = props.request.requestBody
  
  // 如果是字符串，尝试格式化 JSON
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return body
    }
  }
  
  // 如果是对象，直接格式化
  if (typeof body === 'object') {
    return JSON.stringify(body, null, 2)
  }
  
  return String(body)
}
</script>

<style scoped>
/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style> 
