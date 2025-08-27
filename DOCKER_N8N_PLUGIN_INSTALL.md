# 🐳 Docker n8n 插件安装指南

## 🎯 问题解决

您的n8n在Docker中运行，所以需要特殊的插件安装方法。

## ✅ 推荐解决方案

### 方法1：直接在n8n界面安装（最简单）

1. **打开n8n**：http://localhost:5678
2. **点击右上角用户图标** → **Settings**
3. **选择 "Community nodes"**
4. **点击 "Install community node"**
5. **输入以下npm包名（我们需要先发布）**：
   ```
   n8n-nodes-wechat-personal
   ```

### 方法2：重新创建Docker容器

```bash
# 停止当前容器
docker stop n8n
docker rm n8n

# 构建包含插件的新镜像
docker build -t n8n-with-wechat .

# 运行新容器
docker run -d --restart unless-stopped --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  -v "E:/N8N/n8n:/data/files" \
  n8n-with-wechat
```

### 方法3：临时解决方案 - 修改后端兼容旧插件

既然您当前的插件还是旧版本，让我们暂时恢复后端的企业微信API服务，但指向企业微信机器人：

## 🔧 临时修复方案

1. **保持当前Docker n8n不变**
2. **修改后端服务**，让 `enterprise-wechat` 指向机器人服务
3. **这样您就可以继续使用当前的n8n插件**

想用哪种方法？我推荐**临时修复方案**，这样最快解决问题！