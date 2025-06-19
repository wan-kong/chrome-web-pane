<template>
    <div class="h-full flex flex-col">
        <div v-if="request" class="h-full flex flex-col">
            <!-- 响应信息栏 -->
            <div class="border-b border-gray-200 px-3 py-1 bg-gray-50">
                <div class="flex items-center justify-between">
                    <div class="flex gap-4 text-xs">
                        <span class="text-gray-600">
                            <span class="font-medium text-gray-800">Size:</span> {{ formatSize(request.size) }}
                        </span>
                        <span class="text-gray-600">
                            <span class="font-medium text-gray-800">Time:</span> {{ formatTime(request.time) }}
                        </span>
                        <span class="text-gray-600">
                            <span class="font-medium text-gray-800">Type:</span> {{ request.type }}
                        </span>
                    </div>

                    <!-- 添加的按钮区域 -->
                    <div class="flex gap-2">
                        <button v-for="(config, index) in currentConfigs" :key="index"
                            @click="() => sendToWebsite(index)" :disabled="!hasResponseContent"
                            class="flex items-center px-2 py-1 text-xs font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                            :title="`发送响应到${config.name}`">
                            <span class="mr-1">📤</span>
                            {{ config.name }}
                        </button>
                        <!-- 设置按钮 -->
                        <button @click="showSettings = true"
                            class="flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500 transition-colors duration-200"
                            title="配置网站设置">
                            <span class="mr-1">⚙️</span>
                            设置
                        </button>
                    </div>
                </div>
            </div>
            <!-- 响应内容 -->
            <div class="flex-1 overflow-hidden">
                <div v-if="request.response?.content" class="h-full overflow-y-auto">
                    <div class="p-3">
                        <pre
                            class="text-xs leading-tight font-mono text-gray-900 whitespace-pre-wrap break-words"><code>{{ request.response.content }}</code></pre>
                    </div>
                </div>

                <div v-else class="flex items-center justify-center h-full text-gray-500 text-sm">
                    No response content available
                </div>
            </div>
        </div>

        <div v-else class="flex items-center justify-center h-full text-gray-500 text-sm">
            Select a request to view response
        </div>

        <!-- 设置模态框 -->
        <WebsiteSettings v-if="showSettings" @close="showSettings = false" @save="handleSaveSettings" />
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { NetworkRequest } from '../../hooks/useChromeRequest'
import { WEBSITE_CONFIGS, getWebsiteConfig, type WebsiteConfig } from '../../../utils/websiteConfig'
import WebsiteSettings from '../WebsiteSettings.vue'

interface Props {
    request: NetworkRequest | null
}

const props = defineProps<Props>()

// 状态管理
const showSettings = ref(false)
const currentConfigs = ref<WebsiteConfig[]>([...WEBSITE_CONFIGS])

// 计算是否有响应内容
const hasResponseContent = computed(() => {
    return props.request?.response?.content && props.request.response.content.trim().length > 0
})

// 处理保存设置
const handleSaveSettings = (newConfigs: WebsiteConfig[]) => {
    currentConfigs.value = [...newConfigs]
    // 这里可以添加持久化存储逻辑，比如保存到 localStorage
    try {
        localStorage.setItem('websiteConfigs', JSON.stringify(newConfigs))
        console.log('网站配置已保存:', newConfigs)
    } catch (error) {
        console.error('保存网站配置失败:', error)
    }
}

// 从本地存储加载配置
const loadConfigs = () => {
    try {
        const saved = localStorage.getItem('websiteConfigs')
        if (saved) {
            const parsedConfigs = JSON.parse(saved)
            if (Array.isArray(parsedConfigs) && parsedConfigs.length >= 2) {
                currentConfigs.value = parsedConfigs
            }
        }
    } catch (error) {
        console.error('加载网站配置失败:', error)
    }
}

// 初始化时加载配置
loadConfigs()

const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatTime = (time: number): string => {
    if (time < 1000) return `${Math.round(time)}ms`
    return `${(time / 1000).toFixed(2)}s`
}

// 通用的发送到网站的功能
const sendToWebsite = (websiteIndex: number) => {
    if (!props.request?.response?.content) {
        alert('没有可用的响应内容')
        return
    }

    const config = currentConfigs.value[websiteIndex]
    if (!config) {
        alert(`网站${websiteIndex + 1}配置不存在`)
        return
    }

    try {
        if (config.method === 'POST') {
            // 使用POST方法发送数据
            const form = document.createElement('form')
            form.method = 'POST'
            form.target = '_blank'
            form.action = config.url

            // 添加响应内容作为表单数据
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = config.paramName
            input.value = props.request.response.content
            form.appendChild(input)

            // 添加源URL信息
            const urlInput = document.createElement('input')
            urlInput.type = 'hidden'
            urlInput.name = 'source_url'
            urlInput.value = props.request.url
            form.appendChild(urlInput)

            // 添加额外参数
            if (config.additionalParams) {
                Object.entries(config.additionalParams).forEach(([key, value]) => {
                    const additionalInput = document.createElement('input')
                    additionalInput.type = 'hidden'
                    additionalInput.name = key
                    additionalInput.value = value
                    form.appendChild(additionalInput)
                })
            }

            document.body.appendChild(form)
            form.submit()
            document.body.removeChild(form)
        } else {
            // 使用GET方法发送数据
            const params = new URLSearchParams()
            params.append(config.paramName, props.request.response.content)
            params.append('source', props.request.url)

            // 添加额外参数
            if (config.additionalParams) {
                Object.entries(config.additionalParams).forEach(([key, value]) => {
                    params.append(key, value)
                })
            }

            // 构建完整的URL
            const fullUrl = `${config.url}?${params.toString()}`

            // 在新标签页中打开
            window.open(fullUrl, '_blank')
        }

        console.log(`响应内容已发送到${config.name}:`, {
            url: props.request.url,
            content: props.request.response.content,
            config: config
        })
    } catch (error) {
        console.error(`发送到${config.name}时出错:`, error)
        alert('发送失败，请检查控制台错误信息')
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
