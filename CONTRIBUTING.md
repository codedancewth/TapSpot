# TapSpot 贡献指南

感谢你对 TapSpot 项目的关注！本文档将帮助你快速了解项目结构并进行开发。

## 📁 项目结构

```
TapSpot/
├── backend/                 # Go 后端服务
│   ├── main.go             # 应用入口
│   ├── config/             # 配置管理
│   │   └── database.go        # 数据库连接
│   ├── controllers/        # 控制器（API处理）
│   │   ├── auth.go           # 认证：登录、注册
│   │   ├── post.go           # 帖子：CRUD操作
│   │   ├── comment.go        # 评论：发布、删除
│   │   ├── like.go           # 点赞：帖子、评论
│   │   ├── user.go           # 用户：资料、空间
│   │   ├── message.go        # 消息：聊天、会话
│   │   └── ...
│   ├── models/             # 数据模型（GORM）
│   │   └── models.go          # 所有模型定义
│   ├── routes/             # 路由配置
│   │   └── routes.go          # API路由映射
│   └── websocket/          # WebSocket 聊天
│       └── chat.go            # Hub和消息处理
│
├── frontend/src/           # React 前端
│   ├── App.jsx             # 主应用组件
│   ├── components/         # UI组件
│   │   ├── Map/              # 地图相关
│   │   │   └── MapIcon.js      # 标记图标
│   │   ├── Chat.jsx          # 聊天组件
│   │   └── ...
│   ├── utils/              # 工具函数
│   │   ├── api.js            # API请求封装
│   │   ├── constants.js      # 常量配置
│   │   └── helpers.js        # 辅助函数
│   └── styles/             # 样式文件
│       └── modern.css        # 主题样式
│
├── nginx/                  # Nginx 配置
├── docs/                   # 项目文档
└── README.md               # 项目说明
```

## 🔧 开发环境设置

### 后端 (Go)

```bash
cd backend
go mod download
go run main.go
```

### 前端 (React)

```bash
cd frontend
npm install
npm run dev    # 开发模式
npm run build  # 生产构建
```

## 📝 代码规范

### Go 后端

- 使用 `gofmt` 格式化代码
- 每个公开函数添加注释说明
- 错误处理要完整

```go
// CreatePost 创建新帖子
// POST /api/posts
// 需要认证
func CreatePost(c *gin.Context) {
    // ...
}
```

### React 前端

- 组件使用函数式组件 + Hooks
- 样式使用内联对象（当前）或 CSS 文件
- 导入路径使用相对路径

```jsx
// 组件命名：PascalCase
export default function MyComponent() {
  const [state, setState] = useState(initialValue)
  // ...
}
```

## 🔌 API 端点

### 认证
- `POST /api/register` - 注册
- `POST /api/login` - 登录
- `GET /api/me` - 获取当前用户

### 帖子
- `GET /api/posts` - 获取列表
- `POST /api/posts` - 创建帖子
- `DELETE /api/posts/:id` - 删除帖子
- `POST /api/posts/:id/like` - 点赞

### 聊天
- `GET /api/conversations` - 会话列表
- `POST /api/messages` - 发送消息
- `WS /api/ws` - WebSocket连接

## 🐛 调试技巧

### 后端日志
```bash
# 查看服务日志
journalctl -u tapspot -f
```

### 前端调试
- 打开浏览器开发者工具 (F12)
- 查看 Console 和 Network 标签

## 📦 部署

详细部署步骤请参考 [README.md](./README.md) 的快速部署章节。

## 🤝 提交代码

1. Fork 项目
2. 创建分支：`git checkout -b feature/my-feature`
3. 提交：`git commit -m "feat: 添加新功能"`
4. 推送：`git push origin feature/my-feature`
5. 提交 Pull Request

### 提交信息格式

- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `refactor:` 代码重构
- `style:` 代码格式
- `test:` 测试相关

---

如有问题，请提交 [Issue](https://github.com/codedancewth/TapSpot/issues)
