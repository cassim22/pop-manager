import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, parseISO, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"

// Utility para combinar classes CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatação de datas
export const formatDate = (date: Date | string, pattern: string = "dd/MM/yyyy") => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return 'Data inválida'
  return format(dateObj, pattern, { locale: ptBR })
}

export const formatDateTime = (date: Date | string) => {
  return formatDate(date, "dd/MM/yyyy 'às' HH:mm")
}

export const formatTimeAgo = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return 'Data inválida'
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: ptBR })
}

// Formatação de números
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export const formatNumber = (value: number, decimals: number = 0) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

export const formatPercentage = (value: number, decimals: number = 1) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100)
}

// Formatação de texto
export const formatCEP = (cep: string) => {
  const cleaned = cep.replace(/\D/g, '')
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2')
}

export const formatPhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

export const formatCPF = (cpf: string) => {
  const cleaned = cpf.replace(/\D/g, '')
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export const formatCNPJ = (cnpj: string) => {
  const cleaned = cnpj.replace(/\D/g, '')
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

// Validações
export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidCEP = (cep: string) => {
  const cleaned = cep.replace(/\D/g, '')
  return cleaned.length === 8
}

export const isValidPhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10 || cleaned.length === 11
}

export const isValidCPF = (cpf: string) => {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) return false
  
  // Validação do CPF
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleaned.charAt(9))) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleaned.charAt(10))) return false
  
  return true
}

// Utilitários de string
export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const capitalizeWords = (str: string) => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

export const slugify = (str: string) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9 -]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim()
}

// Utilitários de array
export const groupBy = <T, K extends keyof any>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const group = key(item)
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<K, T[]>)
}

export const sortBy = <T>(
  array: T[],
  key: keyof T | ((item: T) => any),
  direction: 'asc' | 'desc' = 'asc'
) => {
  return [...array].sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : a[key]
    const bVal = typeof key === 'function' ? key(b) : b[key]
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

export const uniqueBy = <T, K>(
  array: T[],
  key: (item: T) => K
): T[] => {
  const seen = new Set<K>()
  return array.filter(item => {
    const k = key(item)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

// Utilitários de objeto
export const omit = <T, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj }
  keys.forEach(key => delete result[key])
  return result
}

export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

// Utilitários de URL
export const buildQueryString = (params: Record<string, any>) => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)))
      } else {
        searchParams.append(key, String(value))
      }
    }
  })
  
  return searchParams.toString()
}

export const parseQueryString = (queryString: string) => {
  const params = new URLSearchParams(queryString)
  const result: Record<string, string | string[]> = {}
  
  for (const [key, value] of params.entries()) {
    if (result[key]) {
      if (Array.isArray(result[key])) {
        (result[key] as string[]).push(value)
      } else {
        result[key] = [result[key] as string, value]
      }
    } else {
      result[key] = value
    }
  }
  
  return result
}

// Utilitários de arquivo
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getFileExtension = (filename: string) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

export const isImageFile = (filename: string) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
  const extension = getFileExtension(filename).toLowerCase()
  return imageExtensions.includes(extension)
}

// Utilitários de cor
export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    operacional: 'text-success-700 bg-success-100',
    manutencao: 'text-warning-700 bg-warning-100',
    critico: 'text-danger-700 bg-danger-100',
    desmobilizacao: 'text-gray-700 bg-gray-100',
    desmobilizado: 'text-gray-800 bg-gray-200',
    ativo: 'text-success-700 bg-success-100',
    inativo: 'text-gray-700 bg-gray-100',
    pendente: 'text-warning-700 bg-warning-100',
    em_andamento: 'text-info-700 bg-info-100',
    concluida: 'text-success-700 bg-success-100',
    cancelada: 'text-gray-700 bg-gray-100',
    disponivel: 'text-success-700 bg-success-100',
    em_atendimento: 'text-info-700 bg-info-100',
    ferias: 'text-warning-700 bg-warning-100',
    licenca: 'text-gray-700 bg-gray-100',
  }
  
  return colors[status] || 'text-gray-700 bg-gray-100'
}

export const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    baixa: 'text-gray-700 bg-gray-100',
    media: 'text-info-700 bg-info-100',
    alta: 'text-warning-700 bg-warning-100',
    critica: 'text-danger-700 bg-danger-100',
  }
  
  return colors[priority] || 'text-gray-700 bg-gray-100'
}

// Utilitários de debounce e throttle
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Utilitários de localStorage
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch {
      return defaultValue || null
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Silently fail
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch {
      // Silently fail
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear()
    } catch {
      // Silently fail
    }
  }
}

// Utilitários de coordenadas
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371 // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Utilitários de validação de coordenadas
export const isValidCoordinate = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

// Utilitários de geração de ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Utilitários de erro
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Erro desconhecido'
}

// Utilitários de loading state
export const createLoadingArray = (length: number) => {
  return Array.from({ length }, (_, i) => ({ id: i, loading: true }))
}