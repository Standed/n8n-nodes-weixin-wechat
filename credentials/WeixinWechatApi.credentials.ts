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
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: 'https://xysaiai.cn/',
			required: true,
			description: '🔑 关注公众号"西羊石AI视频"发送"API"获取免费密钥 | 官网: https://xysaiai.cn/',
		},
		{
			displayName: '个人微信服务地址',
			name: 'serviceUrl',
			type: 'string',
			default: 'http://localhost:3001',
			required: true,
			description: '个人微信PC服务地址 | 本地: http://localhost:3001 | Docker: http://host.docker.internal:3001 | 云端: http://您的PC公网IP:3001',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.serviceUrl || "http://localhost:3001"}}',
			url: '/health',
			method: 'GET',
		},
	};
}