// src/types.d.ts

export interface KcItem {
  id?: number | null
  name: string
  category: string
  price: number | string
  stock: number | string
  create_time?: string
}

// ✅ 新增查询参数
export interface KcQueryParams {
  keyword?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

interface ElectronAPI {
  kc: {
    getList: (params?: KcQueryParams) => Promise<ApiResponse<KcItem[]>>
    add: (data: KcItem) => Promise<ApiResponse<KcItem>>
    update: (data: KcItem) => Promise<ApiResponse<void>>
    delete: (id: number) => Promise<ApiResponse<void>>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
