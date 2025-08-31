#!/usr/bin/env node

/**
 * 西羊石AI微信服务守护进程
 * 确保嵌入式服务能持续运行
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');

let server = null;
let currentPort = null;

// 服务状态文件
const serviceStateFile = path.join(os.tmpdir(), 'n8n-wechat-service-port.json');

function createWechatService(port = 3000) {
    const app = express();
    
    app.use(cors());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // 健康检查
    app.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            service: 'embedded-wechat-service',
            services: {
                'enterprise-wechat-bot': 'ready',
                'personal-wechat': 'ready'
            },
            timestamp: new Date().toISOString(),
            port: currentPort
        });
    });

    // 发送文本消息
    app.post('/send/text', async (req, res) => {
        try {
            const { service, text, toType, toIds, batchOptions } = req.body;
            console.log(`📱 收到文本发送请求: ${service} - ${text}`);

            if (service === 'enterprise-wechat-bot') {
                // 企业微信机器人发送
                const webhook = process.env.ENTERPRISE_WECHAT_BOT_WEBHOOK;
                
                if (!webhook || webhook.includes('YOUR_KEY_HERE')) {
                    res.json({
                        success: true,
                        message: '企业微信机器人发送成功 (模拟)',
                        note: '请配置企业微信webhook地址以实际发送'
                    });
                    return;
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
                // 个人微信自动化 - 简化版本
                console.log(`📱 个人微信发送: ${text} 到 ${toType}`);
                
                if (toType === 'filehelper') {
                    res.json({
                        success: true,
                        message: '已发送到文件传输助手 (模拟)',
                        target: 'filehelper'
                    });
                    return;
                }

                if (toIds && toIds.length > 0) {
                    const results = [];
                    for (let i = 0; i < toIds.length; i++) {
                        const toId = toIds[i];
                        console.log(`📤 发送给: ${toId} (${i+1}/${toIds.length})`);
                        results.push({
                            target: toId,
                            success: true,
                            message: '发送成功 (模拟)'
                        });
                        
                        // 批量发送延迟
                        if (batchOptions?.sendDelay && i < toIds.length - 1) {
                            await new Promise(resolve => 
                                setTimeout(resolve, batchOptions.sendDelay * 1000)
                            );
                        }
                    }
                    res.json({
                        success: true,
                        message: `批量发送完成 (模拟): ${results.length}/${toIds.length} 成功`,
                        results
                    });
                    return;
                }

                res.json({
                    success: true,
                    message: '个人微信消息发送成功 (模拟)'
                });
            } else {
                throw new Error('不支持的服务类型');
            }
        } catch (error) {
            console.error('发送消息失败:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // 发送文件
    app.post('/send/file', async (req, res) => {
        try {
            const { service, url, filename, fileData, toType, toIds } = req.body;
            console.log(`📎 收到文件发送请求: ${service} - ${filename}`);

            if (service === 'enterprise-wechat-bot') {
                // 企业微信文件发送 - 简化版：发送文件链接
                const webhook = process.env.ENTERPRISE_WECHAT_BOT_WEBHOOK;

                if (!webhook || webhook.includes('YOUR_KEY_HERE')) {
                    res.json({
                        success: true,
                        message: '企业微信文件发送成功 (模拟)',
                        filename,
                        note: '请配置企业微信webhook地址以实际发送'
                    });
                    return;
                }

                const response = await axios.post(webhook, {
                    msgtype: 'text',
                    text: { 
                        content: `📎 文件分享\n文件名: ${filename}\n链接: ${url}` 
                    }
                });

                res.json({
                    success: true,
                    message: '企业微信文件发送成功',
                    response: response.data
                });
            } else if (service === 'personal-wechat') {
                // 个人微信文件发送 - 简化版本
                console.log(`📎 个人微信文件发送: ${filename} 到 ${toType}`);
                
                res.json({
                    success: true,
                    message: '个人微信文件发送成功 (模拟)',
                    filename
                });
            } else {
                throw new Error('不支持的服务类型');
            }
        } catch (error) {
            console.error('发送文件失败:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    return app;
}

// 查找可用端口
async function findFreePort(startPort = 3000) {
    const net = require('net');
    
    for (let port = startPort; port < startPort + 100; port++) {
        const isPortFree = await new Promise((resolve) => {
            const testServer = net.createServer();
            testServer.listen(port, '0.0.0.0', (err) => {
                if (err) {
                    resolve(false);
                } else {
                    testServer.once('close', () => resolve(true));
                    testServer.close();
                }
            });
            testServer.on('error', () => resolve(false));
        });
        
        if (isPortFree) {
            return port;
        }
    }
    
    throw new Error('无法找到可用端口');
}

// 保存服务状态
function saveServiceState(port) {
    try {
        fs.writeFileSync(serviceStateFile, JSON.stringify({ 
            port, 
            timestamp: Date.now(),
            pid: process.pid 
        }));
    } catch (error) {
        console.warn('保存服务状态失败:', error);
    }
}

// 启动服务
async function startService() {
    try {
        const port = await findFreePort(3000);
        const app = createWechatService(port);
        
        server = app.listen(port, '0.0.0.0', () => {
            currentPort = port;
            console.log(`🚀 西羊石AI微信服务已启动`);
            console.log(`📡 监听地址: http://0.0.0.0:${port}`);
            console.log(`🔗 本地访问: http://localhost:${port}`);
            console.log(`💚 健康检查: http://localhost:${port}/health`);
            
            saveServiceState(port);
        });

        server.on('error', (err) => {
            console.error('服务启动失败:', err);
            process.exit(1);
        });

        // 优雅关闭
        process.on('SIGINT', () => {
            console.log('\n🛑 收到终止信号，正在关闭服务...');
            if (server) {
                server.close(() => {
                    console.log('✅ 服务已关闭');
                    process.exit(0);
                });
            }
        });

        process.on('SIGTERM', () => {
            console.log('\n🛑 收到SIGTERM信号，正在关闭服务...');
            if (server) {
                server.close(() => {
                    console.log('✅ 服务已关闭');
                    process.exit(0);
                });
            }
        });

        return port;
        
    } catch (error) {
        console.error('启动嵌入式微信服务失败:', error);
        process.exit(1);
    }
}

// 如果直接运行此文件
if (require.main === module) {
    console.log('🎬 启动西羊石AI微信服务守护进程...');
    startService().catch(console.error);
}

module.exports = { startService, createWechatService };