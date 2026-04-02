// electron/preload.ts

import { contextBridge, ipcRenderer } from 'electron';

export interface KcItem {
  id?: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  create_time?: string;
}

// ✅ 新增查询参数接口
export interface KcQueryParams {
  keyword?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

contextBridge.exposeInMainWorld('electronAPI', {
  kc: {
    // ✅ 修改 getList 支持参数
    getList: (params?: KcQueryParams): Promise<ApiResponse<KcItem[]>> => 
      ipcRenderer.invoke('kc:getList', params),
    add: (data: KcItem): Promise<ApiResponse<KcItem>> => 
      ipcRenderer.invoke('kc:add', data),
    update: (data: KcItem): Promise<ApiResponse<void>> => 
      ipcRenderer.invoke('kc:update', data),
    delete: (id: number): Promise<ApiResponse<void>> => 
      ipcRenderer.invoke('kc:delete', id),
  }
});
