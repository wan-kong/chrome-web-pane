import { ref, onMounted, onUnmounted } from "vue"

// 常量定义
const MAX_REQUESTS = 1000 // 最大请求数量限制
const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const
const BYTES_PER_UNIT = 1024

// 改进类型定义
export interface RequestHeader {
  name: string
  value: string
}

export interface PostData {
  text?: string
  params?: Array<{ name: string; value: string }>
}

export interface RequestInitiator {
  type: string
  stack?: any
  url?: string
  lineNumber?: number
}

export interface ResponseContent {
  content: string
  encoding: string
  mimeType?: string
}

export interface NetworkRequest {
  id: string
  url: string
  method: string
  status: number
  statusText: string
  type: string
  size: number
  time: number
  timestamp: number
  responseHeaders: Record<string, string>
  requestHeaders: Record<string, string>
  requestBody?: string | PostData
  initiator?: RequestInitiator
  response?: ResponseContent
  // 新增：请求发起方类型
  initiatorType: 'fetch' | 'xhr' | 'script' | 'css' | 'websocket' | 'parser' | 'other' | 'unknown'
  resourceType: 'document' | 'stylesheet' | 'script' | 'image' | 'font' | 'xhr' | 'fetch' | 'websocket' | 'other'
}

export const useChromeRequest = () => {
  const requests = ref<NetworkRequest[]>([])
  const isListening = ref(false)
  const selectedRequest = ref<NetworkRequest | null>(null)

  let requestListener: ((request: chrome.devtools.network.Request) => void) | null = null

  // 辅助函数：将headers数组转换为对象
  const headersToObject = (headers?: RequestHeader[]): Record<string, string> => {
    if (!headers) return {}
    return headers.reduce((acc: Record<string, string>, header) => {
      acc[header.name] = header.value
      return acc
    }, {})
  }

  // 辅助函数：生成唯一ID
  const generateRequestId = (url: string): string => {
    return `${url}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 辅助函数：限制请求列表大小
  const limitRequestsSize = () => {
    if (requests.value.length > MAX_REQUESTS) {
      requests.value = requests.value.slice(0, MAX_REQUESTS)
    }
  }

  // 辅助函数：安全获取请求体
  const getRequestBody = (request: chrome.devtools.network.Request): string | PostData | undefined => {
    try {
      const postData = (request.request as any).postData
      if (!postData) return undefined

      if (typeof postData.text === 'string') {
        return postData.text
      }

      if (Array.isArray(postData.params)) {
        return { params: postData.params }
      }

      return postData
    } catch (error) {
      console.warn('Failed to get request body:', error)
      return undefined
    }
  }

  // 辅助函数：安全获取initiator信息
  const getInitiator = (request: chrome.devtools.network.Request): RequestInitiator | undefined => {
    try {
      const initiator = (request.request as any).initiator
      if (!initiator) return undefined

      return {
        type: initiator.type || 'unknown',
        stack: initiator.stack,
        url: initiator.url,
        lineNumber: initiator.lineNumber
      }
    } catch (error) {
      console.warn('Failed to get initiator info:', error)
      return undefined
    }
  }

  // 辅助函数：判断请求发起方类型
  const getInitiatorType = (request: chrome.devtools.network.Request): 'fetch' | 'xhr' | 'script' | 'css' | 'websocket' | 'parser' | 'other' | 'unknown' => {
    try {
      const initiator = (request.request as any).initiator
      const url = request.request.url
      const mimeType = request.response?.content?.mimeType || ''

      // 检查WebSocket
      if (url.startsWith('ws://') || url.startsWith('wss://')) {
        return 'websocket'
      }

      // 通过initiator类型判断
      if (initiator?.type) {
        switch (initiator.type) {
          case 'script':
            // 进一步判断是fetch还是xhr
            if (initiator.stack) {
              const stackTrace = JSON.stringify(initiator.stack)
              if (stackTrace.includes('fetch') || stackTrace.includes('fetch.js')) {
                return 'fetch'
              }
              if (stackTrace.includes('XMLHttpRequest') || stackTrace.includes('xhr')) {
                return 'xhr'
              }
            }
            return 'script'
          case 'parser':
            // 通过MIME类型判断是CSS还是其他
            if (mimeType.includes('css') || url.includes('.css')) {
              return 'css'
            }
            return 'parser'
          case 'other':
            return 'other'
        }
      }

      // 通过请求头判断
      const requestHeaders = request.request.headers || []
      const acceptHeader = requestHeaders.find(h => h.name.toLowerCase() === 'accept')?.value || ''

      // fetch请求通常有特定的Accept头
      if (acceptHeader.includes('application/json') || acceptHeader.includes('*/*')) {
        // 检查是否有fetch特征的User-Agent或其他头
        const hasModernHeaders = requestHeaders.some(h =>
          h.name.toLowerCase() === 'sec-fetch-mode' ||
          h.name.toLowerCase() === 'sec-fetch-dest'
        )
        if (hasModernHeaders) {
          return 'fetch'
        }
      }

      // 通过URL和MIME类型推断
      if (mimeType.includes('css') || url.includes('.css')) {
        return 'css'
      }
      if (mimeType.includes('javascript') || url.includes('.js')) {
        return 'script'
      }

      return 'unknown'
    } catch (error) {
      console.warn('Failed to determine initiator type:', error)
      return 'unknown'
    }
  }

  // 辅助函数：判断资源类型
  const getResourceType = (request: chrome.devtools.network.Request): 'document' | 'stylesheet' | 'script' | 'image' | 'font' | 'xhr' | 'fetch' | 'websocket' | 'other' => {
    try {
      const url = request.request.url
      const mimeType = request.response?.content?.mimeType || ''
      const initiatorType = getInitiatorType(request)

      // 基于发起方类型直接映射
      if (initiatorType === 'fetch') return 'fetch'
      if (initiatorType === 'xhr') return 'xhr'
      if (initiatorType === 'websocket') return 'websocket'
      if (initiatorType === 'css') return 'stylesheet'

      // 基于MIME类型判断
      if (mimeType.includes('html')) return 'document'
      if (mimeType.includes('css')) return 'stylesheet'
      if (mimeType.includes('javascript')) return 'script'
      if (mimeType.includes('image')) return 'image'
      if (mimeType.includes('font')) return 'font'

      // 基于URL扩展名判断
      if (url.match(/\.(css)(\?|$)/i)) return 'stylesheet'
      if (url.match(/\.(js|jsx|ts|tsx|mjs)(\?|$)/i)) return 'script'
      if (url.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)(\?|$)/i)) return 'image'
      if (url.match(/\.(woff|woff2|ttf|otf|eot)(\?|$)/i)) return 'font'
      if (url.match(/\.(html|htm)(\?|$)/i)) return 'document'

      return 'other'
    } catch (error) {
      console.warn('Failed to determine resource type:', error)
      return 'other'
    }
  }

  const startListening = () => {
    if (!chrome.devtools?.network) {
      console.error('Chrome devtools network API not available')
      return
    }

    if (isListening.value) {
      console.warn('Already listening to network requests')
      return
    }

    isListening.value = true

    requestListener = (request: chrome.devtools.network.Request) => {
      try {
        // 获取请求的详细信息
        request.getContent((content, encoding) => {
          try {
            const networkRequest: NetworkRequest = {
              id: generateRequestId(request.request.url),
              url: request.request.url,
              method: request.request.method,
              status: request.response?.status || 0,
              statusText: request.response?.statusText || '',
              type: request.response?.content?.mimeType || '',
              size: request.response?.bodySize || 0,
              time: request.time || 0,
              timestamp: Date.now(),
              responseHeaders: headersToObject(request.response?.headers),
              requestHeaders: headersToObject(request.request.headers),
              requestBody: getRequestBody(request),
              initiator: getInitiator(request),
              initiatorType: getInitiatorType(request),
              resourceType: getResourceType(request),
              response: {
                content: content || '',
                encoding: encoding || '',
                mimeType: request.response?.content?.mimeType
              }
            }

            requests.value.unshift(networkRequest)
            limitRequestsSize()
          } catch (error) {
            console.error('Error processing network request:', error)
          }
        })
      } catch (error) {
        console.error('Error in request listener:', error)
      }
    }

    chrome.devtools.network.onRequestFinished.addListener(requestListener)
  }

  const stopListening = () => {
    try {
      if (requestListener && chrome.devtools?.network) {
        chrome.devtools.network.onRequestFinished.removeListener(requestListener)
        requestListener = null
      }
      isListening.value = false
    } catch (error) {
      console.error('Error stopping network listener:', error)
      isListening.value = false
    }
  }

  const clearRequests = () => {
    requests.value = []
    selectedRequest.value = null
  }

  const selectRequest = (request: NetworkRequest) => {
    selectedRequest.value = request
  }

  // 改进的格式化函数
  const formatSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B'

    const unitIndex = Math.floor(Math.log(bytes) / Math.log(BYTES_PER_UNIT))
    const clampedIndex = Math.min(unitIndex, SIZE_UNITS.length - 1)
    const size = bytes / Math.pow(BYTES_PER_UNIT, clampedIndex)

    return `${size.toFixed(size >= 100 ? 0 : 2)} ${SIZE_UNITS[clampedIndex]}`
  }

  const formatTime = (time: number): string => {
    if (!time || time === 0) return '0ms'

    if (time < 1000) {
      return `${Math.round(time)}ms`
    } else if (time < 60000) {
      return `${(time / 1000).toFixed(2)}s`
    } else {
      const minutes = Math.floor(time / 60000)
      const seconds = ((time % 60000) / 1000).toFixed(0)
      return `${minutes}m ${seconds}s`
    }
  }

  // 新增：获取请求统计信息
  const getRequestStats = () => {
    const totalRequests = requests.value.length
    const totalSize = requests.value.reduce((sum, req) => sum + req.size, 0)
    const avgTime = totalRequests > 0
      ? requests.value.reduce((sum, req) => sum + req.time, 0) / totalRequests
      : 0

    return {
      totalRequests,
      totalSize: formatSize(totalSize),
      avgTime: formatTime(avgTime)
    }
  }

  // 新增：按类型过滤请求
  const filterRequestsByType = (type: string) => {
    return requests.value.filter(req => req.type.includes(type))
  }

  // 新增：搜索请求
  const searchRequests = (query: string) => {
    const lowerQuery = query.toLowerCase()
    return requests.value.filter(req =>
      req.url.toLowerCase().includes(lowerQuery) ||
      req.method.toLowerCase().includes(lowerQuery) ||
      req.statusText.toLowerCase().includes(lowerQuery)
    )
  }

  onMounted(() => {
    startListening()
  })

  onUnmounted(() => {
    stopListening()
  })

  return {
    requests,
    isListening,
    selectedRequest,
    startListening,
    stopListening,
    clearRequests,
    selectRequest,
    formatSize,
    formatTime,
    getRequestStats,
    filterRequestsByType,
    searchRequests
  }
}
