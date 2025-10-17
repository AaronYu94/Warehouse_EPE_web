# Warehouse Management System

一个基于 Electron 的本地仓库管理系统，支持 Windows 和 Mac。

## 功能特性

- 📦 **物料管理**: 原料和辅料的入库、出库管理
- 🏭 **生产管理**: 产品配方和成品出库
- 💰 **财务管理**: 成本核算、利润分析
- 📊 **数据分析**: 库存周转率、趋势分析、需求预测
- 🔐 **用户权限**: 管理员、操作员、查看员三种角色
- 📝 **操作日志**: 完整的操作记录和审计追踪
- 🖥️ **桌面应用**: 本地运行，无需网络连接

## 系统要求

- **Windows**: Windows 10 或更高版本
- **Mac**: macOS 10.14 或更高版本
- **内存**: 至少 4GB RAM
- **存储**: 至少 500MB 可用空间

## 快速开始

### 1. 安装依赖

```bash
node install-dependencies.js
```

### 2. 开发模式

```bash
# 启动前端开发服务器
npm run start

# 启动后端服务器
npm run dev

# 启动 Electron 应用（开发模式）
npm run electron-dev
```

### 3. 构建应用

```bash
# 构建 Windows 安装包
npm run build-win

# 构建 Mac 安装包
npm run build-mac
```

## 默认用户

系统预置了三个默认用户：

| 用户名 | 密码 | 角色 | 权限 |
|--------|------|------|------|
| admin | admin123 | 管理员 | 所有功能 |
| operator | operator123 | 操作员 | 数据录入、查看 |
| viewer | viewer123 | 查看员 | 仅查看功能 |

## 数据库

- **类型**: SQLite
- **文件**: `server/warehouse.db`
- **特点**: 本地文件，无需安装数据库服务器
- **备份**: 可直接复制 `warehouse.db` 文件进行备份

## 项目结构

```
WarehouseApp/
├── src/                    # React 前端代码
│   ├── components/         # 组件
│   ├── pages/             # 页面
│   ├── contexts/          # React Context
│   └── i18n.js           # 国际化配置
├── server/                # Node.js 后端
│   ├── index-sqlite.js   # Express 服务器
│   ├── db-sqlite.js      # SQLite 数据库操作
│   └── warehouse.db      # SQLite 数据库文件
├── main.js               # Electron 主进程
├── package.json          # 项目配置
└── README.md            # 项目说明
```

## 技术栈

- **前端**: React 19, React Router, Parcel
- **后端**: Node.js, Express
- **数据库**: SQLite
- **桌面**: Electron
- **UI**: 原生 HTML/CSS/JavaScript

## 打包说明

### Windows 打包
- 生成 `.exe` 安装文件
- 自动安装到 `Program Files`
- 创建开始菜单快捷方式
- 支持自动更新

### Mac 打包
- 生成 `.dmg` 安装文件
- 拖拽安装到 Applications
- 支持 macOS 签名
- 兼容 Apple Silicon

## 数据迁移

如果需要从 PostgreSQL 迁移到 SQLite：

1. 导出 PostgreSQL 数据为 CSV
2. 使用 SQLite 导入工具导入数据
3. 验证数据完整性

## 故障排除

### 常见问题

1. **应用无法启动**
   - 检查 Node.js 版本 (建议 16+)
   - 重新安装依赖: `npm install`

2. **数据库连接失败**
   - 检查 `server/warehouse.db` 文件权限
   - 删除数据库文件重新初始化

3. **打包失败**
   - 确保已安装所有依赖
   - 检查网络连接（下载 Electron）

### 日志查看

- **开发模式**: 控制台输出
- **生产模式**: 应用菜单 → View → Toggle Developer Tools

## 许可证

ISC License

## 支持

如有问题，请检查：
1. 系统要求是否满足
2. 依赖是否正确安装
3. 数据库文件是否完整 