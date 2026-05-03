# SparkCommerce AI 后端服务

电商影像实验室后端 API 服务

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入以下配置：

```env
# 数据库
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sparkcommerce?schema=public"

# MiniMax API Key（必填）
# 获取地址: https://platform.minimaxi.com/user-center/basic-information/interface-key
MINIMAX_API_KEY="your-api-key-here"

# JWT 密钥
JWT_SECRET="your-super-secret-key-change-in-production"
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npm run db:generate

# 推送数据库结构（开发环境）
npm run db:push
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:3001 启动

## 技术栈

- **Runtime**: Node.js + Express
- **Database**: PostgreSQL + Prisma ORM
- **AI**: MiniMax Image Generation API (`image-01`)
- **Storage**: 本地文件系统（生产环境可切换 OSS/S3）
- **Auth**: JWT

### 认证

| Method | Endpoint | 说明 |
|--------|----------|------|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |
| GET | `/api/auth/me` | 当前用户信息 |

### 用户

| Method | Endpoint | 说明 |
|--------|----------|------|
| GET | `/api/users/profile` | 获取个人信息 |
| PUT | `/api/users/profile` | 更新个人信息 |
| GET | `/api/users/usage` | 额度使用统计 |

### 图片生成 ⭐

| Method | Endpoint | 说明 |
|--------|----------|------|
| POST | `/api/images/generate` | 生成图片 |
| GET | `/api/images` | 我的作品列表 |
| GET | `/api/images/:id` | 作品详情 |
| DELETE | `/api/images/:id` | 删除作品 |
| PATCH | `/api/images/:id/public` | 切换公开状态 |
| POST | `/api/images/:id/like` | 点赞/取消点赞 |

### 社区

| Method | Endpoint | 说明 |
|--------|----------|------|
| GET | `/api/community/images` | 社区作品流 |
| GET | `/api/community/leaderboard` | 创作者排行榜 |
| GET | `/api/community/inspiration` | 灵感推荐 |
| GET | `/api/community/styles` | 风格列表 |

### 定价与订单

| Method | Endpoint | 说明 |
|--------|----------|------|
| GET | `/api/pricing/plans` | 套餐列表 |
| POST | `/api/orders/create` | 创建订单 |
| GET | `/api/orders/list` | 订单列表 |
| GET | `/api/orders/:orderNo` | 订单详情 |
| POST | `/api/orders/callback` | 支付回调 |

## 生成图片请求示例

```bash
curl -X POST http://localhost:3001/api/images/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "prompt": "保湿面霜 放在石头桌面上",
    "aspectRatio": "1:1",
    "engineStyle": "none",
    "mainImageStyle": "minimalist",
    "detailStyle": "beauty",
    "commerceStyle": "xiaohongshu",
    "isMainImage": true
  }'
```

## 提示词风格

| ID | 名称 |
|----|------|
| `tmall_pro` | 天猫大牌 |
| `xiaohongshu_lifestyle` | 小红书种草 |
| `skincare_closeup` | 美妆微距特写 |
| `3c_tech` | 3C数码科技 |
| `food_gourmet` | 美食餐饮 |
| `home_lifestyle` | 家居生活 |
| `sports_outdoor` | 运动户外 |
| `jewelry_luxury` | 珠宝奢品 |
| `packaging_commercial` | 包装设计 |
| `anime_style` | 二次元插画 |

## 技术栈

- **Runtime**: Node.js + Express
- **Database**: PostgreSQL + Prisma ORM
- **AI**: MiniMax Image Generation API (`image-01`)
- **Storage**: 本地文件系统（生产环境可切换 OSS/S3）
- **Auth**: JWT
