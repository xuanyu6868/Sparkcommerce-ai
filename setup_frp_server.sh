#!/bin/bash
# =====================================================
# SparkCommerce frp server setup for Alibaba Cloud Linux
# Runs on local Mac, configures ECS: frps + Nginx reverse proxy.
# =====================================================

set -euo pipefail

SERVER="8.135.43.78"
USER="root"
DOMAIN="hmiai.cc"
FRP_VERSION="0.61.2"
FRP_TOKEN="3fda4567e4ed6b5d7dd68e5685a61fa06a4b3ef1d09e00d1"

echo "=========================================="
echo "  SparkCommerce frp 服务端配置"
echo "  域名: ${DOMAIN}"
echo "  服务器: ${SERVER}"
echo "=========================================="
echo ""
echo "请先确认 DNS：@ 和 www 都指向 ${SERVER}"
echo ""

ssh -o StrictHostKeyChecking=no "${USER}@${SERVER}" \
  "DOMAIN='${DOMAIN}' FRP_VERSION='${FRP_VERSION}' FRP_TOKEN='${FRP_TOKEN}' bash -s" << 'ENDSSH'
set -euo pipefail

install_pkg() {
  if command -v dnf >/dev/null 2>&1; then
    dnf install -y "$@"
  elif command -v yum >/dev/null 2>&1; then
    yum install -y "$@"
  elif command -v apt-get >/dev/null 2>&1; then
    apt-get update
    apt-get install -y "$@"
  else
    echo "No supported package manager found" >&2
    exit 1
  fi
}

echo "▸ [1/4] 安装基础依赖..."
install_pkg wget tar nginx

echo "▸ [2/4] 安装/配置 frps..."
cd /tmp
ARCHIVE="frp_${FRP_VERSION}_linux_amd64.tar.gz"
DIR="frp_${FRP_VERSION}_linux_amd64"
if [ ! -f "${ARCHIVE}" ]; then
  wget -O "${ARCHIVE}" "https://github.com/fatedier/frp/releases/download/v${FRP_VERSION}/${ARCHIVE}"
fi
rm -rf "${DIR}"
tar xzf "${ARCHIVE}"
install -m 0755 "${DIR}/frps" /usr/local/bin/frps

mkdir -p /etc/frp
cat > /etc/frp/frps.toml << FRPS
bindPort = 7000
vhostHTTPPort = 8080

auth.method = "token"
auth.token = "${FRP_TOKEN}"

webServer.addr = "127.0.0.1"
webServer.port = 7500
webServer.user = "admin"
webServer.password = "${FRP_TOKEN}"
FRPS

cat > /etc/systemd/system/frps.service << 'SYSTEMD'
[Unit]
Description=frp server for SparkCommerce
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/frps -c /etc/frp/frps.toml
Restart=always
RestartSec=5
LimitNOFILE=1048576

[Install]
WantedBy=multi-user.target
SYSTEMD

systemctl daemon-reload
systemctl enable frps
systemctl restart frps

echo "▸ [3/4] 配置 Nginx 反代到 frps vhost..."
mkdir -p /etc/nginx/conf.d
if [ -f /etc/nginx/conf.d/sparkcommerce.conf ]; then
  mv /etc/nginx/conf.d/sparkcommerce.conf "/etc/nginx/conf.d/sparkcommerce.conf.bak.frp.$(date +%Y%m%d%H%M%S)"
fi
cat > /etc/nginx/conf.d/sparkcommerce-frp.conf << NGINX
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    client_max_body_size 30m;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_connect_timeout 30s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        send_timeout 300s;
    }
}
NGINX

nginx -t
systemctl enable nginx
systemctl restart nginx

echo "▸ [4/4] 尝试配置 HTTPS 证书..."
if ! command -v certbot >/dev/null 2>&1; then
  install_pkg certbot python3-certbot-nginx || true
fi

if command -v certbot >/dev/null 2>&1; then
  certbot --nginx -d "${DOMAIN}" -d "www.${DOMAIN}" \
    --non-interactive --agree-tos --email "admin@${DOMAIN}" \
    --redirect || echo "HTTPS 自动配置失败，HTTP/frp 已可用，可稍后手动配置证书。"
else
  echo "未安装 certbot，跳过 HTTPS；HTTP/frp 已可用。"
fi

nginx -t
systemctl restart nginx

echo "▸ 服务状态..."
systemctl --no-pager --full status frps | sed -n '1,12p'
ss -lntp | grep -E ':80|:443|:7000|:8080' || true

echo ""
echo "服务端 frps + Nginx 已配置完成。"
ENDSSH

echo ""
echo "=========================================="
echo "  服务端配置完成"
echo "=========================================="
echo "下一步在 Mac 上运行: ./start_local.sh"
