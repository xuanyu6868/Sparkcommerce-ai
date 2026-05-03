import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './shared/middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API 路由
app.use('/api', routes);

// 静态文件（本地存储的图片）
app.use('/uploads', express.static('uploads'));

// 前端静态文件（生产环境从 client/dist 提供）
const clientDistDir = path.join(__dirname, '../../client/dist');
const staticDir = existsSync(clientDistDir) ? clientDistDir : path.join(__dirname, '../public');
app.use(express.static(staticDir));

// SPA 路由支持（所有未匹配的非 API 路由返回 index.html）
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(staticDir, 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    next();
  }
});

// 错误处理
app.use(notFoundHandler);
app.use(errorHandler);

// 启动
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   SparkCommerce Backend Started              ║
║   http://localhost:${PORT}                     ║
╚═══════════════════════════════════════════════╝
  `);
});

export default app;
