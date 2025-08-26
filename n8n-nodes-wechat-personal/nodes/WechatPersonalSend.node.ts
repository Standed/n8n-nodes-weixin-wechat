import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IHttpRequestMethods,
	NodeConnectionType,
} from 'n8n-workflow';

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
		displayName: 'WeChat (Personal) Send',
		name: 'wechatPersonalSend',
		icon: 'file:wechat.svg',
		group: ['transform'],
		version: 1,
		description: 'Send text or file to WeChat personal contact/room/filehelper via local Wechaty bot service',
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
				displayName: 'Target Type',
				name: 'toType',
				type: 'options',
				default: 'contact',
				options: [
					{
						name: 'Contact',
						value: 'contact',
						description: 'Send to a WeChat contact',
					},
					{
						name: 'Room',
						value: 'room',
						description: 'Send to a WeChat group',
					},
					{
						name: 'FileHelper',
						value: 'filehelper',
						description: 'Send to WeChat file transfer assistant',
					},
				],
				description: 'Choose the type of target to send message to',
			},
			{
				displayName: 'Receiver ID',
				name: 'toId',
				type: 'string',
				default: '',
				displayOptions: {
					hide: {
						toType: ['filehelper'],
					},
				},
				description: 'The ID of contact or room to send to',
			},
			{
				displayName: 'Mode',
				name: 'mode',
				type: 'options',
				default: 'text',
				options: [
					{
						name: 'Text',
						value: 'text',
						description: 'Send text message',
					},
					{
						name: 'File by URL',
						value: 'file',
						description: 'Send file by URL',
					},
				],
				description: 'Choose message type to send',
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						mode: ['text'],
					},
				},
				description: 'Text message to send',
			},
			{
				displayName: 'File URL',
				name: 'url',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						mode: ['file'],
					},
				},
				description: 'URL of the file to send',
			},
			{
				displayName: 'Filename',
				name: 'filename',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						mode: ['file'],
					},
				},
				description: 'Filename for the file (optional)',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const toType = this.getNodeParameter('toType', i) as string;
				const mode = this.getNodeParameter('mode', i) as string;

				const requestBody: any = { toType };

				// 只有在不是 filehelper 时才获取 toId 参数
				if (toType !== 'filehelper') {
					const toId = this.getNodeParameter('toId', i) as string;
					if (toId) {
						requestBody.toId = toId;
					}
				}

				let path: string;
				let response: any;

				if (mode === 'file') {
					const fileUrl = this.getNodeParameter('url', i) as string;
					const filename = this.getNodeParameter('filename', i) as string;

					if (!fileUrl) {
						throw new NodeOperationError(this.getNode(), 'File URL is required when sending files');
					}

					requestBody.url = fileUrl;
					if (filename) {
						requestBody.filename = filename;
					}

					path = '/send/file';
				} else {
					const text = this.getNodeParameter('text', i) as string;

					if (!text) {
						throw new NodeOperationError(this.getNode(), 'Text message is required when sending text');
					}

					requestBody.text = text;
					path = '/send/text';
				}

				response = await requestWithAuth(this, path, 'POST', requestBody);

				returnData.push({
					json: {
						success: true,
						request: requestBody,
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