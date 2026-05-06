import { httpGet } from './http'

// 后端 /api/health 的返回结构定义。
export type HealthResponse = {
  message: string
  time: string
}

// 首页健康检查接口。
export function getHealth() {
  return httpGet<HealthResponse>('/health')
}
