<template>
  <div class="flex flex-col h-full bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
    <!-- 紧凑的工具栏 -->
    <div class="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50 text-sm">
      <!-- 左侧控制按钮 -->
      <div class="flex items-center space-x-2">
        <button @click="clearRequests"
          class="flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
          title="清除网络日志">
          <span class="mr-1">🗑️</span>
          清除
        </button>
        <button @click="toggleListening"
          class="flex items-center px-2 py-1 text-xs font-medium text-white border border-transparent rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
          :class="isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'" title="录制网络活动">
          <span class="mr-1">{{ isListening ? '⏸️' : '▶️' }}</span>
          {{ isListening ? '停止' : '开始' }}
        </button>
      </div>

      <!-- 中间过滤区域 -->
      <div class="flex items-center space-x-3 flex-1 mx-4">
        <!-- 搜索框 -->
        <div class="relative" style="min-width: 200px; flex: 1 1 200px;">
          <input v-model="searchQuery" type="text" placeholder="搜索请求..."
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
          <svg v-if="!searchQuery" class="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>

        <!-- 方法过滤器 -->
        <!-- <div class="flex items-center space-x-1 flex-shrink-0">
          <button v-for="method in httpMethods" :key="method" @click="toggleMethodFilter(method)"
            class="px-2 py-1 text-xs font-medium rounded transition-colors duration-200 whitespace-nowrap" :class="methodFilters.includes(method)
              ? getMethodActiveClass(method)
              : 'text-gray-500 bg-gray-100 hover:bg-gray-200'" :title="`过滤 ${method} 请求`">
            {{ method }}
          </button>
        </div> -->
        <!-- 发起方类型过滤器 -->
        <div class="flex items-center space-x-1 flex-shrink-0">
          <button v-for="type in initiatorTypes" :key="type" @click="toggleInitiatorFilter(type)"
            class="px-2 py-1 text-xs font-medium rounded transition-colors duration-200 whitespace-nowrap" :class="initiatorFilters.includes(type)
              ? getInitiatorActiveClass(type)
              : 'text-gray-500 bg-gray-100 hover:bg-gray-200'" :title="`过滤 ${getInitiatorTypeDisplay(type)} 请求`">
            {{ getInitiatorTypeDisplay(type) }}
          </button>
        </div>
      </div>

      <!-- 右侧状态信息 -->
      <div class="text-xs text-gray-600 font-medium">
        显示: <span class="text-blue-600 font-semibold">{{ filteredRequests.length }}</span> /
        总计: <span class="text-blue-600 font-semibold">{{ requests.length }}</span>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="flex flex-1 overflow-hidden">
      <!-- 请求表格 -->
      <div class="bg-white border-r border-gray-200 overflow-auto"
        :style="{ width: selectedRequest ? requestsWidth + 'px' : '100%' }">
        <table class="w-full">
          <!-- 表头 -->
          <thead class="bg-gray-50 sticky top-0 z-10">
            <tr class="border-b border-gray-200">
              <th class="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider w-2/5">
                名称
              </th>
              <th class="px-2 py-2 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider w-20">
                状态
              </th>
              <th class="px-2 py-2 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider w-16">
                类型
              </th>
              <th class="px-2 py-2 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider w-16">
                方法
              </th>
              <th class="px-2 py-2 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider w-20">
                大小
              </th>
              <th class="px-2 py-2 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider w-20">
                时间
              </th>
            </tr>
          </thead>

          <!-- 表体 -->
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="request in filteredRequests" :key="request.id"
              class="cursor-pointer hover:bg-blue-50 transition-colors duration-150" :class="{
                'bg-blue-100 border-l-4 border-blue-500': selectedRequest?.id === request.id,
                'hover:bg-gray-50': selectedRequest?.id !== request.id
              }" @click="selectRequest(request)">

              <!-- 名称列 -->
              <td class="px-3 py-1" :title="request.url">
                <div class="flex items-center space-x-1.5">
                  <span class="text-xs text-gray-900 truncate">{{ getLastPathSegment(request.url) }}</span>
                </div>
              </td>

              <!-- 状态列 -->
              <td class="px-2 py-1 text-center">
                <span class="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded" :class="{
                  'bg-green-100 text-green-800': request.status >= 200 && request.status < 300,
                  'bg-yellow-100 text-yellow-800': request.status >= 300 && request.status < 400,
                  'bg-red-100 text-red-800': request.status >= 400,
                  'bg-gray-100 text-gray-800': request.status < 200
                }">
                  {{ request.status }}
                </span>
              </td>

              <!-- 类型列 -->
              <td class="px-2 py-1 text-center">
                <div class="flex flex-col space-y-0.5">
                  <span class="text-xs font-medium" :class="{
                    'text-blue-600': request.initiatorType === 'fetch',
                    'text-green-600': request.initiatorType === 'xhr',
                    'text-purple-600': request.initiatorType === 'script',
                    'text-orange-600': request.initiatorType === 'css',
                    'text-red-600': request.initiatorType === 'websocket',
                    'text-gray-600': !['fetch', 'xhr', 'script', 'css', 'websocket'].includes(request.initiatorType)
                  }" :title="`发起方: ${request.initiatorType}`">
                    {{ getInitiatorTypeDisplay(request.initiatorType) }}
                  </span>
                </div>
              </td>

              <!-- 方法列 -->
              <td class="px-2 py-1 text-center">
                <span class="text-xs text-gray-600">{{ request.method }}</span>
              </td>

              <!-- 大小列 -->
              <td class="px-2 py-1 text-center">
                <span class="text-xs text-gray-600">{{ formatSize(request.size) }}</span>
              </td>

              <!-- 时间列 -->
              <td class="px-2 py-1 text-center">
                <span class="text-xs text-gray-600">{{ formatTime(request.time) }}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 空状态 -->
        <div v-if="filteredRequests.length === 0 && requests.length > 0"
          class="flex flex-col items-center justify-center h-32 text-gray-500">
          <div class="text-4xl mb-2">🔍</div>
          <p class="text-sm font-medium">没有找到匹配的请求</p>
          <p class="text-xs text-gray-400">尝试调整搜索条件或过滤器</p>
        </div>

        <div v-else-if="requests.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-500">
          <div class="text-6xl mb-4">📡</div>
          <p class="text-lg font-medium mb-2">{{ isListening ? '等待网络请求...' : '开始监听网络请求' }}</p>
          <p class="text-sm text-gray-400">{{ isListening ? '正在监听网络活动' : '点击开始按钮来监听网络请求' }}</p>
        </div>
      </div>

      <!-- 可拖拽的分割条 -->
      <div v-if="selectedRequest"
        class="w-2 cursor-col-resize bg-gray-100 hover:bg-gray-200 border-l border-r border-gray-300 transition-all duration-200 flex-shrink-0 relative group"
        @mousedown="startResize">
        <!-- 拖拽指示器 -->
        <div
          class="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-gray-400 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
        </div>
        <!-- 中心抓取点 -->
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div class="flex flex-col space-y-0.5">
            <div
              class="w-1 h-1 bg-gray-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200">
            </div>
            <div
              class="w-1 h-1 bg-gray-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200">
            </div>
            <div
              class="w-1 h-1 bg-gray-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200">
            </div>
          </div>
        </div>
      </div>

      <!-- 请求详情面板 -->
      <div v-if="selectedRequest" class="flex-1 bg-white overflow-hidden flex flex-col">
        <div class="flex items-center justify-between px-2 py-0.5 border-b border-gray-200 bg-gray-50">
          <h4 class="text-base font-medium">请求详情</h4>
          <button @click="selectedRequest = null"
            class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-auto">
          <RequestDetailTabs :request="selectedRequest" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue"
