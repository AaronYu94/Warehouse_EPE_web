# 🚀 仓库管理系统云端部署指南

## 📋 部署架构

```
前端 (Vercel) ←→ 后端 (Railway) ←→ 数据库 (PostgreSQL)
```

- **前端**: Vercel (免费静态托管)
- **后端**: Railway (¥35/月)
- **数据库**: PostgreSQL (Railway内置)

## 🛠️ 部署步骤

### 第一步：准备代码仓库

1. **推送代码到GitHub**
   ```bash
   git add .
   git commit -m "准备云端部署"
   git push origin main
   ```

### 第二步：部署后端到Railway

1. **注册Railway账户**
   - 访问 [railway.app](https://railway.app)
   - 使用GitHub账户登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库
   - 选择 `server` 文件夹作为根目录

3. **配置环境变量**
   在Railway项目设置中添加：
   ```
   NODE_ENV=production
   PORT=4000
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```

4. **添加PostgreSQL数据库**
   - 在Railway项目中点击 "New"
   - 选择 "Database" → "PostgreSQL"
   - Railway会自动提供 `DATABASE_URL` 环境变量

5. **获取后端URL**
   - 部署完成后，Railway会提供类似 `https://xxx.up.railway.app` 的URL
   - 记录这个URL，稍后需要配置到前端

### 第三步：部署前端到Vercel

1. **注册Vercel账户**
   - 访问 [vercel.com](https://vercel.com)
   - 使用GitHub账户登录

2. **导入项目**
   - 点击 "New Project"
   - 选择你的GitHub仓库
   - 选择根目录（不是server文件夹）

3. **配置构建设置**
   - Framework Preset: `Other`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **设置环境变量**
   在Vercel项目设置中添加：
   ```
   REACT_APP_API_URL=https://your-backend-url.up.railway.app
   ```

5. **部署**
   - 点击 "Deploy"
   - 等待构建完成
   - 获取前端URL，类似 `https://your-project.vercel.app`

### 第四步：更新配置

1. **更新后端CORS设置**
   - 在Railway项目设置中更新 `FRONTEND_URL` 为你的Vercel URL

2. **更新前端API配置**
   - 在Vercel项目设置中更新 `REACT_APP_API_URL` 为你的Railway URL

## 🔧 数据库迁移

如果你有现有的SQLite数据需要迁移：

1. **导出SQLite数据**
   ```bash
   # 在本地运行
   sqlite3 server/warehouse.db .dump > data_export.sql
   ```

2. **转换数据格式**
   - 将SQLite的SQL语法转换为PostgreSQL语法
   - 主要差异：UUID、数据类型、语法

3. **导入到PostgreSQL**
   ```bash
   # 连接到Railway的PostgreSQL数据库
   psql $DATABASE_URL < converted_data.sql
   ```

## 🌐 自定义域名（可选）

### 前端域名
1. 在Vercel项目设置中添加自定义域名
2. 配置DNS记录指向Vercel

### 后端域名
1. 在Railway项目设置中添加自定义域名
2. 配置DNS记录指向Railway

## 💰 成本估算

### 基础方案（推荐）
- **前端**: Vercel (免费)
- **后端**: Railway ($5/月 ≈ ¥35/月)
- **数据库**: 包含在Railway中
- **总计**: ¥35/月

### 高级方案
- **前端**: Vercel (免费)
- **后端**: Railway ($5/月)
- **数据库**: 独立PostgreSQL ($5/月)
- **域名**: $10/年
- **总计**: ¥70/月 + ¥70/年

## 🧪 测试部署

部署完成后，测试以下功能：

### 基础功能测试
- [ ] 访问前端URL，页面正常加载
- [ ] 用户登录功能
- [ ] 仪表盘数据显示

### 核心功能测试
- [ ] 原料入库
- [ ] 辅料入库
- [ ] 成品入库
- [ ] 原料出库
- [ ] 成品出库
- [ ] 库存查看
- [ ] 文件上传

### 高级功能测试
- [ ] 财务管理
- [ ] 资产管理
- [ ] 数据导出
- [ ] 多用户权限

## 🆘 故障排除

### 常见问题

1. **前端无法连接后端**
   - 检查 `REACT_APP_API_URL` 环境变量
   - 确认后端URL正确
   - 检查CORS设置

2. **数据库连接失败**
   - 检查 `DATABASE_URL` 环境变量
   - 确认PostgreSQL服务正常运行
   - 检查网络连接

3. **文件上传失败**
   - 检查文件大小限制
   - 确认uploads目录权限
   - 检查multer配置

4. **构建失败**
   - 检查package.json依赖
   - 确认Node.js版本
   - 查看构建日志

### 日志查看

**Vercel日志**:
- 在Vercel项目页面查看 "Functions" 标签
- 查看实时日志和错误信息

**Railway日志**:
- 在Railway项目页面查看 "Deployments"
- 点击部署查看详细日志

## 📞 技术支持

如遇到问题，请提供：
1. 错误截图
2. 部署日志
3. 浏览器控制台输出
4. 网络请求状态

## 🔄 更新部署

### 前端更新
```bash
git add .
git commit -m "更新前端"
git push origin main
# Vercel会自动重新部署
```

### 后端更新
```bash
git add .
git commit -m "更新后端"
git push origin main
# Railway会自动重新部署
```

## 📊 监控和维护

### 性能监控
- Vercel Analytics (免费)
- Railway Metrics (内置)

### 数据备份
- PostgreSQL自动备份
- 定期导出数据

### 安全更新
- 定期更新依赖包
- 监控安全漏洞
- 更新SSL证书

---

🎉 **恭喜！你的仓库管理系统已成功部署到云端！**