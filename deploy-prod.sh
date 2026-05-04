#!/bin/bash
set -e

echo "=========================================="
echo "  SparkCommerce AI — 生产环境部署"
echo "=========================================="

# 颜色
GREEN='\033[0;32m'
NC='\033[0m'

# 1. 安装 PM2
echo -e "${GREEN}[1/7] 安装 PM2...${NC}"
npm install -g pm2

# 2. 安装依赖
echo -e "${GREEN}[2/7] 安装依赖...${NC}"
npm install

# 3. 生成 Prisma Client (MySQL)
echo -e "${GREEN}[3/7] 生成 Prisma Client (MySQL)...${NC}"
cd server
npx prisma generate
cd ..

# 4. 推送数据库
echo -e "${GREEN}[4/7] 推送数据库结构...${NC}"
cd server
npx prisma db push --skip-generate
cd ..

# 5. 安装图片优化工具
echo -e "${GREEN}[5/8] 安装图片优化工具...${NC}"
apt-get install -y webp 2>/dev/null || echo "webp 工具暂不可用，跳过图片优化"

# 6. 构建项目 (含图片压缩)
echo -e "${GREEN}[6/8] 构建项目...${NC}"
npm run build:prod

# 7. 构建后端
echo -e "${GREEN}[7/8] 构建后端...${NC}"
npm run build -w server

# 8. 启动 PM2
echo -e "${GREEN}[8/8] 启动服务...${NC}"
pm2 delete sparkcommerce 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root

echo ""
echo "=========================================="
echo -e "${GREEN}  部署完成！${NC}"
echo "  http://localhost:3001 (后端)"
echo "  配置 Nginx 后访问 http://你的IP"
echo "=========================================="
