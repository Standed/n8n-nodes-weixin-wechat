# 🐳 Docker n8n插件安装指南

## 🎯 插件更新内容

✅ 新增 **Upload Local File** 模式  
✅ 支持直接上传本地文件到企业微信  
✅ 智能文件大小限制 (视频1GB, 文档500MB, 图片50MB)  
✅ 自动文件类型识别和扩展名补全  

## 📦 安装步骤

### 1. 复制插件包到容器
```bash
# 进入项目目录
cd E:\N8N\devProject\n8n-nodes-wechat-personal

# 复制插件包到Docker容器
docker cp n8n-nodes-wechat-personal-0.1.1.tgz n8n:/data/
```

### 2. 在容器内安装插件
```bash
# 进入n8n容器
docker exec -it n8n /bin/sh

# 安装插件
npm install /data/n8n-nodes-wechat-personal-0.1.1.tgz

# 退出容器
exit
```

### 3. 重启n8n容器
```bash
docker restart n8n
```

### 4. 验证安装
等待约30秒后，访问n8n界面，在节点面板中搜索 "WeChat"，应该能看到更新后的节点。

## 🎯 使用方法

### 在n8n工作流中：

1. **添加 WeChat Multi Send 节点**
2. **配置服务**: 选择 "企业微信机器人"
3. **选择模式**: 现在有三个选项：
   - Text (文本消息)
   - File by URL (通过URL发送文件)
   - **Upload Local File** (上传本地文件) ⭐ 新功能

### 本地文件上传配置：
- **Local File**: 填入 `data` (二进制数据属性名)
- **Upload Filename**: 可选，自定义文件名

### 典型工作流：
```
[Read Binary File] → [WeChat Multi Send]
        ↓                    ↓
    读取本地文件         Mode: Upload Local File
                        Local File: data
                        Service: enterprise-wechat-bot
```

## 🔧 故障排除

### 如果插件不生效：
1. 确认插件安装成功：`docker exec n8n npm list | grep wechat`
2. 重启容器：`docker restart n8n`
3. 清除浏览器缓存并刷新n8n界面
4. 检查容器日志：`docker logs n8n`

### 常见问题：
- **"Local File property not found"**: 确保前面的节点输出了二进制数据
- **"File too large"**: 检查文件是否超过大小限制
- **"Upload timeout"**: 大文件上传可能需要更长时间，请耐心等待

## ✅ 验证安装成功

安装成功后，您应该在WeChat Multi Send节点中看到：
- Mode选择框中有 "Upload Local File" 选项
- 选择该模式后出现 "Local File" 和 "Upload Filename" 字段

现在您可以在n8n工作流中直接上传和发送本地文件了！🎉