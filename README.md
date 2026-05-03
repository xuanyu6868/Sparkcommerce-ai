# SparkCommerce AI — 电商影像实验室

一站式 AI 电商影像平台。输入产品描述，秒级生成商业摄影级商品主图与详情页。

## 项目结构

```
sparkcommerce/
├── client/          # React 前端 (Vite + Tailwind CSS 4)
│   ├── public/      # 静态资源（商品图等）
│   └── src/         # 源码
├── server/          # Express 后端 (Prisma + TypeScript)
│   ├── prisma/      # 数据库 Schema
│   ├── src/         # 源码
│   └── uploads/     # AI 生成图片存储
├── package.json     # Monorepo 根配置
└── .gitignore
```

## 快速开始

```bash
# 1. 安装所有依赖
npm install

# 2. 配置环境变量
cp server/.env.example server/.env
# 编辑 server/.env，填入 AI_API_KEY 等

# 3. 初始化数据库
npm run db:push

# 4. 启动开发环境（前后端同时启动）
npm run dev
```

- 前端: http://localhost:3000
- 后端: http://localhost:3001
- API Health: http://localhost:3001/api/health

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 同时启动前后端开发服务器 |
| `npm run dev:client` | 仅启动前端 |
| `npm run dev:server` | 仅启动后端 |
| `npm run build` | 构建前后端 |
| `npm run lint` | TypeScript 类型检查 |
| `npm run db:push` | 推送数据库变更 |
| `npm run db:migrate` | 数据库迁移 |

## 生产部署

```bash
npm run build        # 构建
npm run db:push      # 同步数据库
NODE_ENV=production npm run start  # 启动
```

## 技术栈

- **前端**: React 19, Vite 6, Tailwind CSS 4, Motion, Lucide Icons
- **后端**: Express 5, Prisma, TypeScript, JWT, Zod
- **AI**: OpenAI-compatible 图片生成 API
