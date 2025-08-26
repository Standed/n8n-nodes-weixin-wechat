# 调试步骤

## 问题分析

插件已经安装到 Docker 容器中，但 n8n 界面中搜索不到 WeChat 节点。

## 已完成的步骤

✅ 插件成功构建  
✅ 插件已安装到容器：`/usr/local/lib/node_modules/n8n-nodes-wechat-personal`  
✅ 插件已复制到：`/home/node/.n8n/nodes/node_modules/n8n-nodes-wechat-personal`  
✅ package.json 已更新包含依赖  
✅ 插件可以被 Node.js 正确加载  
✅ 权限设置正确  
✅ 缓存已清除  
✅ 容器已重启  

## 可能的原因

1. **n8n 版本兼容性问题** - n8n 1.106.3 可能有不同的节点加载机制
2. **节点描述格式问题** - 可能需要特定的节点描述格式
3. **缺少必要的依赖** - 可能需要额外的 n8n 依赖包
4. **路径问题** - n8n 可能不扫描该路径

## 下一步尝试

### 方法 1：检查 n8n 版本兼容性

```bash
# 检查其他工作节点的结构
docker exec n8n ls -la /home/node/.n8n/nodes/node_modules/n8n-nodes-feishu-lite/

# 比较文件结构和 package.json
```

### 方法 2：使用 n8n 命令行工具

```bash
# 尝试通过 n8n CLI 安装
docker exec n8n npm install -g n8n
docker exec n8n n8n list:community-packages
```

### 方法 3：手动测试节点

```bash
# 创建测试脚本直接测试节点
docker exec n8n node -e "
try {
  const { nodes } = require('/home/node/.n8n/nodes/node_modules/n8n-nodes-wechat-personal');
  console.log('Nodes found:', nodes.length);
  nodes.forEach(node => {
    console.log('Node:', node.prototype.constructor.name);
    console.log('Description:', node.prototype.description?.displayName);
  });
} catch (e) {
  console.error('Error:', e.message);
}
"
```

### 方法 4：检查其他插件的工作方式

```bash
# 查看已工作插件的结构
docker exec n8n find /home/node/.n8n/nodes/node_modules -name "*.node.js" | head -5
```

## 备选解决方案

1. **降级到较低版本的 n8n** 进行测试
2. **发布到 NPM** 后通过 n8n UI 安装
3. **使用开发模式** 直接在 n8n 源码中测试
4. **创建自定义 Docker 镜像** 预装插件