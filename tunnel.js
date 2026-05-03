#!/usr/bin/env node
const { spawn } = require('child_process');

function startTunnel() {
  const lt = spawn('npx', ['-y', 'localtunnel', '--port', '3000'], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  lt.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);
    const match = output.match(/your url is: (https:\/\/[^\s]+)/);
    if (match) {
      const url = match[1];
      require('fs').writeFileSync('/tmp/spark_url.txt', url);
      console.log(`\n✅ 公网地址已写入 /tmp/spark_url.txt`);
      console.log(`🌐 ${url}\n`);
    }
  });

  lt.stderr.on('data', (data) => console.error(data.toString()));

  lt.on('close', (code) => {
    console.log(`[tunnel] 断线 (code ${code})，5秒后重连...`);
    setTimeout(startTunnel, 5000);
  });
}

startTunnel();
