import { 
	ICredentialType, 
	INodeProperties, 
	ICredentialTestRequest,
	ICredentialTestRequestData 
} from 'n8n-workflow';

export class WeixinWechatApi implements ICredentialType {
	name = 'weixinWechatApi';
	displayName = '西羊石AI微信插件 API';
	documentationUrl = 'https://xysaiai.cn/';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'http://localhost:3000',
			required: true,
			description: '西羊石AI微信插件服务的基础URL',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: 'https://xysaiai.cn/',
			required: true,
			description: '🔑 关注公众号"西羊石AI视频"发送"API"获取免费密钥 | 官网: https://xysaiai.cn/',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/health',
			method: 'GET',
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
			},
		},
	};
}