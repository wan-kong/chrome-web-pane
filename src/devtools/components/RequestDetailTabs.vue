<template>
    <div class="flex flex-col h-full bg-white">
        <!-- 标签页头部 -->
                 <div class="flex border-b border-gray-200 bg-gray-50">
             <button v-for="tab in availableTabs" :key="tab.key"
                 class="px-2 py-1 text-xs font-medium border-b-2 transition-all duration-200 whitespace-nowrap focus:outline-none"
                 :class="activeTab === tab.key
                     ? 'text-blue-600 border-blue-600 bg-white'
                     : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-100'" @click="activeTab = tab.key">
                 <div class="flex items-center space-x-1">
                     <span class="text-xs">{{ tab.icon }}</span>
                     <span>{{ tab.label }}</span>
                     <span v-if="tab.badge"
                         class="inline-flex items-center px-1 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                         {{ tab.badge }}
                     </span>
                 </div>
             </button>
         </div>

        <!-- 标签页内容 -->
        <div class="flex-1 overflow-hidden">
            <div class="h-full overflow-y-auto">
                <HeadersPanel v-if="activeTab === 'headers'" :request="request" />
                <RequestBodyPanel v-if="activeTab === 'body'" :request="request" />
                <ResponsePanel v-if="activeTab === 'response'" :request="request" />
                <RawPanel v-if="activeTab === 'raw'" :request="request" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import HeadersPanel from './tabs/HeadersPanel.vue'
import RequestBodyPanel from './tabs/RequestBodyPanel.vue'
import ResponsePanel from './tabs/ResponsePanel.vue'
import RawPanel from './tabs/RawPanel.vue'
import type { NetworkRequest } from '../hooks/useChromeRequest'

const props = defineProps<{
    request: NetworkRequest
}>()

const activeTab = ref('headers')

// 检查是否有请求体
const hasRequestBody = computed(() => {
    const methodsWithBody = ['POST', 'PUT', 'PATCH']
    return methodsWithBody.includes(props.request.method) && props.request.requestBody
})

// 生成可用的标签页
const availableTabs = computed(() => {
    const tabs = []
    
    // Headers 标签页
    const headersCount = getHeadersCount()
    tabs.push({
        key: 'headers',
        label: 'Headers',
        icon: '📋',
        badge: headersCount > 0 ? headersCount.toString() : null
    })

    // Request Body 标签页（仅在有请求体时显示）
    if (hasRequestBody.value) {
        tabs.push({
            key: 'body',
            label: 'Request Body',
            icon: '📝',
            badge: getRequestBodySize()
        })
    }

    // Response 标签页
    tabs.push({
        key: 'response',
        label: 'Response',
        icon: '📄',
        badge: getResponseSize()
    })

    // Raw 标签页
    tabs.push({
        key: 'raw',
        label: 'Raw',
        icon: '🔧',
        badge: null
    })

    return tabs
})

// 获取 Headers 数量
function getHeadersCount(): number {
    const requestHeaders = props.request.requestHeaders ? Object.keys(props.request.requestHeaders).length : 0
    const responseHeaders = props.request.responseHeaders ? Object.keys(props.request.responseHeaders).length : 0
    return requestHeaders + responseHeaders
}

// 获取请求体大小
function getRequestBodySize(): string | null {
    if (!props.request.requestBody) return null
    try {
        const bodyStr = typeof props.request.requestBody === 'string' 
            ? props.request.requestBody 
            : JSON.stringify(props.request.requestBody)
        const bytes = new Blob([bodyStr]).size
        if (bytes < 1024) return `${bytes}B`
        if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`
        return `${Math.round(bytes / (1024 * 1024))}MB`
    } catch {
        return null
    }
}

// 获取响应大小
function getResponseSize(): string | null {
    if (!props.request.size) return null
    if (props.request.size < 1024) return `${props.request.size}B`
    if (props.request.size < 1024 * 1024) return `${Math.round(props.request.size / 1024)}KB`
    return `${Math.round(props.request.size / (1024 * 1024))}MB`
}

</script>
