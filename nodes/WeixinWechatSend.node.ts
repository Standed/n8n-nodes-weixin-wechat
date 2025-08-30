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

// 从URL提取文件名的工具函数
function extractFileNameFromUrl(url: string): string {
	try {
		const urlObj = new URL(url);
		const pathname = urlObj.pathname;
		const fileName = pathname.split('/').pop() || 'file';
		
		// 如果没有扩展名，尝试从查询参数中获取
		if (!fileName.includes('.')) {
			const contentType = urlObj.searchParams.get('content-type');
			if (contentType) {
				const ext = mimeTypeToExtension(contentType);
				return fileName + ext;
			}
		}
		
		return fileName;
	} catch {
		return 'file';
	}
}

// MIME类型转文件扩展名的工具函数
function mimeTypeToExtension(mimeType: string): string {
	const mimeMap: { [key: string]: string } = {
		'image/jpeg': '.jpg',
		'image/png': '.png',
		'image/gif': '.gif',
		'image/webp': '.webp',
		'video/mp4': '.mp4',
		'video/avi': '.avi',
		'audio/mp3': '.mp3',
		'audio/wav': '.wav',
		'application/pdf': '.pdf',
		'application/msword': '.doc',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
		'text/plain': '.txt',
	};
	return mimeMap[mimeType] || '';
}

