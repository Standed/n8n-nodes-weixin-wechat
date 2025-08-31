import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
	IHttpRequestMethods,
} from 'n8n-workflow';

const axios = require('axios');
let embeddedServicePort: number | null = null;
let embeddedServer: any = null;

// 简化的嵌入式服务
async function startSimpleEmbeddedService(): Promise<number> {
	if (embeddedServicePort && embeddedServer) {
		return embeddedServicePort;
	}

	const express = require('express');
	const cors = require('cors');
	const app = express();
	
	app.use(cors());
	app.use(express.json({ limit: '50mb' }));

	// 健康检查
	app.get('/health', (req: any, res: any) => {
		res.json({
			status: 'ok',
			service: 'simple-wechat-service',
			timestamp: new Date().toISOString(),
			port: embeddedServicePort
		});
	});

	// 发送文本消息
	app.post('/send/text', async (req: any, res: any) => {
		try {
			const { service, text, webhook, personalWechatUrl } = req.body;
			console.log(`📱 收到文本发送请求: ${service} - ${text}`);

			if (service === 'enterprise-wechat-bot') {
				if (!webhook) {
					return res.status(400).json({
						success: false,
						error: '缺少企业微信Webhook地址'
					});
				}

				const response = await axios.post(webhook, {
					msgtype: 'text',
					text: { content: text }
				});

				res.json({
					success: true,
					message: '企业微信消息发送成功',
					response: response.data
				});
			} else if (service === 'personal-wechat') {
				// 连接到个人微信自动化服务
				if (!personalWechatUrl) {
					return res.status(400).json({
						success: false,
						error: '缺少个人微信服务地址'
					});
				}

				const response = await axios.post(`${personalWechatUrl}/send/text`, req.body);
				res.json(response.data);
			} else {
				throw new Error('不支持的服务类型');
			}
		} catch (error: any) {
			console.error('发送消息失败:', error);
			res.status(500).json({
				success: false,
				error: error.message
			});
		}
	});

	// 动态端口分配
	const net = require('net');
	for (let port = 3000; port < 3100; port++) {
		try {
			await new Promise((resolve, reject) => {
				const server = app.listen(port, '0.0.0.0', () => {
					embeddedServer = server;
					embeddedServicePort = port;
					console.log(`🚀 简化微信服务已启动在端口: ${port}`);
					resolve(port);
				});
				server.on('error', (err: any) => {
					if (err.code === 'EADDRINUSE') {
						// 端口被占用，尝试下一个
					} else {
						reject(err);
					}
				});
			});
			break;
		} catch (error) {
			// 继续尝试下一个端口
		}
	}

	return embeddedServicePort!;
}

export class WeixinWechatSend implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'WeChat Send (西羊石AI)',
		name: 'weixinWechatSend',
		icon: 'file:wechat.svg',
		group: ['communication'],
		version: 1,
		description: '西羊石AI微信插件 - 企业微信机器人、个人微信自动化 | 关注公众号"西羊石AI视频"获取API',
		defaults: {
			name: 'WeChat Send',
		},
		inputs: [{ displayName: '', type: NodeConnectionType.Main }],
		outputs: [{ displayName: '', type: NodeConnectionType.Main }],
		credentials: [
			{
				name: 'weixinWechatApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'WeChat Service',
				name: 'service',
				type: 'options',
				default: 'enterprise-wechat-bot',
				options: [
					{
						name: '🏢 企业微信机器人 (推荐)',
						value: 'enterprise-wechat-bot',
						description: '发送到企业微信群，无需IP白名单，稳定可靠',
					},
					{
						name: '🙋‍♂️ 个人微信自动化',
						value: 'personal-wechat',
						description: 'PC版微信自动化，真实发送消息，支持好友和群聊',
					},
				],
				description: '选择微信服务 | 关注"西羊石AI视频"获取API | 官网: https://xysaiai.cn/',
			},
			// 企业微信配置
			{
				displayName: '企业微信Webhook地址',
				name: 'enterpriseWebhook',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				displayOptions: {
					show: { service: ['enterprise-wechat-bot'] }
				},
				placeholder: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY',
				description: '企业微信群机器人的Webhook地址 | 群设置 → 机器人 → 添加机器人',
				required: true,
			},
			// 个人微信配置
			{
				displayName: '个人微信服务地址',
				name: 'personalWechatUrl',
				type: 'string',
				default: 'http://host.docker.internal:3001',
				displayOptions: {
					show: { service: ['personal-wechat'] }
				},
				description: '个人微信自动化服务地址（需要单独部署）',
				required: true,
			},
			{
				displayName: 'Message Type',
				name: 'resource',
				type: 'options',
				default: 'message',
				options: [
					{
						name: '💬 Text Message',
						value: 'message',
						description: 'Send text message',
					},
				],
				description: 'Type of message to send',
			},
			{
				displayName: '发送目标',
				name: 'chatType',
				type: 'options',
				default: 'filehelper',
				displayOptions: {
					show: { service: ['personal-wechat'] }
				},
				options: [
					{
						name: '📁 文件传输助手 (推荐)',
						value: 'filehelper',
						description: '发送到微信文件传输助手，最安全可靠',
					},
					{
						name: '👤 联系人',
						value: 'contact',
						description: '发送给微信好友联系人',
					},
					{
						name: '👥 微信群',
						value: 'room',
						description: '发送到微信群聊',
					},
				],
				description: '选择发送目标类型',
			},
			{
				displayName: 'Message Content',
				name: 'text',
				type: 'string',
				default: '',
				typeOptions: { rows: 4 },
				displayOptions: {
					show: { resource: ['message'] }
				},
				description: '要发送的文本内容',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const service = this.getNodeParameter('service', i) as string;
				const resource = this.getNodeParameter('resource', i) as string;
				const text = this.getNodeParameter('text', i) as string;

				// 确保服务运行
				const servicePort = await startSimpleEmbeddedService();
				const serviceUrl = `http://localhost:${servicePort}`;

				let requestBody: any = {
					service,
					text,
				};

				if (service === 'enterprise-wechat-bot') {
					const webhook = this.getNodeParameter('enterpriseWebhook', i) as string;
					requestBody.webhook = webhook;
				} else if (service === 'personal-wechat') {
					const personalWechatUrl = this.getNodeParameter('personalWechatUrl', i) as string;
					const chatType = this.getNodeParameter('chatType', i) as string;
					requestBody.personalWechatUrl = personalWechatUrl;
					requestBody.toType = chatType;
				}

				const response = await axios.post(`${serviceUrl}/send/text`, requestBody);

				returnData.push({
					json: {
						success: true,
						service,
						resource,
						text,
						response: response.data,
						timestamp: new Date().toISOString(),
					},
				});

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							success: false,
							error: (error as Error).message,
						},
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), (error as Error).message);
			}
		}

		return [returnData];
	}
}