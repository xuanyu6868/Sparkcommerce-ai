#!/bin/bash
# =====================================================
# SparkCommerce 域名绑定 + SSL 一键配置
# 用法: ./setup_domain.sh
# =====================================================

set -e

SERVER="8.135.43.78"
USER="root"
DOMAIN="hmiai.cc"

echo "=========================================="
echo "  SparkCommerce 域名绑定配置"
echo "  域名: $DOMAIN"
echo "  服务器: $SERVER"
echo "=========================================="
echo ""
echo "⚠️  请先在阿里云 DNS 添加解析记录："
echo "   记录类型: A"
echo "   主机记录: @  （也加一个 www）"
echo "   记录值: $SERVER"
echo ""
read -p "已添加 DNS 解析了吗？(y/N): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "请先去阿里云控制台添加 DNS 解析，然后重新运行此脚本。"
  exit 1
fi

echo ""
echo "▸ [1/4] 连接服务器安装 Nginx..."
ssh -o StrictHostKeyChecking=no "${USER}@${SERVER}" /bin/bash << 'ENDSSH'
  set -e

  echo "  → 安装 Nginx..."
  apt-get update -qq
  apt-get install -y -qq nginx

  echo "  → 配置防火墙..."
  ufw allow 80/tcp 2>/dev/null || true
  ufw allow 443/tcp 2>/dev/null || true

  echo "  → 创建 Nginx 配置..."
  cat > /etc/nginx/sites-available/sparkcommerce << 'NGINX'
server {
    listen 80;
    server_name hmiai.cc www.hmiai.cc;

    # 前端静态资源
    location /assets/ {
        alias /root/sparkcommerce/client/dist/assets/;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 前端页面（SPA 单页应用）
    location / {
        root /root/sparkcommerce/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
NGINX

  # 启用站点
  ln -sf /etc/nginx/sites-available/sparkcommerce /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default

  # 测试配置
  echo "  → 测试 Nginx 配置..."
  nginx -t

  # 重启 Nginx
  echo "  → 重启 Nginx..."
  systemctl restart nginx

  echo "  ✅ Nginx 配置完成！"
ENDSSH

echo ""
echo "▸ [2/4] Nginx 已启动，HTTP 已可用"
echo "  访问: http://${DOMAIN}"
echo ""

echo "▸ [3/4] 安装 SSL 证书（Let's Encrypt）..."
echo ""
ssh -o StrictHostKeyChecking=no "${USER}@${SERVER}" /bin/bash << 'ENDSSH'
  set -e

  echo "  → 安装 Certbot..."
  apt-get install -y -qq certbot python3-certbot-nginx

  echo "  → 申请 SSL 证书..."
  certbot --nginx -d hmiai.cc -d www.hmiai.cc --non-interactive --agree-tos --email admin@hmiai.cc --redirect

  echo "  → 设置证书自动续期..."
  systemctl enable certbot.timer 2>/dev/null || true
  certbot renew --dry-run

  echo "  ✅ SSL 证书配置完成！"
ENDSSH

echo ""
echo "▸ [4/4] 验证..."
echo ""
curl -sI "https://${DOMAIN}" | head -5

echo ""
echo "=========================================="
echo "  ✅ 域名绑定完成！"
echo "=========================================="
echo ""
echo "  访问: https://${DOMAIN}"
echo "  自动跳转: http → https"
echo ""
echo "  注意：DNS 解析可能需要几分钟到几小时生效"
echo ""

