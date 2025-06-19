<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-1 sm:p-2" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-xl mx-auto max-h-[95vh] sm:max-h-[85vh] overflow-hidden flex flex-col">
      <!-- 头部 -->
      <div class="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 flex-shrink-0">
        <h3 class="text-sm sm:text-base font-semibold text-gray-900">网站配置设置</h3>
        <button 
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- 内容 -->
      <div class="p-3 sm:p-4 overflow-y-auto flex-1 min-h-0">
        <div class="space-y-3 sm:space-y-4">
          <div v-for="(config, index) in localConfigs" :key="index" class="border border-gray-200 rounded p-2 sm:p-3 relative">
            <!-- 删除按钮 -->
            <button 
              v-if="localConfigs.length > 1"
              @click="removeConfig(index)"
              class="absolute top-1.5 right-1.5 text-red-400 hover:text-red-600 transition-colors p-0.5"
              title="删除此配置"
            >
              <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>

            <h4 class="text-xs sm:text-sm font-medium text-gray-900 mb-2 pr-6">网站 {{ index + 1 }}</h4>
            
            <div class="grid grid-cols-1 gap-2 sm:gap-3">
              <!-- 名称 -->
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">名称</label>
                <input 
                  v-model="config.name"
                  type="text"
                  class="w-full px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入网站名称"
                />
              </div>

              <!-- URL -->
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">URL</label>
                <input 
                  v-model="config.url"
                  type="url"
                  class="w-full px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              <!-- 方法和参数名 -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">请求方法</label>
                  <select 
                    v-model="config.method"
                    class="w-full px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">参数名</label>
                  <input 
                    v-model="config.paramName"
                    type="text"
                    class="w-full px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    placeholder="content"
                  />
                </div>
              </div>

              <!-- 额外参数 -->
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">额外参数 (可选)</label>
                <textarea 
                  v-model="additionalParamsText[index]"
                  class="w-full px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder="格式: key1=value1&#10;key2=value2"
                ></textarea>
                <p class="text-xs text-gray-500 mt-0.5">每行一个参数，格式为 key=value</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="flex flex-col sm:flex-row sm:items-center px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-200 bg-gray-50 gap-2 flex-shrink-0">
        <!-- 左侧按钮组 -->
        <div class="flex flex-col sm:flex-row gap-1.5 sm:gap-2 order-1">
          <button 
            @click="addNewConfig"
            class="w-full sm:w-auto px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors flex items-center justify-center gap-1.5"
          >
            <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            新增配置
          </button>
          <button 
            @click="resetToDefaults"
            class="w-full sm:w-auto px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            恢复默认
          </button>
        </div>
        
        <!-- 右侧按钮组 -->
        <div class="flex flex-col sm:flex-row gap-1.5 sm:gap-2 order-2 sm:ml-auto">
          <button 
            @click="$emit('close')"
            class="w-full sm:w-auto px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            取消
          </button>
          <button 
            @click="saveSettings"
            class="w-full sm:w-auto px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { DEFAULT_WEBSITE_CONFIGS, loadWebsiteConfigs, saveWebsiteConfigs, type WebsiteConfig } from '../../utils/websiteConfig'

const emit = defineEmits<{
  close: []
  save: [configs: WebsiteConfig[]]
}>()

// 本地配置副本
const localConfigs = ref<WebsiteConfig[]>([])

// 额外参数的文本表示
const additionalParamsText = ref<string[]>([])

// 初始化配置
onMounted(() => {
  loadCurrentConfigs()
})

// 加载当前配置
const loadCurrentConfigs = () => {
  const configs = loadWebsiteConfigs()
  localConfigs.value = JSON.parse(JSON.stringify(configs))
  updateAdditionalParamsText()
}

// 更新额外参数文本
const updateAdditionalParamsText = () => {
  additionalParamsText.value = localConfigs.value.map(config => {
    if (config.additionalParams) {
      return Object.entries(config.additionalParams)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n')
    }
    return ''
  })
}

// 新增配置
const addNewConfig = () => {
  const newConfig: WebsiteConfig = {
    name: '',
    url: '',
    method: 'GET',
    paramName: ''
  }
  localConfigs.value.push(newConfig)
  additionalParamsText.value.push('')
}

// 删除配置
const removeConfig = (index: number) => {
  if (localConfigs.value.length <= 1) {
    alert('至少需要保留一个网站配置')
    return
  }
  
  if (confirm('确定要删除这个网站配置吗？')) {
    localConfigs.value.splice(index, 1)
    additionalParamsText.value.splice(index, 1)
  }
}

// 重置为默认配置
const resetToDefaults = () => {
  if (confirm('确定要恢复到默认配置吗？这将清除所有自定义配置。')) {
    localConfigs.value = JSON.parse(JSON.stringify(DEFAULT_WEBSITE_CONFIGS))
    updateAdditionalParamsText()
  }
}

// 解析额外参数文本
const parseAdditionalParams = (text: string): Record<string, string> | undefined => {
  if (!text.trim()) return undefined
  
  const params: Record<string, string> = {}
  const lines = text.split('\n').filter(line => line.trim())
  
  for (const line of lines) {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      params[key.trim()] = valueParts.join('=').trim()
    }
  }
  
  return Object.keys(params).length > 0 ? params : undefined
}

// 保存设置
const saveSettings = () => {
  // 更新配置中的额外参数
  localConfigs.value.forEach((config, index) => {
    config.additionalParams = parseAdditionalParams(additionalParamsText.value[index])
  })
  
  // 验证配置
  const isValid = localConfigs.value.every(config => 
    config.name.trim() && 
    config.url.trim() && 
    config.paramName.trim()
  )
  
  if (!isValid) {
    alert('请填写完整的配置信息')
    return
  }
  
  try {
    // 保存到缓存
    saveWebsiteConfigs(localConfigs.value)
    
    emit('save', localConfigs.value)
    emit('close')
  } catch (error) {
    console.error('保存配置失败:', error)
    alert('保存配置失败，请重试')
  }
}
</script> 
