#!/bin/bash
# =====================================================
# SparkCommerce 一键部署脚本（交互式密码输入）
# 用法: 在 项目根目录 下运行 ./deploy_to_aliyun.sh
# =====================================================

set -e

SERVER="8.135.43.78"
USER="root"
REMOTE_DIR="/root/sparkcommerce"

echo "=========================================="
echo "  SparkCommerce 一键部署"
echo "  目标: $SERVER"
echo "=========================================="
echo ""

cd "$(dirname "$0")"

# 1. 编译后端
echo "▸ [1/5] 编译后端..."
cd server
npm run build
cd ..

# 2. 检查前端 dist
echo "▸ [2/5] 编译前端..."
cd client && npm run build && cd ..

# 3. 打包（不包含 node_modules / .git / 数据库等）
echo ""
echo "▸ [3/5] 打包项目文件..."

rm -f /tmp/sparkcommerce_deploy.tar.gz

# 重要：--exclude 是全局匹配，"dist" 会排除 server/dist 和 client/dist
# 所以我们用更精确的写法，只排除顶层 dist/ 目录（如果有的话）
tar czf /tmp/sparkcommerce_deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='uploads' \
  --exclude='*.db' \
  --exclude='server/node_modules' \
  --exclude='client/node_modules' \
  server/package.json \
  server/package-lock.json \
  server/prisma \
  server/dist \
  client/dist

echo "  打包完成: $(du -h /tmp/sparkcommerce_deploy.tar.gz | cut -f1)"

# 验证打包内容是否包含编译产物
echo "  验证打包内容..."
tar tzf /tmp/sparkcommerce_deploy.tar.gz | grep -q "server/dist/app.js" && echo "  ✅ server/dist 已包含" || { echo "  ❌ server/dist 缺失，中止"; exit 1; }
tar tzf /tmp/sparkcommerce_deploy.tar.gz | grep -q "client/dist/index.html" && echo "  ✅ client/dist 已包含" || { echo "  ❌ client/dist 缺失，中止"; exit 1; }

# 4. 上传
echo ""
echo "▸ [4/5] 上传到服务器（请输入密码）..."
echo ""

ssh -o StrictHostKeyChecking=no "${USER}@${SERVER}" "mkdir -p ${REMOTE_DIR}"

scp -o StrictHostKeyChecking=no \
  /tmp/sparkcommerce_deploy.tar.gz \
  server/.env.production \
  "${USER}@${SERVER}:${REMOTE_DIR}/"

# 5. 远程安装 + 启动
echo ""
echo "▸ [5/5] 远程安装依赖 + 启动服务（请输入密码）..."
echo ""

ssh -o StrictHostKeyChecking=no "${USER}@${SERVER}" /bin/bash << 'ENDSSH'
  set -e
  cd /root/sparkcommerce

  echo ""
  echo "  → 清理旧项目（保留 uploads 目录和数据库）..."

  # 列出当前目录所有内容，逐个删除（跳过要保留的）
  for item in /root/sparkcommerce/* /root/sparkcommerce/.[!.]* /root/sparkcommerce/..?*; do
    [ -e "$item" ] || continue
    basename=$(basename "$item")
    case "$basename" in
      uploads|sparkcommerce_deploy.tar.gz|.env.production)
        continue
        ;;
      *)
        rm -rf "$item"
        ;;
    esac
  done

  echo ""
  echo "  → 解压新文件..."
  tar xzf sparkcommerce_deploy.tar.gz

  if [ -f .env.production ] && [ ! -f server/.env ]; then
    mv .env.production server/.env
  elif [ -f .env.production ]; then
    cp .env.production server/.env
  fi

  echo ""
  echo "  → 安装后端依赖..."
  cd server
  npm install --production 2>&1 | tail -5

  echo ""
  echo "  → 生成 Prisma Client..."
  npx prisma generate 2>&1 | tail -3

  echo ""
  echo "  → 同步数据库结构..."
  npx prisma db push 2>&1 | tail -5

  echo ""
  echo "  → 创建管理员账号（如不存在）..."
  node -e "
  const { PrismaClient } = require('@prisma/client');
  const bcrypt = require('bcryptjs');
  const p = new PrismaClient();
  (async () => {
    const existing = await p.user.findFirst({ where: { role: 'ADMIN' } });
    if (existing) {
      console.log('  管理员已存在: ' + existing.email);
    } else {
      const hash = await bcrypt.hash('admin123', 10);
      await p.user.create({
        data: { email: 'admin@sparkcommerce.com', password: hash, name: '管理员', role: 'ADMIN', credits: 0, totalCredits: 0 }
      });
      console.log('  ✅ 管理员账号已创建: admin@sparkcommerce.com / admin123');
    }
    await p.\$disconnect();
  })().catch(e => { console.log('  ⚠️ 创建管理员失败:', e.message); process.exit(0); });
  " 2>&1

  echo ""
  echo "  → 确保上传目录存在..."
  mkdir -p /root/sparkcommerce/server/uploads

  echo ""
  echo "  → 停止旧服务..."
  OLD_PID=$(lsof -t -i:3001 2>/dev/null || true)
  if [ -n "$OLD_PID" ]; then
    echo "  旧进程 PID: $OLD_PID，正在停止..."
    kill $OLD_PID 2>/dev/null || true
    sleep 2
  else
    echo "  无旧进程"
  fi

  echo ""
  echo "  → 启动新服务..."
  nohup node dist/app.js > /root/sparkcommerce_server.log 2>&1 &
  sleep 3

  echo ""
  echo "  → 验证服务..."
  if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "  ✅ 服务启动成功！"
    echo ""
    curl -s http://localhost:3001/api/health
  else
    echo "  ❌ 服务启动失败，日志:"
    tail -30 /root/sparkcommerce_server.log
    exit 1
  fi
ENDSSH

rm -f /tmp/sparkcommerce_deploy.tar.gz

echo ""
echo "=========================================="
echo "  ✅ 部署完成！"
echo "=========================================="
echo ""
echo "  外网访问: http://${SERVER}:3001"
echo ""
echo "  查看日志:"
echo "    ssh root@${SERVER} 'tail -f /root/sparkcommerce_server.log'"
echo ""
