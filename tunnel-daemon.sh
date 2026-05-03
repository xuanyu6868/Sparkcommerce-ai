#!/bin/bash
# 稳定的内网穿透 - 自动重连，写入当前 URL 到文件
URL_FILE="/tmp/spark_url.txt"

while true; do
  echo "[$(date)] 连接中..."
  ssh -o StrictHostKeyChecking=no \
      -o ServerAliveInterval=10 \
      -o ServerAliveCountMax=3 \
      -o ConnectTimeout=10 \
      -R 80:localhost:3000 localhost.run 2>&1 | while read line; do
    echo "$line"
    if echo "$line" | grep -q "lhr.life"; then
      URL=$(echo "$line" | grep -o 'https://[a-z0-9]*\.lhr\.life')
      echo "$URL" > "$URL_FILE"
      echo "✅ 公网地址: $URL"
    fi
  done
  echo "[$(date)] 断开，5秒后重连..."
  sleep 5
done
