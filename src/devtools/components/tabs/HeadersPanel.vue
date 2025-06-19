<template>
  <div class="h-full overflow-y-auto p-3">
    <div v-if="request" class="space-y-4">
      <!-- 基本信息 -->
      <div>
        <h4 class="text-xs font-semibold text-gray-700 mb-2 pb-1 border-b border-gray-200">General</h4>
        <div class="space-y-1">
          <div class="flex text-xs">
            <span class="font-medium text-gray-600 min-w-[120px] mr-2">Request URL:</span>
            <span class="text-gray-900 break-all">{{ request.url }}</span>
          </div>
          <div class="flex text-xs">
            <span class="font-medium text-gray-600 min-w-[120px] mr-2">Request Method:</span>
            <span 
              class="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded"
              :class="{
                'bg-green-100 text-green-800': request.method === 'GET',
                'bg-blue-100 text-blue-800': request.method === 'POST',
                'bg-yellow-100 text-yellow-800': request.method === 'PUT',
                'bg-red-100 text-red-800': request.method === 'DELETE',
                'bg-purple-100 text-purple-800': request.method === 'PATCH',
                'bg-gray-100 text-gray-800': !['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)
              }">
              {{ request.method }}
            </span>
          </div>
          <div class="flex text-xs">
            <span class="font-medium text-gray-600 min-w-[120px] mr-2">Status Code:</span>
            <span 
              class="font-medium"
              :class="{
                'text-green-600': request.status >= 200 && request.status < 300,
                'text-yellow-600': request.status >= 300 && request.status < 400,
                'text-red-600': request.status >= 400,
                'text-gray-600': request.status < 200
              }">
              {{ request.status }} {{ request.statusText }}
            </span>
          </div>
          <div class="flex text-xs">
            <span class="font-medium text-gray-600 min-w-[120px] mr-2">Remote Address:</span>
            <span class="text-gray-900">{{ getRemoteAddress(request.url) }}</span>
          </div>
        </div>
      </div>

      <!-- 响应头 -->
      <div>
        <h4 class="text-xs font-semibold text-gray-700 mb-2 pb-1 border-b border-gray-200">Response Headers</h4>
        <div class="space-y-0.5">
          <div v-for="(value, key) in request.responseHeaders" :key="key" class="flex text-xs py-0.5 border-b border-gray-100 last:border-b-0">
            <span class="font-medium text-gray-600 min-w-[120px] mr-2">{{ key }}:</span>
            <span class="text-gray-900 break-all">{{ value }}</span>
          </div>
          <div v-if="Object.keys(request.responseHeaders).length === 0" class="text-xs text-gray-500 italic py-2">
            No response headers available
          </div>
        </div>
      </div>

      <!-- 请求头 -->
      <div>
        <h4 class="text-xs font-semibold text-gray-700 mb-2 pb-1 border-b border-gray-200">Request Headers</h4>
        <div class="space-y-0.5">
          <div v-for="(value, key) in request.requestHeaders" :key="key" class="flex text-xs py-0.5 border-b border-gray-100 last:border-b-0">
            <span class="font-medium text-gray-600 min-w-[120px] mr-2">{{ key }}:</span>
            <span class="text-gray-900 break-all">{{ value }}</span>
          </div>
          <div v-if="Object.keys(request.requestHeaders).length === 0" class="text-xs text-gray-500 italic py-2">
            No request headers available
          </div>
        </div>
      </div>
    </div>
    <div v-else class="flex items-center justify-center h-full text-gray-500 text-sm">
      Select a request to view headers
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NetworkRequest } from '../../hooks/useChromeRequest'

interface Props {
  request: NetworkRequest | null
}

defineProps<Props>()

const getRemoteAddress = (url: string) => {
  try {
    const urlObj = new URL(url)
    return `${urlObj.hostname}:${urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80')}`
  } catch {
    return 'Unknown'
  }
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