import { useChromeRequest } from '../hooks/useChromeRequest'
import RequestDetailTabs from './RequestDetailTabs.vue'
import { debounce, URLUtils } from '@/utils'

const {
  requests,
  isListening,
  selectedRequest,
  startListening,
  stopListening,
  clearRequests,
  selectRequest,
  formatSize,
  formatTime
} = useChromeRequest()

// 过滤相关状态
const searchQuery = ref('')
const methodFilters = ref<string[]>([])
const initiatorFilters = ref<string[]>([])
const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
const initiatorTypes = ['fetch', 'xhr', 'script', 'css', 'websocket']

// 拖拽相关状态
const requestsWidth = ref(600) // 默认请求列表宽度
const isResizing = ref(false)
let startX = 0
let startWidth = 0

// 防抖搜索
const debouncedSearch = ref('')
const performSearch = debounce((query: string) => {
  debouncedSearch.value = query
}, 300)

// 监听搜索输入变化
watch(searchQuery, (newQuery) => {
  performSearch(newQuery)
})

// 过滤后的请求列表
const filteredRequests = computed(() => {
  let filtered = requests.value

  // 搜索过滤 - 使用防抖后的搜索词
  if (debouncedSearch.value) {
    const query = debouncedSearch.value.toLowerCase()
    filtered = filtered.filter(request =>
      request.url.toLowerCase().includes(query) ||
      request.method.toLowerCase().includes(query) ||
      request.status.toString().includes(query) ||
      getContentType(request.type).toLowerCase().includes(query)
    )
  }

  // 方法过滤
  if (methodFilters.value.length > 0) {
    filtered = filtered.filter(request =>
      methodFilters.value.includes(request.method)
    )
  }

  // 发起方类型过滤
  if (initiatorFilters.value.length > 0) {
    filtered = filtered.filter(request =>
      initiatorFilters.value.includes(request.initiatorType)
    )
  }

  return filtered
})

