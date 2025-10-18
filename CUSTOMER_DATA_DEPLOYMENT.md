# 🏢 客户数据云端部署指南

## 📊 客户数据分析结果

根据分析，你的客户数据库包含：
- **👥 用户**: 3个（admin, operator, viewer）
- **📦 物料**: 24个（各种坚果原料）
- **🏭 产品**: 8个（加工后的产品）
- **📝 日志**: 0条
- **🏢 资产**: 0条

## 🚀 部署步骤

### 第一步：准备数据迁移

1. **确保数据库文件位置正确**
   ```bash
   # 检查文件是否存在
   ls -la customer-data.db
   ```

2. **安装依赖**
   ```bash
   cd server
   npm install
   ```

### 第二步：本地测试迁移

1. **设置环境变量**
   ```bash
   export DATABASE_URL="postgresql://localhost:5432/warehouse_db"
   ```

2. **运行快速迁移脚本**
   ```bash
   node quick-migrate.js
   ```

### 第三步：部署到云端

#### 3.1 部署后端到Railway

1. **推送代码到GitHub**
   ```bash
   git add .
   git commit -m "添加客户数据迁移功能"
   git push origin main
   ```

2. **在Railway中部署**
   - 访问 [railway.app](https://railway.app)
   - 创建新项目，选择 `server` 文件夹
   - 添加PostgreSQL数据库
   - 设置环境变量：
     ```
     NODE_ENV=production
     PORT=4000
     FRONTEND_URL=https://your-frontend.vercel.app
     ```

3. **运行数据迁移**
   - 在Railway控制台中运行：
   ```bash
   node quick-migrate.js
   ```

#### 3.2 部署前端到Vercel

1. **在Vercel中导入项目**
   - 访问 [vercel.com](https://vercel.com)
   - 导入你的GitHub仓库
   - 构建设置：`npm run build`，输出目录：`dist`

2. **设置环境变量**
   ```
   REACT_APP_API_URL=https://your-backend.railway.app
   ```

## 🔧 数据迁移脚本说明

### 快速迁移脚本 (`quick-migrate.js`)
- ✅ 迁移用户数据（3个用户）
- ✅ 迁移物料数据（24个物料）
- ✅ 迁移产品数据（8个产品）
- ✅ 创建参考表结构

### 完整迁移脚本 (`migrate-customer-data.js`)
- ✅ 包含所有数据表
- ✅ 错误处理和统计
- ✅ 详细的迁移日志

## 📋 迁移后的数据结构

### 新增表
- `material_references` - 物料参考表
- `product_references` - 产品参考表
- `system_logs` - 系统日志表

### 现有表
- `users` - 用户表（3个用户）
- `assets` - 资产表
- `finance_records` - 财务记录表

## 🧪 测试迁移

### 本地测试
```bash
# 1. 启动本地PostgreSQL
# 2. 运行迁移脚本
node quick-migrate.js

# 3. 验证数据
psql $DATABASE_URL -c "SELECT COUNT(*) FROM material_references;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM product_references;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

### 云端测试
```bash
# 在Railway控制台中运行
node quick-migrate.js

# 验证数据
SELECT COUNT(*) FROM material_references;
SELECT COUNT(*) FROM product_references;
SELECT COUNT(*) FROM users;
```

## 🔍 验证部署

部署完成后，请测试以下功能：

### 基础功能
- [ ] 用户登录（admin/admin123）
- [ ] 用户登录（operator/operator123）
- [ ] 用户登录（viewer/viewer123）

### 数据功能
- [ ] 查看物料列表（24个物料）
- [ ] 查看产品列表（8个产品）
- [ ] 创建新的入库记录
- [ ] 创建新的出库记录

### 权限功能
- [ ] 管理员可以查看所有数据
- [ ] 操作员可以创建和修改数据
- [ ] 查看者只能查看数据

## 🆘 故障排除

### 常见问题

1. **迁移失败**
   ```bash
   # 检查数据库连接
   psql $DATABASE_URL -c "SELECT 1;"
   
   # 检查SQLite文件
   sqlite3 customer-data.db ".tables"
   ```

2. **数据重复**
   ```bash
   # 清理重复数据
   DELETE FROM material_references WHERE id NOT IN (SELECT MIN(id) FROM material_references GROUP BY code);
   ```

3. **权限问题**
   ```bash
   # 检查用户权限
   SELECT username, role FROM users;
   ```

## 📞 技术支持

如遇到问题，请提供：
1. 错误日志截图
2. 数据库连接状态
3. 迁移脚本输出

---

**🎯 目标：将客户的24个物料和8个产品数据成功迁移到云端PostgreSQL数据库，并部署到生产环境。**
