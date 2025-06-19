// 通用工具函数库

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func(...args)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T
  }

  if (obj instanceof Object) {
    const clonedObj = {} as { [key: string]: any }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj as T
  }

  return obj
}

/**
 * 格式化字节大小
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 格式化时间
 */
export function formatTime(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${Math.round(milliseconds)}ms`
  } else if (milliseconds < 60000) {
    return `${(milliseconds / 1000).toFixed(2)}s`
  } else if (milliseconds < 3600000) {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  } else {
    const hours = Math.floor(milliseconds / 3600000)
    const minutes = Math.floor((milliseconds % 3600000) / 60000)
    return `${hours}h ${minutes}m`
  }
}

/**
 * URL 解析工具
 */
export class URLUtils {
  static getFileName(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const fileName = pathname.split('/').pop() || urlObj.hostname
      return fileName || 'index'
    } catch {
      const parts = url.split('/')
      return parts[parts.length - 1] || url
    }
  }

  static getDomain(url: string): string {
    try {
      return new URL(url).hostname
    } catch {
      return 'unknown'
    }
  }

  static getProtocol(url: string): string {
    try {
      return new URL(url).protocol
    } catch {
      return 'unknown'
    }
  }

  static addQueryParam(url: string, key: string, value: string): string {
    try {
      const urlObj = new URL(url)
      urlObj.searchParams.set(key, value)
      return urlObj.toString()
    } catch {
      const separator = url.includes('?') ? '&' : '?'
      return `${url}${separator}${key}=${encodeURIComponent(value)}`
    }
  }
}

/**
 * 类型检查工具
 */
export class TypeUtils {
  static isObject(value: any): value is object {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
  }

  static isArray(value: any): value is any[] {
    return Array.isArray(value)
  }

  static isString(value: any): value is string {
    return typeof value === 'string'
  }

  static isNumber(value: any): value is number {
    return typeof value === 'number' && !isNaN(value)
  }

  static isFunction(value: any): value is Function {
    return typeof value === 'function'
  }

  static isEmpty(value: any): boolean {
    if (value == null) return true
    if (typeof value === 'string' || Array.isArray(value)) return value.length === 0
    if (typeof value === 'object') return Object.keys(value).length === 0
    return false
  }
}

/**
 * 本地存储工具
 */
export class StorageUtils {
  static setItem(key: string, value: any): boolean {
    try {
      const serializedValue = JSON.stringify(value)
      localStorage.setItem(key, serializedValue)
      return true
    } catch (error) {
      console.error('Failed to set localStorage item:', error)
      return false
    }
  }

  static getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return defaultValue || null
      return JSON.parse(item)
    } catch (error) {
      console.error('Failed to get localStorage item:', error)
      return defaultValue || null
    }
  }

  static removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Failed to remove localStorage item:', error)
      return false
    }
  }

  static clear(): boolean {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
      return false
    }
  }
}

/**
 * 颜色工具
 */
export class ColorUtils {
  static getStatusColor(status: number): string {
    if (status >= 200 && status < 300) return 'green'
    if (status >= 300 && status < 400) return 'yellow'
    if (status >= 400 && status < 500) return 'orange'
    if (status >= 500) return 'red'
    return 'gray'
  }

  static getMethodColor(method: string): string {
    switch (method.toUpperCase()) {
      case 'GET': return 'green'
      case 'POST': return 'blue'
      case 'PUT': return 'yellow'
      case 'DELETE': return 'red'
      case 'PATCH': return 'purple'
      case 'HEAD': return 'gray'
      case 'OPTIONS': return 'gray'
      default: return 'gray'
    }
  }

  static hexToRgba(hex: string, alpha = 1): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return `rgba(0, 0, 0, ${alpha})`

    const r = parseInt(result[1], 16)
    const g = parseInt(result[2], 16)
    const b = parseInt(result[3], 16)

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
}

/**
 * 性能监控工具
 */
export class PerformanceUtils {
  private static marks = new Map<string, number>()

  static mark(name: string): void {
    this.marks.set(name, performance.now())
  }

  static measure(name: string, startMark?: string): number {
    const now = performance.now()
    const start = startMark ? this.marks.get(startMark) : this.marks.get(name)

    if (start === undefined) {
      console.warn(`Mark '${startMark || name}' not found`)
      return 0
    }

    const duration = now - start
    console.log(`Performance measure '${name}': ${duration.toFixed(2)}ms`)
    return duration
  }

  static clearMark(name: string): void {
    this.marks.delete(name)
  }

  static clearAllMarks(): void {
    this.marks.clear()
  }
}
