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
			default: '',
			placeholder: '请输入从公众号获取的API密钥',
			required: true,
			description: '🔑 获取方式：关注公众号"西羊石AI视频" → 发送"API" → 复制密钥到此处 | 官网: https://xysaiai.cn/',
		},
		{
			displayName: '个人微信服务地址 (可选)',
			name: 'serviceUrl',
			type: 'string',
			default: 'http://localhost:3000',
			placeholder: 'http://localhost:3000',
			required: false,
			description: '📱 仅个人微信功能需要此配置 | 本地: http://localhost:3000 | Docker: http://host.docker.internal:3000 | 云端: http://您的IP:3000 | 🏢 企业微信用户可跳过',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.serviceUrl || "http://localhost:3000"}}',
			url: '/health',
			method: 'GET',
		},
	};
}