const toggleListening = () => {
  if (isListening.value) {
    stopListening()
  } else {
    startListening()
  }
}

const toggleMethodFilter = (method: string) => {
  const index = methodFilters.value.indexOf(method)
  if (index > -1) {
    methodFilters.value.splice(index, 1)
  } else {
    methodFilters.value.push(method)
  }
}

const toggleInitiatorFilter = (type: string) => {
  const index = initiatorFilters.value.indexOf(type)
  if (index > -1) {
    initiatorFilters.value.splice(index, 1)
  } else {
    initiatorFilters.value.push(type)
  }
}

const getMethodActiveClass = (method: string) => {
  switch (method) {
    case 'GET': return 'bg-green-100 text-green-800 border border-green-300'
    case 'POST': return 'bg-blue-100 text-blue-800 border border-blue-300'
    case 'PUT': return 'bg-yellow-100 text-yellow-800 border border-yellow-300'
    case 'DELETE': return 'bg-red-100 text-red-800 border border-red-300'
    default: return 'bg-gray-100 text-gray-800 border border-gray-300'
  }
}

const getInitiatorActiveClass = (type: string) => {
  switch (type) {
    case 'fetch': return 'bg-blue-100 text-blue-800 border border-blue-300'
    case 'xhr': return 'bg-green-100 text-green-800 border border-green-300'
    case 'script': return 'bg-purple-100 text-purple-800 border border-purple-300'
    case 'css': return 'bg-orange-100 text-orange-800 border border-orange-300'
    case 'websocket': return 'bg-red-100 text-red-800 border border-red-300'
    default: return 'bg-gray-100 text-gray-800 border border-gray-300'
  }
}

const getLastPathSegment = (url: string) => {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    // 移除末尾的斜杠并分割路径
    const segments = pathname.replace(/\/$/, '').split('/')
    // 返回最后一个非空路径段，如果没有则返回根路径标识
    const lastSegment = segments[segments.length - 1]
    return lastSegment || '/'
  } catch {
    // 如果URL解析失败，返回原URL的最后部分
    const segments = url.split('/')
    return segments[segments.length - 1] || url
  }
}

const getContentType = (mimeType: string) => {
  if (!mimeType) return ''
  if (mimeType.includes('javascript')) return 'JS'
  if (mimeType.includes('css')) return 'CSS'
  if (mimeType.includes('html')) return 'HTML'
  if (mimeType.includes('json')) return 'JSON'
  if (mimeType.includes('image')) return 'IMG'
  if (mimeType.includes('font')) return 'Font'
  return mimeType.split('/')[0].toUpperCase()
}

const getInitiatorTypeDisplay = (type: string) => {
  switch (type) {
    case 'fetch': return 'Fetch'
    case 'xhr': return 'XHR'
    case 'script': return 'Script'
    case 'css': return 'CSS'
    case 'websocket': return 'WS'
    case 'parser': return 'Parser'
    case 'other': return 'Other'
    default: return 'Unknown'
  }
}

// 拖拽功能
const startResize = (e: MouseEvent) => {
  isResizing.value = true
  startX = e.clientX
  startWidth = requestsWidth.value

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', endResize)
  document.body.style.cursor = 'col-resize'
  e.preventDefault()
}

const handleResize = (e: MouseEvent) => {
  if (!isResizing.value) return

  const deltaX = e.clientX - startX
  const newWidth = startWidth + deltaX

  // 限制最小和最大宽度
  const minWidth = 300
  const maxWidth = window.innerWidth - 300

  requestsWidth.value = Math.max(minWidth, Math.min(maxWidth, newWidth))
}

const endResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', endResize)
  document.body.style.cursor = 'default'
}

onMounted(() => {
  // 初始化宽度为窗口宽度的一半
  requestsWidth.value = Math.max(400, window.innerWidth * 0.5)
})

onUnmounted(() => {
  // 清理事件监听器
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', endResize)
})
</script>

<style scoped>
/* 保留必要的自定义样式用于拖拽功能 */
.cursor-col-resize {
  cursor: col-resize;
}

/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
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

/* 表格样式优化 */
table {
  table-layout: fixed;
}

/* 确保表头固定 */
thead th {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #f9fafb;
}
</style>