async function requestWithAuth(
	thisArg: IExecuteFunctions,
	path: string,
	method: IHttpRequestMethods = 'GET',
	body?: any,
) {
	const credentials = await thisArg.getCredentials('weixinWechatApi');
	const baseUrl = String(credentials?.baseUrl || '').replace(/\/+$/, '');
	const headers: { [key: string]: string } = {
		'Content-Type': 'application/json',
	};

	if (credentials?.apiKey) {
		headers['x-api-key'] = credentials.apiKey as string;
	}

	// 根据请求类型设置超时时间
	const isFileRequest = path.includes('/send/file');
	const isBatchRequest = body?.toIds && Array.isArray(body.toIds);
	let timeout = 30000; // 默认30秒
	
	if (isFileRequest) {
		timeout = 120000; // 文件发送2分钟
	}
	if (isBatchRequest) {
		// 批量发送：基础时间 + 每个目标的延迟时间
		const targetCount = body.toIds.length;
		const delayPerTarget = (body.batchOptions?.sendDelay || 3) * 1000;
		const randomDelayMax = body.batchOptions?.randomDelay ? 5000 : 0;
		timeout = 60000 + (targetCount * (delayPerTarget + randomDelayMax)); // 动态超时
	}

	const options = {
		method,
		url: `${baseUrl}${path}`,
		headers,
		json: true,
		timeout,
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
						description: 'UI自动化控制微信PC版，兼容性强，无协议限制',
					},
				],
				description: '选择微信服务 | 关注"西羊石AI视频"获取API | 官网: https://xysaiai.cn/',
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
				displayName: '发送目标',
				name: 'chatType',
				type: 'options',
				default: 'filehelper',
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
				displayOptions: {
					show: {
						service: ['personal-wechat'],
					},
				},
				description: '个人微信自动化发送目标 - 西羊石AI',
			},
			{
				displayName: '联系人/群名称',
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
				description: '支持多个目标，用英文逗号分隔（如：张三,李四,工作群）',
				placeholder: '例如: 张三,李四 或 工作群,家庭群',
			},
			{
				displayName: 'Batch Options',
				name: 'batchOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						service: ['personal-wechat'],
						chatType: ['contact', 'room'],
					},
				},
				options: [
					{
						displayName: '发送间隔(秒)',
						name: 'sendDelay',
						type: 'number',
						default: 3,
						description: '多个联系人之间的发送间隔，防止被封号',
						typeOptions: {
							minValue: 1,
							maxValue: 60,
						},
					},
					{
						displayName: '随机延迟',
						name: 'randomDelay',
						type: 'boolean',
						default: true,
						description: '在基础延迟上添加随机时间（1-5秒）',
					},
				],
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
			
			// 文件输入方式选择
			{
				displayName: 'File Input Method',
				name: 'fileInputMethod',
				type: 'options',
				default: 'url',
				options: [
					{
						name: '🔗 URL地址',
						value: 'url',
						description: '通过URL链接发送文件',
					},
					{
						name: '📎 上传文件',
						value: 'upload',
						description: '上传本地文件或来自上游节点的文件',
					},
				],
				displayOptions: {
					show: {
						resource: ['image', 'video', 'document', 'audio', 'file'],
					},
				},
				description: '选择文件输入方式',
			},
			// 文件URL输入 (URL方式时显示)
			{
				displayName: 'File URL',
				name: 'fileUrl',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['image', 'video', 'document', 'audio', 'file'],
						fileInputMethod: ['url'],
					},
				},
				description: 'URL of the file to send',
				placeholder: 'https://example.com/file.jpg',
			},
			// 文件上传 (上传方式时显示)
			{
				displayName: 'Input Binary Field',
				name: 'inputBinaryField',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: {
					show: {
						resource: ['image', 'video', 'document', 'audio', 'file'],
						fileInputMethod: ['upload'],
					},
				},
				description: 'Binary field name containing the file data from previous node',
				placeholder: 'data',
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
					if (service === 'personal-wechat') {
						const chatType = this.getNodeParameter('chatType', i) as string;
						requestBody.toType = chatType;
						
						if (chatType !== 'filehelper') {
							const chatId = this.getNodeParameter('chatId', i) as string;
							const batchOptions = this.getNodeParameter('batchOptions', i) as any;
							
							if (chatId) {
								// 支持多联系人（逗号分隔）
								const targets = chatId.split(',').map(id => id.trim()).filter(id => id);
								requestBody.toIds = targets;  // 使用复数形式传递多个目标
								requestBody.batchOptions = {
									sendDelay: batchOptions?.sendDelay || 3,
									randomDelay: batchOptions?.randomDelay !== false
								};
							}
						}
					}

					response = await requestWithAuth(this, '/send/text', 'POST', requestBody);
				} else {
					// 发送文件 (image, video, document, audio, file)
					const fileInputMethod = this.getNodeParameter('fileInputMethod', i) as string;
					const fileName = this.getNodeParameter('fileName', i) as string;
					const additionalFields = this.getNodeParameter('additionalFields', i) as any;

					// 构建请求体
					const requestBody: any = { service };

					if (fileInputMethod === 'url') {
						// URL方式
						const fileUrl = this.getNodeParameter('fileUrl', i) as string;
						requestBody.url = fileUrl;
						requestBody.filename = fileName || extractFileNameFromUrl(fileUrl);
					} else {
						// 文件上传方式
						const inputBinaryField = this.getNodeParameter('inputBinaryField', i) as string;
						const binaryData = items[i].binary?.[inputBinaryField];
						
						if (!binaryData) {
							throw new NodeOperationError(
								this.getNode(),
								`No binary data found in field "${inputBinaryField}"`,
								{ itemIndex: i }
							);
						}

						// 使用原始文件名或用户指定的文件名
						const originalFileName = binaryData.fileName || 'file';
						const finalFileName = fileName || originalFileName;
						
						requestBody.fileData = {
							id: binaryData.id,
							data: binaryData.data,
							mimeType: binaryData.mimeType,
							fileName: finalFileName
						};
						requestBody.filename = finalFileName;
					}
					
					// 添加服务特定参数
					if (service === 'personal-wechat') {
						const chatType = this.getNodeParameter('chatType', i) as string;
						requestBody.toType = chatType;
						
						if (chatType !== 'filehelper') {
							const chatId = this.getNodeParameter('chatId', i) as string;
							const batchOptions = this.getNodeParameter('batchOptions', i) as any;
							
							if (chatId) {
								// 支持多联系人（逗号分隔）
								const targets = chatId.split(',').map(id => id.trim()).filter(id => id);
								requestBody.toIds = targets;  // 使用复数形式传递多个目标
								requestBody.batchOptions = {
									sendDelay: batchOptions?.sendDelay || 3,
									randomDelay: batchOptions?.randomDelay !== false
								};
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
	const credentials = await this.getCredentials('weixinWechatApi');
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

