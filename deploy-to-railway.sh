#!/bin/bash

# Railway部署脚本
# 使用方法: ./deploy-to-railway.sh

echo "🚀 开始部署到Railway..."

# 检查必要文件
echo "📋 检查必要文件..."

if [ ! -f "customer-data.db" ]; then
    echo "❌ 错误: 未找到 customer-data.db 文件"
    echo "请确保客户数据库文件在项目根目录"
    exit 1
fi

if [ ! -f "server/railway-migrate.js" ]; then
    echo "❌ 错误: 未找到迁移脚本"
    echo "请确保 server/railway-migrate.js 文件存在"
    exit 1
fi

echo "✅ 必要文件检查完成"

# 检查Git状态
echo "📤 检查Git状态..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  检测到未提交的更改"
    read -p "是否提交所有更改? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "准备Railway部署 - 包含客户数据迁移"
    else
        echo "❌ 部署取消"
        exit 1
    fi
fi

# 推送到GitHub
echo "📤 推送代码到GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ 代码推送成功"
else
    echo "❌ 代码推送失败，请检查GitHub连接"
    exit 1
fi

echo ""
echo "🎉 代码已推送到GitHub！"
echo ""
echo "📋 接下来的步骤："
echo ""
echo "1. 🌐 部署后端到Railway:"
echo "   - 访问 https://railway.app"
echo "   - 创建新项目，选择server文件夹"
echo "   - 添加PostgreSQL数据库"
echo "   - 环境变量: NODE_ENV=production, PORT=4000"
echo ""
echo "2. 🔄 运行数据迁移:"
echo "   - 在Railway控制台中运行: node railway-migrate.js"
echo "   - 等待迁移完成"
echo ""
echo "3. 🌐 部署前端到Vercel:"
echo "   - 访问 https://vercel.com"
echo "   - 导入你的GitHub仓库"
echo "   - 构建设置: npm run build, 输出目录: dist"
echo "   - 环境变量: REACT_APP_API_URL=https://your-railway-app.up.railway.app"
echo ""
echo "4. 🔗 更新配置:"
echo "   - 将Railway后端URL设置为前端的REACT_APP_API_URL"
echo "   - 将Vercel前端URL设置为后端的FRONTEND_URL"
echo ""
echo "📖 详细部署指南请查看: RAILWAY_DEPLOYMENT.md"
echo ""
echo "🔐 新的安全密码:"
echo "   管理员: admin / Admin@2024!Secure"
echo "   操作员: operator / Operator@2024!Safe"
echo "   查看者: viewer / Viewer@2024!Read"
echo ""
echo "🎯 部署完成后，你的系统将在云端运行！"
