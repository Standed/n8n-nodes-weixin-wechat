import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IHttpRequestMethods,
	NodeConnectionType,
} from 'n8n-workflow';
import { readFileSync, existsSync } from 'fs';
import { basename } from 'path';

async function requestWithAuth(
	thisArg: IExecuteFunctions,
	path: string,
	method: IHttpRequestMethods = 'GET',
	body?: any,
) {
	const credentials = await thisArg.getCredentials('wechatPersonalApi');
	const baseUrl = String(credentials?.baseUrl || '').replace(/\/+$/, '');
	const headers: { [key: string]: string } = {
		'Content-Type': 'application/json',
	};

	if (credentials?.apiKey) {
		headers['x-api-key'] = credentials.apiKey as string;
	}

	const options = {
		method,
		url: `${baseUrl}${path}`,
		headers,
		json: true,
		timeout: 30000,
		body: body || undefined,
	};

	try {
		return await thisArg.helpers.request(options);
	} catch (error: any) {
		throw new NodeOperationError(
			thisArg.getNode(),
			`WeChat API request failed: ${error.message}`,
			{ description: error.description }
		);
	}
}

export class WechatPersonalSend implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'WeChat Send',
		name: 'wechatPersonalSend',
		icon: 'file:wechat.svg',
		group: ['communication'],
		version: 3,
		description: 'Send messages and files via WeChat (Personal > Enterprise > Official Account)',
		defaults: {
			name: 'WeChat Send',
		},
		inputs: [{ displayName: '', type: NodeConnectionType.Main }],
		outputs: [{ displayName: '', type: NodeConnectionType.Main }],
		credentials: [
			{
				name: 'wechatPersonalApi',
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
						description: '发送到企业微信群，无需配置IP白名单，最稳定',
					},
					{
						name: '🙋‍♂️ 个人微信 (WeChatFerry)',
						value: 'personal-wechat',
						description: '基于WeChatFerry的个人微信，需要PC微信客户端',
					},
					{
						name: '📢 微信公众号',
						value: 'wechat-official-account',
						description: '通过公众号发送模板消息或客服消息',
					},
					{
						name: '📱 Server酱推送',
						value: 'server-chan',
						description: '通过Server酱推送到微信，每日100条免费额度',
					},
				],
				description: 'Choose WeChat service (Personal WeChat recommended)',
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
					{
						name: '🖼️ Image',
						value: 'image',
						description: 'Send image file',
					},
					{
						name: '🎥 Video',
						value: 'video',
						description: 'Send video file',
					},
					{
						name: '📄 Document',
						value: 'document',
						description: 'Send document file',
					},
					{
						name: '🎵 Audio',
						value: 'audio',
						description: 'Send audio file',
					},
					{
						name: '📎 File',
						value: 'file',
						description: 'Send any file type',
					},
				],
				description: 'Type of message to send',
			},
			// 个人微信目标配置
			{
				displayName: 'Chat Type',
				name: 'chatType',
				type: 'options',
				default: 'contact',
				options: [
					{
						name: '👤 Contact (联系人)',
						value: 'contact',
						description: 'Send to a WeChat contact',
					},
					{
						name: '👥 Group Chat (群聊)',
						value: 'room',
						description: 'Send to a WeChat group',
					},
					{
						name: '📁 File Helper (文件传输助手)',
						value: 'filehelper',
						description: 'Send to WeChat file transfer assistant',
					},
				],
				displayOptions: {
					show: {
						service: ['personal-wechat'],
					},
				},
				description: 'Choose chat target type',
			},
			{
				displayName: 'Contact/Group Name',
				name: 'chatId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						service: ['personal-wechat'],
						chatType: ['contact', 'room'],
					},
				},
				description: 'Name or ID of the contact/group to send message to',
				placeholder: '联系人备注名或群名称',
			},
			// 消息内容配置
			{
				displayName: 'Message Text',
				name: 'text',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
					},
				},
				description: 'Text content to send',
			},
			
			// Server酱特殊配置
			{
				displayName: 'Message Title',
				name: 'title',
				type: 'string',
				default: 'Message from n8n',
				displayOptions: {
					show: {
						service: ['server-chan'],
					},
				},
				description: 'Message title (Server酱 only)',
			},
			// 文件URL输入 (仅在文件类型时显示)
			{
				displayName: 'File URL',
				name: 'fileUrl',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['image', 'video', 'document', 'audio', 'file'],
					},
				},
				description: 'URL of the file to send',
				placeholder: 'https://example.com/file.jpg',
			},
			{
				displayName: 'File Name',
				name: 'fileName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['image', 'video', 'document', 'audio', 'file'],
					},
				},
				description: 'Optional custom filename (will use original if not provided)',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['image', 'video', 'document', 'audio', 'file'],
					},
				},
				options: [
					{
						displayName: 'Caption/Description',
						name: 'caption',
						type: 'string',
						typeOptions: {
							rows: 2,
						},
						default: '',
						description: 'Caption or description for the file',
					},
				],
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

				let response: any;

				if (resource === 'message') {
					// 发送文本消息
					const text = this.getNodeParameter('text', i) as string;
					const requestBody: any = { service, text };

					// 添加服务特定参数
					if (service === 'server-chan') {
						const title = this.getNodeParameter('title', i) as string;
						requestBody.title = title || 'Message from n8n';
					} else if (service === 'personal-wechat') {
						const chatType = this.getNodeParameter('chatType', i) as string;
						requestBody.toType = chatType;
						
						if (chatType !== 'filehelper') {
							const chatId = this.getNodeParameter('chatId', i) as string;
							if (chatId) {
								requestBody.toId = chatId;
							}
						}
					}

					response = await requestWithAuth(this, '/send/text', 'POST', requestBody);
				} else {
					// 发送文件 (image, video, document, audio, file)
					const fileUrl = this.getNodeParameter('fileUrl', i) as string;
					const fileName = this.getNodeParameter('fileName', i) as string;
					const additionalFields = this.getNodeParameter('additionalFields', i) as any;

					// 构建请求体
					const requestBody: any = { 
						service,
						url: fileUrl,
						filename: fileName || 'file'
					};
					
					// 添加服务特定参数
					if (service === 'personal-wechat') {
						const chatType = this.getNodeParameter('chatType', i) as string;
						requestBody.toType = chatType;
						
						if (chatType !== 'filehelper') {
							const chatId = this.getNodeParameter('chatId', i) as string;
							if (chatId) {
								requestBody.toId = chatId;
							}
						}
					}

					// 添加说明文字（如果有）
					if (additionalFields?.caption) {
						requestBody.caption = additionalFields.caption;
					}

					response = await requestWithAuth(this, '/send/file', 'POST', requestBody);
				}

				returnData.push({
					json: {
						success: true,
						service,
						messageType: resource,
						response,
					},
					pairedItem: i,
				});
			} catch (error: any) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							success: false,
							error: error.message,
						},
						pairedItem: i,
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}

}

async function uploadFileHelper(
	this: IExecuteFunctions, 
	service: string, 
	fileData: any, 
	fileName: string
) {
	const credentials = await this.getCredentials('wechatPersonalApi');
	const baseUrl = String(credentials?.baseUrl || '').replace(/\/+$/, '');
	
	// 获取文件的二进制数据
	const buffer = await this.helpers.getBinaryDataBuffer(fileData.id, fileData.data);
	
	// 准备 FormData
	const formData = {
		service: service,
		filename: fileName,
		file: {
			value: buffer,
			options: {
				filename: fileName,
				contentType: fileData.mimeType || 'application/octet-stream'
			}
		}
	};

	const headers: { [key: string]: string } = {};
	if (credentials?.apiKey) {
		headers['x-api-key'] = credentials.apiKey as string;
	}

	const options = {
		method: 'POST' as IHttpRequestMethods,
		url: `${baseUrl}/upload/file`,
		headers,
		formData,
		timeout: 300000, // 5分钟超时，适合大文件
	};

	try {
		return await this.helpers.request(options);
	} catch (error: any) {
		throw new NodeOperationError(
			this.getNode(),
			`File upload failed: ${error.message}`,
			{ description: error.description }
		);
	}
}

