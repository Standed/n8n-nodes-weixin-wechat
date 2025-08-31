#!/usr/bin/env node

/**
 * 西羊石AI个人微信自动化服务
 * 运行在用户PC上，为N8N提供个人微信发送功能
 * 
 * 官网: https://xysaiai.cn/
 * 作者: 西羊石AI团队
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 记录日志
function log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

// Python脚本路径
const pythonScriptPath = path.join(__dirname, 'wechat_automation.py');

// 调用Python脚本
async function callPythonScript(action, data = null) {
    try {
        const args = [pythonScriptPath, action];
        if (data) {
            args.push(JSON.stringify(data));
        }

        log(`🐍 调用Python脚本: ${action}`);
        
        return new Promise((resolve, reject) => {
            const pythonProcess = spawn('python', args);
            let stdout = '';
            let stderr = '';

            pythonProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    try {
                        // 尝试直接解析JSON
                        const result = JSON.parse(stdout);
                        resolve(result);
                    } catch (parseError) {
                        // 如果直接解析失败，尝试提取最后一行的JSON
                        try {
                            const lines = stdout.trim().split('\n');
                            const lastLine = lines[lines.length - 1];
                            const result = JSON.parse(lastLine);
                            resolve(result);
                        } catch (secondParseError) {
                            log(`❌ Python输出解析失败: ${parseError.message}`);
                            log(`❌ 尝试解析最后一行也失败: ${secondParseError.message}`);
                            log(`❌ 原始输出: ${stdout}`);
                            resolve({
                                success: false,
                                error: 'Python输出格式错误',
                                stdout: stdout,
                                stderr: stderr
                            });
                        }
                    }
                } else {
                    log(`❌ Python脚本执行失败 (code: ${code})`);
                    log(`stderr: ${stderr}`);
                    resolve({
                        success: false,
                        error: `Python脚本执行失败 (code: ${code})`,
                        stderr: stderr,
                        suggestion: '请确保已安装Python和wxauto库'
                    });
                }
            });

            pythonProcess.on('error', (error) => {
                log(`❌ 启动Python进程失败: ${error.message}`);
                resolve({
                    success: false,
                    error: `启动Python进程失败: ${error.message}`,
                    suggestion: '请确保系统已安装Python'
                });
            });
        });

    } catch (error) {
        log(`❌ 调用Python脚本异常: ${error.message}`);
        return {
            success: false,
            error: `调用Python脚本异常: ${error.message}`
        };
    }
}

// 检查Python和wxauto环境
async function checkPythonEnvironment() {
    try {
        // 检查Python版本
        const { stdout } = await execAsync('python --version');
        log(`🐍 Python版本: ${stdout.trim()}`);
        
        // 检查微信客户端状态
        const status = await callPythonScript('check_status');
        return status;
        
    } catch (error) {
        log(`⚠️ Python环境检查失败: ${error.message}`);
        return {
            status: 'error',
            error: 'Python环境未配置或wxauto库未安装',
            suggestion: '请安装Python并运行: pip install wxauto'
        };
    }
}

// 健康检查
app.get('/health', async (req, res) => {
    try {
        const pythonStatus = await checkPythonEnvironment();
        
        res.json({
            status: 'ok',
            service: 'personal-wechat-service',
            version: '1.0.0',
            author: '西羊石AI (xysaiai.cn)',
            timestamp: new Date().toISOString(),
            port: PORT,
            python_environment: pythonStatus
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// 获取服务状态
app.get('/status', async (req, res) => {
    try {
        const pythonStatus = await checkPythonEnvironment();
        
        res.json({
            service: '个人微信自动化服务',
            status: 'running',
            features: {
                'text-message': pythonStatus.status === 'ready' ? 'ready' : 'error',
                'file-message': 'developing',
                'batch-send': pythonStatus.status === 'ready' ? 'ready' : 'error'
            },
            wechat_status: pythonStatus,
            note: pythonStatus.status === 'ready' ? 
                '微信自动化功能就绪，基于wxauto实现' : 
                '请安装Python和wxauto库，并确保微信客户端已登录',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            service: '个人微信自动化服务',
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// 发送文本消息
app.post('/send/text', async (req, res) => {
    try {
        const { text, toType, toIds, batchOptions } = req.body;
        log(`📱 收到文本发送请求: ${text} -> ${toType}`);

        // 调用Python脚本进行真实的微信发送
        const result = await callPythonScript('send_text', {
            text,
            toType,
            toIds,
            batchOptions
        });

        if (result.success) {
            log(`✅ 微信发送成功`);
            res.json(result);
        } else {
            log(`❌ 微信发送失败: ${result.error}`);
            res.status(500).json(result);
        }
        
    } catch (error) {
        log(`❌ 发送异常: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// 发送文件消息
app.post('/send/file', async (req, res) => {
    try {
        const { url, filename, fileData, toType, toIds } = req.body;
        log(`📎 收到文件发送请求: ${filename} -> ${toType}`);

        // 调用Python脚本进行真实的微信文件发送
        const result = await callPythonScript('send_file', {
            url,
            filename,
            fileData,
            toType,
            toIds
        });

        if (result.success) {
            log(`✅ 微信文件发送成功`);
            res.json(result);
        } else {
            log(`❌ 微信文件发送失败: ${result.error}`);
            res.status(500).json(result);
        }
        
    } catch (error) {
        log(`❌ 文件发送异常: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// 启动服务
app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('🚀 西羊石AI个人微信自动化服务已启动');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`🌐 外部访问: http://您的IP地址:${PORT}`);
    console.log(`💚 健康检查: http://localhost:${PORT}/health`);
    console.log(`📊 服务状态: http://localhost:${PORT}/status`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗 官网: https://xysaiai.cn/');
    console.log('📞 技术支持: 关注公众号"西羊石AI视频"');
    console.log('');
    console.log('✅ 服务运行正常，等待N8N连接...');
    console.log('💡 在N8N中配置个人微信服务地址为上述地址');
    console.log('');
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 收到终止信号，正在关闭服务...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 收到SIGTERM信号，正在关闭服务...');
    process.exit(0);
});