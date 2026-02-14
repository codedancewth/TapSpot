const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

// 瓦片目录
const TILES_DIR = path.join(__dirname, 'tiles');

// 静态文件服务 - 瓦片
app.use('/tiles', express.static(TILES_DIR, {
  maxAge: '30d', // 缓存30天
  etag: true
}));

// CORS支持
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`瓦片服务器运行在 http://localhost:${PORT}`);
  console.log(`瓦片目录: ${TILES_DIR}`);
});
