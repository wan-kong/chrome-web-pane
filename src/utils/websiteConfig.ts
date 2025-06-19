// 网站配置文件
export interface WebsiteConfig {
  name: string
  url: string
  method: 'GET' | 'POST'
  paramName: string
  additionalParams?: Record<string, string>
}

// 预设的两个网站配置
export const DEFAULT_WEBSITE_CONFIGS: WebsiteConfig[] = [
  {
    name: 'SSE 解析',
    url: 'https://sse.cani.chat/',
    method: 'POST',
    paramName: 'content'
  },
  {
    name: 'Agno解析',
    url: 'https://agno.cani.chat/',
    method: 'GET',
    paramName: 'input'
  }
]

// 缓存键名
const CACHE_KEY = 'chrome-web-pane-website-configs'

// 从缓存读取配置
export const loadWebsiteConfigs = (): WebsiteConfig[] => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const configs = JSON.parse(cached)
      // 验证配置格式
      if (Array.isArray(configs) && configs.every(isValidConfig)) {
        return configs
      }
    }
  } catch (error) {
    console.warn('读取网站配置缓存失败:', error)
  }
  // 如果没有缓存或格式错误，返回默认配置
  return JSON.parse(JSON.stringify(DEFAULT_WEBSITE_CONFIGS))
}

// 保存配置到缓存
export const saveWebsiteConfigs = (configs: WebsiteConfig[]): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(configs))
  } catch (error) {
    console.error('保存网站配置失败:', error)
  }
}

// 验证配置格式
const isValidConfig = (config: any): config is WebsiteConfig => {
  return (
    typeof config === 'object' &&
    typeof config.name === 'string' &&
    typeof config.url === 'string' &&
    (config.method === 'GET' || config.method === 'POST') &&
    typeof config.paramName === 'string'
  )
}

// 当前配置（从缓存加载）
export const WEBSITE_CONFIGS = loadWebsiteConfigs()

// 获取配置的辅助函数
export const getWebsiteConfig = (index: number): WebsiteConfig | null => {
  return WEBSITE_CONFIGS[index] || null
}

// 检查URL是否有效
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
