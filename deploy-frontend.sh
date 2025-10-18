#!/bin/bash

# Vercel前端部署脚本

echo "🚀 开始部署前端到Vercel..."

# 检查是否安装了Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装Vercel CLI..."
    npm install -g vercel
fi

# 构建前端
echo "🔨 构建前端..."
npm run build

# 检查构建是否成功
if [ ! -d "dist" ]; then
    echo "❌ 构建失败，dist目录不存在"
    exit 1
fi

echo "✅ 前端构建成功"

# 部署到Vercel
echo "🚀 部署到Vercel..."
vercel --prod

echo "✅ 前端部署完成！"
echo "🌐 你的应用现在可以通过Vercel URL访问"
