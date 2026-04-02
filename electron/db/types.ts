// electron/db/types.ts

export interface KcQueryParams {
  keyword?: string;  // 搜索关键词
}

export interface KcItem {
  id?: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  create_time?: string;
}

export interface DbService {
  addKc(data: KcItem): Promise<KcItem>;
  deleteKc(id: number): Promise<boolean>;
  updateKc(data: KcItem): Promise<KcItem>;
   getKcList(params?: KcQueryParams): Promise<KcItem[]>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
