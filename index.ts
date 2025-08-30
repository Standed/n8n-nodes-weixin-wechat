import { WeixinWechatApi } from './credentials/WeixinWechatApi.credentials';
import { WeixinWechatSend } from './nodes/WeixinWechatSend.node';

export const nodes = [WeixinWechatSend];
export const credentials = [WeixinWechatApi];