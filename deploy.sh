#!/bin/bash

# 仓库管理系统云端部署脚本
# 使用方法: ./deploy.sh

echo "🚀 开始部署仓库管理系统到云端..."

# 检查是否在Git仓库中
if [ ! -d ".git" ]; then
    echo "❌ 错误: 当前目录不是Git仓库"
    echo "请先运行: git init && git add . && git commit -m 'Initial commit'"
    exit 1
fi

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  检测到未提交的更改"
    read -p "是否提交所有更改? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "准备云端部署"
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
echo "1. 🌐 部署前端到Vercel:"
echo "   - 访问 https://vercel.com"
echo "   - 导入你的GitHub仓库"
echo "   - 构建设置: npm run build, 输出目录: dist"
echo "   - 环境变量: REACT_APP_API_URL=https://your-backend.railway.app"
echo ""
echo "2. 🖥️  部署后端到Railway:"
echo "   - 访问 https://railway.app"
echo "   - 创建新项目，选择server文件夹"
echo "   - 添加PostgreSQL数据库"
echo "   - 环境变量: NODE_ENV=production, FRONTEND_URL=https://your-frontend.vercel.app"
echo ""
echo "3. 🔗 更新配置:"
echo "   - 将Railway后端URL设置为前端的REACT_APP_API_URL"
echo "   - 将Vercel前端URL设置为后端的FRONTEND_URL"
echo ""
echo "📖 详细部署指南请查看: DEPLOYMENT_GUIDE.md"
echo ""
echo "🎯 部署完成后，你的系统将在云端运行！"
