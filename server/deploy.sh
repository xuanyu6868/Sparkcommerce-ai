#!/bin/bash
# SparkCommerce Backend 部署脚本

echo "=========================================="
echo "SparkCommerce Backend 部署脚本"
echo "=========================================="

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "错误: Node.js 未安装"
    exit 1
fi

echo "Node 版本: $(node --version)"
echo "npm 版本: $(npm --version)"

# 安装依赖
echo ""
echo "[1/5] 安装依赖..."
npm install

# 生成 Prisma Client
echo ""
echo "[2/5] 生成 Prisma Client..."
npx prisma generate

# 构建项目
echo ""
echo "[3/5] 构建项目..."
npm run build

# 推送数据库 Schema
echo ""
echo "[4/5] 推送数据库 Schema..."
npx prisma db push

# 启动服务
echo ""
echo "[5/5] 启动服务..."
echo ""
echo "=========================================="
echo "服务已启动: http://localhost:3001"
echo "=========================================="
npm run start
