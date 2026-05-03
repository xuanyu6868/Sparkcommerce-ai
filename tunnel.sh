#!/bin/bash
# 内网穿透脚本 - 将本地 3000 端口暴露到公网
# 用法: ./tunnel.sh

echo "正在启动内网穿透..."
echo "公网地址会在几秒后显示"

ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 \
    -o ExitOnForwardFailure=yes \
    -R 80:localhost:3000 localhost.run 2>&1 | while read line; do
    echo "$line"
    echo "$line" | grep -q "lhr.life" && \
        echo "" && echo "✅ 公网地址如上，复制 https://...lhr.life 发给任何人即可访问" && echo ""
done
