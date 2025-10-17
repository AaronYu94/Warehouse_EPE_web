# 仓库管理系统 - 网页版部署指南

## 🚀 部署方案：Vercel + 云服务器

### 架构说明
- **前端**: Vercel (免费) - React应用
- **后端**: 云服务器 (推荐Railway或DigitalOcean)
- **数据库**: SQLite (包含在服务器中)

## 📋 部署前准备

### 1. 注册账户
- [ ] Vercel账户: https://vercel.com
- [ ] GitHub账户: https://github.com
- [ ] Railway账户: https://railway.app (推荐后端)
- [ ] 或 DigitalOcean账户: https://digitalocean.com

### 2. 环境配置
- [ ] 创建 `.env.local` 文件 (复制 `env.example`)
- [ ] 设置 `REACT_APP_API_URL` 为你的后端地址

## 🔧 部署步骤

### 前端部署 (Vercel)

1. **推送代码到GitHub**
   ```bash
   git add .
   git commit -m "准备Vercel部署"
   git push origin main
   ```

2. **在Vercel中导入项目**
   - 访问 vercel.com
   - 点击 "New Project"
   - 选择你的GitHub仓库
   - 自动检测为React项目

3. **配置构建设置**
   - Framework Preset: Other
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **设置环境变量**
   - 在Vercel项目设置中添加：
   - `REACT_APP_API_URL`: 你的后端API地址

### 后端部署 (Railway推荐)

1. **创建Railway项目**
   - 访问 railway.app
   - 连接GitHub
   - 选择 `server` 文件夹

2. **配置环境**
   - 设置 `NODE_ENV=production`
   - 设置 `PORT=4000`

3. **获取部署URL**
   - Railway会提供类似 `https://xxx.railway.app` 的URL
   - 将此URL设置为前端的 `REACT_APP_API_URL`

## 🌐 域名配置

### 自定义域名 (可选)
1. 购买域名 (推荐Namecheap)
2. 在Vercel中添加自定义域名
3. 配置DNS记录

## 💰 成本估算

### 推荐方案 (Vercel + Railway)
- 前端: Vercel (免费)
- 后端: Railway ($5/月)
- 域名: $10/年 (可选)
- **总计**: $5/月 (约¥35/月)

### 备选方案 (Vercel + DigitalOcean)
- 前端: Vercel (免费)
- 后端: DigitalOcean ($12/月)
- 域名: $10/年 (可选)
- **总计**: $12/月 (约¥85/月)

## 🔍 测试清单

部署完成后，请测试以下功能：
- [ ] 用户登录
- [ ] 原料入库
- [ ] 辅料入库
- [ ] 成品入库
- [ ] 原料出库
- [ ] 成品出库
- [ ] 库存查看
- [ ] 财务管理
- [ ] 文件上传
- [ ] 数据导出

## 🆘 故障排除

### 常见问题
1. **API连接失败**: 检查 `REACT_APP_API_URL` 设置
2. **构建失败**: 检查 `package.json` 中的构建脚本
3. **路由问题**: 确保 `vercel.json` 配置正确

### 联系支持
如遇到问题，请检查：
- Vercel部署日志
- 后端服务器日志
- 浏览器控制台错误

## 📞 技术支持

如需帮助，请提供：
- 错误截图
- 部署日志
- 浏览器控制台输出
