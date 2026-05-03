# SparkCommerce AI — 生产环境一键部署

## 前置条件

1. 阿里云 ECS 服务器（2核2G，Ubuntu 22.04，99元/年）
2. 开放安全组端口：22、80、443、3001
3. （可选）域名 DNS 解析到服务器 IP

## 部署步骤

### 1. 连接服务器
```bash
ssh root@你的服务器IP
```

### 2. 安装基础依赖
```bash
apt update && apt install -y curl git nginx mysql-server
```

### 3. 安装 Node.js 22
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node -v
```

### 4. 配置 MySQL
```bash
mysql_secure_installation
# 设置 root 密码
# 全部选 Y

mysql -u root -p <<'SQL'
CREATE DATABASE sparkcommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'spark'@'localhost' IDENTIFIED BY 'your_mysql_password';
GRANT ALL PRIVILEGES ON sparkcommerce.* TO 'spark'@'localhost';
FLUSH PRIVILEGES;
SQL
```

### 5. 克隆项目
```bash
cd /opt
git clone https://github.com/xuanyu6868/Sparkcommerce-ai.git sparkcommerce
cd sparkcommerce
```

### 6. 配置环境变量
```bash
cp server/.env.production server/.env
# 编辑 server/.env，修改：
#   DATABASE_URL="mysql://spark:your_mysql_password@localhost:3306/sparkcommerce"
#   JWT_SECRET="随机生成一个长字符串"
#   AI_API_KEY="你的API密钥"
```

### 7. 一键部署
```bash
chmod +x deploy-prod.sh
./deploy-prod.sh
```

### 8. 配置 Nginx
```bash
cp nginx.conf /etc/nginx/sites-available/sparkcommerce
ln -sf /etc/nginx/sites-available/sparkcommerce /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

### 9. 配置 SSL（如果有域名）
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d 你的域名.com
```

## 访问地址

- 有域名：https://你的域名.com
- 无域名：http://服务器IP

## 管理命令

```bash
pm2 status          # 查看状态
pm2 logs            # 查看日志
pm2 restart all     # 重启服务
pm2 stop all        # 停止服务
```
