import { httpPost } from './http'

export type ProtocolAuthResponse = {
  ok: boolean
  message: string
}

export function verifyProtocolPassword(password: string) {
  return httpPost<ProtocolAuthResponse>('/protocol/auth', { password })
}
