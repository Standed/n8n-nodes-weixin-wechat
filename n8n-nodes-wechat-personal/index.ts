import { WechatPersonalApi } from './credentials/WechatPersonalApi.credentials';
import { WechatPersonalSend } from './nodes/WechatPersonalSend.node';

export const nodes = [WechatPersonalSend];
export const credentials = [WechatPersonalApi];