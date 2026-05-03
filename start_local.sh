#!/bin/bash
# =====================================================
# SparkCommerce local production server + frp tunnel
# =====================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RUN_DIR="${SCRIPT_DIR}/.local-run"
FRPC_CONFIG="${SCRIPT_DIR}/frpc.toml"

mkdir -p "${RUN_DIR}"

echo "=========================================="
echo "  SparkCommerce 本地运行 + frp 穿透"
echo "=========================================="
echo ""

if ! command -v frpc >/dev/null 2>&1; then
  echo "未检测到 frpc。请先安装 frp：brew install frp"
  exit 1
fi

cd "${SCRIPT_DIR}"

echo "▸ [1/4] 停止旧的本地服务..."
if [ -f "${RUN_DIR}/server.pid" ]; then
  kill "$(cat "${RUN_DIR}/server.pid")" 2>/dev/null || true
fi
if [ -f "${RUN_DIR}/frpc.pid" ]; then
  kill "$(cat "${RUN_DIR}/frpc.pid")" 2>/dev/null || true
fi
for port in 3000 3001; do
  pids="$(lsof -tiTCP:"${port}" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -n "${pids}" ]; then
    kill ${pids} 2>/dev/null || true
  fi
done
sleep 1

echo "▸ [2/4] 构建本地生产版..."
npm run build

echo "▸ [3/4] 启动本地 SparkCommerce（前端 + API，同源 3001）..."
nohup env PORT=3001 node server/dist/app.js > "${RUN_DIR}/server.log" 2>&1 &
echo $! > "${RUN_DIR}/server.pid"

for i in {1..20}; do
  if curl -s http://127.0.0.1:3001/api/health >/dev/null 2>&1; then
    break
  fi
  sleep 0.5
done
curl -s http://127.0.0.1:3001/api/health >/dev/null

echo "▸ [4/4] 启动 frpc..."
nohup frpc -c "${FRPC_CONFIG}" > "${RUN_DIR}/frpc.log" 2>&1 &
echo $! > "${RUN_DIR}/frpc.pid"
sleep 2

if grep -qi "login to server failed\\|authentication failed\\|error" "${RUN_DIR}/frpc.log"; then
  echo "frpc 启动失败，日志："
  tail -n 40 "${RUN_DIR}/frpc.log"
  exit 1
fi

echo ""
echo "=========================================="
echo "  已启动"
echo "=========================================="
echo "本地访问: http://127.0.0.1:3001"
echo "外网访问: https://hmiai.cc （SSL 配好后）"
echo "HTTP访问: http://hmiai.cc"
echo ""
echo "日志:"
echo "  tail -f ${RUN_DIR}/server.log"
echo "  tail -f ${RUN_DIR}/frpc.log"
echo ""
echo "停止:"
echo "  kill \$(cat ${RUN_DIR}/server.pid) \$(cat ${RUN_DIR}/frpc.pid)"
