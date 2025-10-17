# 仓库管理系统云端部署指南

## 🌐 推荐部署方案

### 前端：Vercel（免费）
- ✅ 完全免费，无限制
- ✅ 全球CDN，访问速度快
- ✅ 自动部署，Git推送即更新
- ✅ 自动HTTPS证书
- ✅ 支持自定义域名

### 后端：Railway（$5/月）
- ✅ 价格便宜，仅$5/月
- ✅ PostgreSQL数据库，比SQLite更适合生产环境
- ✅ 自动备份，数据安全
- ✅ 环境变量管理
- ✅ 日志监控

## 🚀 部署步骤

### 第一步：部署后端到Railway

1. **注册Railway账户**
   - 访问 https://railway.app
   - 使用GitHub登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库

3. **配置后端服务**
   - 选择 `server` 文件夹作为根目录
   - Railway会自动检测到 `package.json`
   - 设置环境变量：
     ```
     NODE_ENV=production
     PORT=3000
     ```

4. **添加PostgreSQL数据库**
   - 在项目中点击 "New"
   - 选择 "Database" -> "PostgreSQL"
   - Railway会自动创建数据库

5. **获取后端URL**
   - 部署完成后，Railway会提供类似 `https://your-app.railway.app` 的URL
   - 记录这个URL，稍后配置前端

### 第二步：部署前端到Vercel

1. **注册Vercel账户**
   - 访问 https://vercel.com
   - 使用GitHub登录

2. **导入项目**
   - 点击 "New Project"
   - 选择你的GitHub仓库
   - 选择根目录（不是server文件夹）

3. **配置环境变量**
   - 在项目设置中添加环境变量：
     ```
     REACT_APP_API_URL=https://your-app.railway.app
     ```

4. **部署**
   - Vercel会自动构建和部署
   - 获得类似 `https://your-app.vercel.app` 的URL

### 第三步：配置数据库

1. **获取数据库连接信息**
   - 在Railway项目中找到PostgreSQL服务
   - 复制连接字符串

2. **初始化数据库**
   - 使用数据库管理工具连接
   - 运行 `schema/schema.sql` 创建表结构
   - 运行 `init-all-data.js` 初始化数据

## 🔧 配置说明

### 环境变量

**后端环境变量（Railway）：**
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:port/database
```

**前端环境变量（Vercel）：**
```
REACT_APP_API_URL=https://your-backend.railway.app
```

### 数据库迁移

从SQLite迁移到PostgreSQL：

1. **导出SQLite数据**
   ```bash
   sqlite3 warehouse.db .dump > data.sql
   ```

2. **转换数据格式**
   - 修改SQL语法以适配PostgreSQL
   - 处理数据类型差异

3. **导入到PostgreSQL**
   ```bash
   psql $DATABASE_URL < data.sql
   ```

## 💰 成本分析

| 服务 | 费用 | 说明 |
|------|------|------|
| Vercel | 免费 | 前端托管 |
| Railway | $5/月 | 后端+数据库 |
| 域名 | $10-15/年 | 可选，自定义域名 |
| **总计** | **$5/月** | **约$60/年** |

## 🔒 安全配置

1. **HTTPS证书**
   - Vercel和Railway都自动提供HTTPS
   - 无需额外配置

2. **CORS设置**
   - 后端已配置允许前端域名访问
   - 生产环境需要更新CORS设置

3. **环境变量**
   - 敏感信息存储在环境变量中
   - 不在代码中硬编码

## 📊 监控和维护

1. **日志查看**
   - Railway提供实时日志
   - Vercel提供部署日志

2. **性能监控**
   - Railway提供CPU/内存使用情况
   - Vercel提供访问统计

3. **备份策略**
   - Railway自动备份数据库
   - 建议定期导出数据

## 🆘 故障排除

### 常见问题

1. **前端无法连接后端**
   - 检查 `REACT_APP_API_URL` 环境变量
   - 确认后端服务正常运行

2. **数据库连接失败**
   - 检查 `DATABASE_URL` 环境变量
   - 确认数据库服务已启动

3. **CORS错误**
   - 检查后端CORS配置
   - 确认前端域名在允许列表中

### 联系支持

- Railway支持：https://railway.app/docs
- Vercel支持：https://vercel.com/docs
- 项目文档：查看README.md

## 🎯 下一步

1. 部署完成后测试所有功能
2. 配置自定义域名（可选）
3. 设置监控和告警
4. 准备用户培训材料
5. 制定维护计划

---

**部署完成后，你的客户就可以通过网页访问仓库管理系统了！**
