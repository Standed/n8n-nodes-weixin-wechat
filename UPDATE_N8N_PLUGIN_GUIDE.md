# 🔄 N8N插件更新指南

## 问题说明
您在n8n中看到的仍然是旧版本的插件选项，导致仍然显示"企业微信"而不是"企业微信机器人"。

## ✅ 解决步骤

### 1. 停止n8n服务
如果您正在运行n8n，请先停止：
```bash
# 按 Ctrl+C 停止n8n服务，或者关闭n8n进程
```

### 2. 完全重新安装插件
```bash
# 卸载旧版本
npm uninstall n8n-nodes-wechat-personal

# 安装新版本 (0.1.1)
npm install ./n8n-nodes-wechat-personal/n8n-nodes-wechat-personal-0.1.1.tgz
```

### 3. 清除n8n缓存
删除n8n的缓存目录（如果存在）：
- Windows: `%USERPROFILE%\.n8n`
- 或者直接重启电脑

### 4. 重新启动n8n
```bash
npx n8n
```

### 5. 验证更新成功
在n8n工作流中添加"WeChat Send"节点，应该看到：

**正确的选项：**
- ✅ Server酱 (推荐)
- ✅ 企业微信机器人 (推荐)  ← 选择这个！
- ✅ 个人微信

**不应该看到：**
- ❌ 企业微信 (这个选项已被移除)

### 6. 测试配置
选择"企业微信机器人 (推荐)"，配置：
- API基础URL: `http://localhost:3000`
- API Key: `unified-message-key-2024`
- 消息内容: `测试企业微信机器人！`

## 🔍 如果仍然有问题

### 方法1: 手动删除旧插件
1. 找到n8n的node_modules目录
2. 删除 `node_modules/n8n-nodes-wechat-personal` 文件夹
3. 重新安装新版本插件

### 方法2: 使用全局安装
```bash
npm install -g ./n8n-nodes-wechat-personal/n8n-nodes-wechat-personal-0.1.1.tgz
```

### 方法3: 检查是否有多个n8n实例
```bash
# 查看所有node进程
tasklist | findstr node
# 结束所有node进程后重新启动
```

## 📋 最终验证
成功更新后，在n8n中测试：
- 服务类型选择："企业微信机器人 (推荐)"
- 应该不会再看到"企业微信服务未配置"的错误
- 应该能正常发送消息到您的企业微信群

## 🎯 重要提醒
**错误信息 `"service":"enterprise-wechat"` 说明您选择的是旧选项！**
**正确的选择应该是 `"service":"enterprise-wechat-bot"`**

选择"企业微信机器人 (推荐)"而不是"企业微信"！