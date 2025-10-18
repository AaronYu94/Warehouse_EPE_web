# 🚀 Railway部署指南 - 客户数据迁移

## 📋 部署步骤

### 第一步：准备代码

1. **确保所有文件就位**
   ```bash
   # 检查客户数据文件
   ls -la customer-data.db
   
   # 检查迁移脚本
   ls -la server/railway-migrate.js
   ```

2. **提交代码到GitHub**
   ```bash
   git add .
   git commit -m "准备Railway部署 - 包含客户数据迁移"
   git push origin main
   ```

### 第二步：部署到Railway

#### 2.1 创建Railway项目

1. **访问Railway**
   - 打开 [railway.app](https://railway.app)
   - 使用GitHub账户登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库
   - 选择 `server` 文件夹作为根目录

#### 2.2 添加PostgreSQL数据库

1. **添加数据库服务**
   - 在Railway项目中点击 "New"
   - 选择 "Database" → "PostgreSQL"
   - Railway会自动提供 `DATABASE_URL` 环境变量

2. **获取数据库连接信息**
   - 点击PostgreSQL服务
   - 复制 `DATABASE_URL` 值（类似：`postgresql://postgres:password@host:port/railway`）

#### 2.3 配置环境变量

在Railway项目设置中添加以下环境变量：

```
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://your-frontend.vercel.app
```

### 第三步：运行数据迁移

#### 3.1 在Railway控制台运行迁移

1. **打开Railway控制台**
   - 进入你的项目
   - 点击 "Deployments" 标签
   - 点击最新的部署

2. **运行迁移脚本**
   ```bash
   # 在Railway控制台中执行
   node railway-migrate.js
   ```

#### 3.2 验证数据迁移

1. **检查迁移结果**
   ```bash
   # 连接到PostgreSQL数据库
   psql $DATABASE_URL
   
   # 检查数据
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM material_references;
   SELECT COUNT(*) FROM product_references;
   SELECT COUNT(*) FROM product_recipe_mappings;
   ```

2. **测试登录**
   - 使用新的安全密码登录
   - 验证所有功能正常

### 第四步：部署前端

#### 4.1 部署到Vercel

1. **访问Vercel**
   - 打开 [vercel.com](https://vercel.com)
   - 使用GitHub账户登录

2. **导入项目**
   - 点击 "New Project"
   - 选择你的GitHub仓库
   - 构建设置：
     - Framework Preset: `Other`
     - Build Command: `npm run build`
     - Output Directory: `dist`

3. **设置环境变量**
   ```
   REACT_APP_API_URL=https://your-railway-app.up.railway.app
   ```

#### 4.2 更新Railway CORS设置

在Railway项目设置中更新：
```
FRONTEND_URL=https://your-vercel-app.vercel.app
```

## 🔍 验证部署

### 检查清单

- [ ] Railway后端服务运行正常
- [ ] PostgreSQL数据库连接成功
- [ ] 客户数据迁移完成
- [ ] 用户可以使用新密码登录
- [ ] 物料和产品数据正确显示
- [ ] 前端可以正常访问后端API
- [ ] 所有功能正常工作

### 测试步骤

1. **后端健康检查**
   ```bash
   curl https://your-railway-app.up.railway.app/health
   ```

2. **数据库连接测试**
   ```bash
   curl https://your-railway-app.up.railway.app/api/me
   ```

3. **前端功能测试**
   - 访问Vercel部署的URL
   - 使用新密码登录
   - 检查所有页面和功能

## 🛠️ 故障排除

### 常见问题

1. **迁移脚本失败**
   ```bash
   # 检查数据库连接
   echo $DATABASE_URL
   
   # 检查SQLite文件
   ls -la customer-data.db
   ```

2. **数据库连接失败**
   ```bash
   # 测试PostgreSQL连接
   psql $DATABASE_URL -c "SELECT 1;"
   ```

3. **前端无法连接后端**
   - 检查 `REACT_APP_API_URL` 设置
   - 确认Railway服务正在运行
   - 检查CORS设置

### 日志查看

**Railway日志**:
- 在Railway项目页面查看 "Deployments"
- 点击部署查看详细日志

**Vercel日志**:
- 在Vercel项目页面查看 "Functions"
- 查看实时日志和错误信息

## 📊 迁移后的数据结构

### 新增表
- `material_references` - 物料参考表（24条记录）
- `product_references` - 产品参考表（8条记录）
- `product_recipe_mappings` - 产品配方表（62条记录）

### 现有表
- `users` - 用户表（3个用户，使用安全密码）
- `inbound_raw` - 原料入库表
- `outbound_raw` - 原料出库表
- 其他业务表...

## 🔐 安全密码

迁移完成后，使用以下安全密码：

| 用户 | 密码 | 权限 |
|------|------|------|
| admin | `Admin@2024!Secure` | 管理员 |
| operator | `Operator@2024!Safe` | 操作员 |
| viewer | `Viewer@2024!Read` | 查看者 |

## 🎯 部署完成

部署完成后，你的系统将包含：
- ✅ 客户的24个物料数据
- ✅ 客户的8个产品数据
- ✅ 客户的62个产品配方
- ✅ 安全的用户认证系统
- ✅ 现代化的Web界面
- ✅ 云端数据库存储

---

**🚀 恭喜！你的仓库管理系统已成功部署到Railway云端！**
