<p align="center">
  <img src="https://img.shields.io/badge/Go-1.21+-00ADD8?style=for-the-badge&logo=go" alt="Go">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql" alt="MySQL">
  <img src="https://img.shields.io/badge/WebSocket-✓-orange?style=for-the-badge" alt="WebSocket">
  <img src="https://img.shields.io/badge/AI-Enabled-purple?style=for-the-badge" alt="AI">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

<h1 align="center">📍 TapSpot</h1>
<h3 align="center">基于地理围栏的智能社交打卡平台</h3>

<p align="center">
  <i>Discover • Share • Connect • Chat • AI</i>
</p>

<p align="center">
  <a href="#-产品概述">产品概述</a> •
  <a href="#-核心功能">核心功能</a> •
  <a href="#-技术架构">技术架构</a> •
  <a href="#-api-文档">API 文档</a> •
  <a href="#-快速部署">快速部署</a>
</p>

---

## 🎯 产品概述

### 产品定位

**TapSpot** 是一款**基于地理位置的社交打卡平台**，通过创新的**内容竞争机制**、**实时通讯系统**和**AI 智能助手**，让用户在同一时空坐标下分享体验、建立连接。

### 核心价值

| 价值维度 | 描述 |
|:---|:---|
| **Discover** | 发现身边的精彩地点和优质内容 |
| **Share** | 分享个人体验，记录生活足迹 |
| **Connect** | 与志同道合的用户建立联系 |
| **Chat** | 实时沟通，深度交流 |
| **AI** | 智能分析推荐，个性化助手 |

### 核心理念

> *"在同一时空坐标下，让最有价值的声音被听见，让每一次交流都实时触达"*

### 目标用户

- 🎒 喜欢探索新地点的旅行者
- 📸 热衷分享生活体验的社交用户
- 🍜 需要地点推荐的本地生活用户
- 🤝 希望建立基于位置社交关系的用户

---

## ✨ 核心功能

### 🗺️ 地图与打卡

| 功能 | 描述 |
|:---|:---|
| **智能地图交互** | 基于 Leaflet 的流畅地图体验，支持多级缩放与平滑过渡 |
| **精准地理定位** | 一键获取当前位置，或通过地图选点精确定位目标区域 |
| **动态标记系统** | 8 种精心设计的分类图标，根据缩放级别自适应大小 |
| **个性化标识** | 用户的打卡以金色边框高亮显示，一眼识别自己的足迹 |
| **地理围栏** | 验证用户打卡位置的真实性，确保内容可信 |
| **逆地理编码** | 自动将坐标转换为详细地址，简化打卡流程 |

### 👤 用户系统

| 功能 | 描述 |
|:---|:---|
| **安全认证** | JWT Token 认证 + Bcrypt 密码加密，保障账户安全 |
| **个人资料** | 可自定义昵称、性别、个人简介、邮箱、手机，展示独特的个人形象 |
| **用户空间** | 查看他人主页，了解 TA 的打卡足迹和获得的认可 |
| **影响力数据** | 打卡统计、获赞总数，量化你的内容影响力 |
| **用户搜索** | 支持关键词搜索用户，快速找到感兴趣的人 |
| **密码管理** | 支持在线修改密码，保障账户安全 |

### 📝 内容系统

| 功能 | 描述 |
|:---|:---|
| **多维度分类** | 日常·美食·住宿·购物·景点·交通·娱乐·工作，8 大场景全覆盖 |
| **图文表达** | 标题 + 内容 + 位置的三维信息表达，完整记录每一刻 |
| **内容管理** | 支持编辑与删除，内容完全由你掌控 |
| **帖子列表** | 支持筛选、搜索、分页，快速找到感兴趣的内容 |
| **智能筛选** | 按类型筛选、按标签页切换（全部/我的/喜欢） |

### 🏆 创新的内容竞争机制

```
┌─────────────────────────────────────────────────────────┐
│                    最佳评论 PK 系统                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│    📍 帖子点赞数    ⚔️    💬 最高赞评论点赞数            │
│                           ↓                             │
│              点赞数更高者 → 🏆 最佳内容                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**PK 规则：**
- 同一帖子下，点赞数最高的评论与帖子本身进行 PK
- 点赞数更高者获得"🏆 最佳内容"标识
- 随点赞数变化实时更新 PK 结果

### 💬 实时消息系统

| 功能 | 描述 |
|:---|:---|
| **WebSocket 通信** | 基于 WebSocket 的全双工通信，消息毫秒级触达 |
| **会话管理** | 自动创建/管理会话，支持查看历史消息 |
| **双重保障** | WebSocket + HTTP 轮询（2 秒/次）确保消息不丢失 |
| **未读提醒** | 实时显示未读消息数量，不错过任何一条消息 |
| **智能去重** | 消息合并时自动去重，避免重复显示 |
| **帖子关联** | 消息可关联帖子，方便讨论特定内容 |

### 🤖 AI 智能助手

| 功能 | 描述 |
|:---|:---|
| **地点智能分析** | 基于阿里云百炼 Qwen 模型，自动分析地点特色和游玩建议 |
| **文字内容解析** | 选中文字即可触发 AI 分析，获取详细信息 |
| **阿尼亚聊天** | 与《间谍过家家》阿尼亚角色互动，支持专业问题解答 |
| **智能推荐** | 根据用户位置和偏好，推荐热门打卡点 |
| **聊天记录** | 保存历史对话，随时回顾 |

### ❤️ 互动体系

| 互动类型 | 描述 |
|:---|:---|
| **帖子点赞** | 对优质内容表达认可 |
| **评论发表** | 分享你的观点和体验 |
| **评论回复** | 与其他用户深度交流（支持@功能） |
| **评论点赞** | 让有价值的评论脱颖而出 |
| **私信聊天** | 与感兴趣的用户实时交流 |
| **用户关注** | 查看用户帖子列表和空间 |

### 📊 访客统计

| 功能 | 描述 |
|:---|:---|
| **访问记录** | 记录每次访问的 IP、路径、方法、来源 |
| **实时访客** | 查看当前在线用户数量 |
| **统计分析** | 按时间维度统计访问量趋势 |
| **用户追踪** | 区分登录用户和游客访问 |

---

## 🏗️ 技术架构

### 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  React 18 + Leaflet + WebSocket Client + AI Components      │
│  • 响应式 UI • 地图渲染 • 实时消息接收 • AI 交互              │
└─────────────────────────────────────────────────────────────┘
                              │ HTTP / WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        API Gateway                           │
│  Nginx Reverse Proxy                                        │
│  • 静态资源服务 • API 代理 • WebSocket 代理 • SSL 终止          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend Layer                         │
│  Go 1.21+ + Gin + GORM + Gorilla WebSocket + AI SDK         │
│  • RESTful API • JWT 认证 • WebSocket Hub • 消息推送          │
│  • AI 分析服务 • 访客统计 • 聊天机器人                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  MySQL 8.0                                                  │
│  • 用户数据 • 帖子内容 • 评论互动 • 点赞关系 • 消息 • 聊天记录  │
│  • 访客记录 • 打卡点数据 • 评论数据                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        AI Services                           │
│  阿里云百炼 (Qwen-Turbo / Qwen3-Coder-Plus)                 │
│  • 地点分析 • 内容生成 • 智能对话 • 推荐系统                 │
└─────────────────────────────────────────────────────────────┘
```

### WebSocket 通信架构

```
┌──────────────┐     WebSocket      ┌──────────────┐
│   Client A   │◄──────────────────►│              │
└──────────────┘                    │              │
                                    │   WebSocket  │
┌──────────────┐     WebSocket      │     Hub      │
│   Client B   │◄──────────────────►│              │
└──────────────┘                    │              │
                                    │  ┌───────┐   │
┌──────────────┐     WebSocket      │  │ Users │   │
│   Client C   │◄──────────────────►│  │ Map   │   │
└──────────────┘                    │  └───────┘   │
                                    │              │
                                    └──────────────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │    MySQL     │
                                    │  (消息持久化) │
                                    └──────────────┘
```

### 消息保障机制

```
┌─────────────────────────────────────────────────────────┐
│                  双重消息保障机制                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   主通道：WebSocket 实时推送 ←───────────────→ 毫秒级触达  │
│                                                         │
│   备用通道：HTTP 轮询（2 秒/次）←────────────→ 确保不丢失   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### AI 服务架构

```
┌──────────────┐      HTTP POST       ┌──────────────────┐
│   TapSpot    │─────────────────────►│  阿里云百炼 API   │
│   Backend    │  { message, lat, lng }│  Qwen 模型        │
└──────────────┘                      └──────────────────┘
        ▲                                       │
        │                                       │
        │         { reply, recommendations }    │
        └───────────────────────────────────────┘
```

### 技术栈

#### Frontend

| 技术 | 版本 | 用途 |
|:---|:---|:---|
| **React** | 18+ | UI 框架 |
| **Leaflet** | 1.9+ | 地图渲染 |
| **Lucide React** | latest | 图标库 |
| **WebSocket API** | Native | 实时通讯 |
| **Fetch API** | Native | HTTP 请求 |

#### Backend

| 技术 | 版本 | 用途 |
|:---|:---|:---|
| **Go** | 1.21+ | 高性能编程语言 |
| **Gin** | latest | 轻量级 Web 框架 |
| **GORM** | latest | ORM 库 |
| **jwt-go** | v5 | JWT 认证 |
| **bcrypt** | latest | 密码加密 |
| **Gorilla WebSocket** | latest | WebSocket 支持 |
| **godotenv** | latest | 环境变量管理 |
| **gin-contrib/cors** | latest | CORS 中间件 |

#### Infrastructure

| 技术 | 用途 |
|:---|:---|
| **Nginx** | 反向代理、静态资源服务、WebSocket 代理 |
| **Systemd** | 服务管理、自动重启 |
| **Git** | 版本控制与协作 |
| **MySQL** | 关系型数据库 |
| **阿里云百炼** | AI 模型服务（Qwen） |

### 安全特性

| 特性 | 描述 |
|:---|:---|
| **密码加密** | Bcrypt 加密存储，防止泄露 |
| **Token 认证** | JWT Token 验证，无状态认证 |
| **请求校验** | 所有 API 请求进行身份验证 |
| **数据隔离** | 用户只能操作自己的数据 |
| **访客记录** | 记录访问 IP 和行为，便于审计 |
| **注册 IP** | 记录用户注册时的 IP 地址 |

### 性能优化

| 优化项 | 描述 |
|:---|:---|
| **动态加载** | 地图标记根据视野范围动态加载 |
| **分页查询** | 大数据列表采用分页加载 |
| **连接复用** | WebSocket 长连接减少握手开销 |
| **索引优化** | 数据库关键字段建立索引 |
| **缓存策略** | AI 分析结果可缓存，减少 API 调用 |
| **去重机制** | 消息和评论自动去重 |

---

## 📁 项目结构

```
TapSpot/
├── 📂 backend/                    # 后端服务 (Go)
│   ├── 📄 main.go                    # 应用入口
│   ├── 📄 go.mod                     # Go 模块配置
│   ├── 📄 go.sum                     # 依赖锁定
│   ├── 📂 config/                    # 配置文件
│   │   └── 📄 database.go               # 数据库配置
│   ├── 📂 controllers/               # 控制器
│   │   ├── 📄 auth_controller.go        # 认证相关
│   │   ├── 📄 post.go                   # 帖子相关
│   │   ├── 📄 comment.go                # 评论相关
│   │   ├── 📄 like.go                   # 点赞相关
│   │   ├── 📄 user.go                   # 用户相关
│   │   ├── 📄 message.go                # 消息相关
│   │   ├── 📄 websocket.go              # WebSocket 处理
│   │   ├── 📄 ai.go                     # AI 分析服务
│   │   ├── 📄 chat.go                   # 阿尼亚聊天
│   │   ├── 📄 stats.go                  # 访客统计
│   │   ├── 📄 poi.go                    # 地理服务
│   │   ├── 📄 spot.go                   # 打卡点管理
│   │   ├── 📄 review.go                 # 评论管理
│   │   └── 📄 utils.go                  # 工具函数
│   ├── 📂 models/                    # 数据模型
│   │   └── 📄 models.go                 # GORM 模型定义
│   ├── 📂 routes/                    # 路由定义
│   │   └── 📄 routes.go                 # API 路由
│   ├── 📂 websocket/                 # WebSocket
│   │   └── 📄 chat.go                   # 聊天 Hub 实现
│   ├── 📂 middleware/                # 中间件
│   │   ├── 📄 auth_middleware.go        # 认证中间件
│   │   └── 📄 visit_logger.go           # 访客记录中间件
│   ├── 📂 services/                  # 服务层
│   │   └── 📄 auth_service.go           # 认证服务
│   └── 📂 dto/                       # 数据传输对象
│       └── 📄 auth_dto.go               # 认证 DTO
│
├── 📂 frontend/                   # 前端应用 (React)
│   ├── 📂 src/                       # 源代码
│   │   ├── 📄 App.jsx                  # 主应用组件
│   │   ├── 📂 components/              # 组件
│   │   │   ├── 📄 Chat/                  # 聊天相关
│   │   │   │   ├── 📄 MessageCenter.jsx   # 消息中心
│   │   │   │   └── 📄 Chat.jsx            # 聊天组件
│   │   │   ├── 📄 Map/                   # 地图相关
│   │   │   │   └── 📄 MapIcon.js          # 地图图标
│   │   │   ├── 📄 AIAssistant.jsx         # AI 分析助手
│   │   │   ├── 📄 TextSelectionAI.jsx     # 文字选择 AI
│   │   │   └── 📄 AnyaChat.jsx            # 阿尼亚聊天
│   │   ├── 📂 utils/                   # 工具函数
│   │   │   ├── 📄 api.js                  # API 请求封装
│   │   │   ├── 📄 constants.js            # 常量定义
│   │   │   └── 📄 helpers.js              # 辅助函数
│   │   └── 📂 styles/                  # 样式文件
│   │       └── 📄 modern.css              # 现代样式
│   └── 📂 dist/                      # 构建输出
│       └── 📂 assets/                   # 静态资源
│
├── 📂 database/                   # 数据库脚本
├── 📂 nginx/                      # Nginx 配置
│   └── 📄 nginx.conf
│
├── 📄 docker-compose.yml          # Docker 编排
├── 📄 Dockerfile                   # 后端 Docker 镜像
├── 📄 Dockerfile.frontend          # 前端 Docker 镜像
├── 📄 .dockerignore                # Docker 忽略文件
├── 📄 deploy.sh                   # 部署脚本
├── 📄 start.sh                    # 启动脚本
├── 📄 .gitignore                  # Git 忽略文件
├── 📄 README.md                   # 项目说明
├── 📄 CONTRIBUTING.md             # 贡献指南
├── 📄 UPLOAD_GUIDE.md             # 上传指南
└── 📄 AGENTS.md                   # Agent 配置
```

---

## 📖 API 文档

### 🔐 用户认证

| 方法 | 路径 | 描述 | 认证 |
|:---|:---|:---|:---|
| POST | `/api/register` | 用户注册 | ❌ |
| POST | `/api/login` | 用户登录 | ❌ |
| GET | `/api/me` | 获取当前用户信息 | ✅ |
| PUT | `/api/me` | 更新用户资料 | ✅ |
| POST | `/api/change-password` | 修改密码 | ✅ |
| GET | `/api/users/:id` | 获取用户公开信息 | ✅ |
| GET | `/api/users/:id/posts` | 获取用户的帖子 | ✅ |
| GET | `/api/users/stats` | 获取用户统计 | ✅ |
| GET | `/api/users/search` | 搜索用户 | ❌ |

### 📝 帖子管理

| 方法 | 路径 | 描述 | 认证 |
|:---|:---|:---|:---|
| GET | `/api/posts` | 获取帖子列表（支持筛选和搜索） | ❌ |
| GET | `/api/posts/:id` | 获取帖子详情 | ❌ |
| POST | `/api/posts` | 创建帖子 | ✅ |
| DELETE | `/api/posts/:id` | 删除帖子 | ✅ |
| POST | `/api/posts/:id/like` | 点赞/取消点赞 | ✅ |
| GET | `/api/likes/check` | 检查点赞状态 | ✅ |
| GET | `/api/likes/my` | 获取我的点赞列表 | ✅ |

### 💬 评论互动

| 方法 | 路径 | 描述 | 认证 |
|:---|:---|:---|:---|
| GET | `/api/posts/:id/comments` | 获取评论列表 | ❌ |
| POST | `/api/posts/:id/comments` | 发表评论 | ✅ |
| DELETE | `/api/comments/:id` | 删除评论 | ✅ |
| POST | `/api/comments/:id/like` | 评论点赞/取消 | ✅ |
| GET | `/api/comments/likes/check` | 检查评论点赞状态 | ✅ |
| GET | `/api/posts/:id/best-comment` | 获取最佳评论 (PK 结果) | ❌ |
| GET | `/api/posts/comments/count` | 批量获取评论数 | ❌ |

### 💬 消息系统

| 方法 | 路径 | 描述 | 认证 |
|:---|:---|:---|:---|
| GET | `/api/conversations` | 获取会话列表 | ✅ |
| GET | `/api/conversations/with` | 获取或创建与某用户的会话 | ✅ |
| POST | `/api/conversations/:id/read` | 标记会话已读 | ✅ |
| GET | `/api/conversations/:id/messages` | 获取会话消息 | ✅ |
| POST | `/api/messages` | 发送消息 | ✅ |
| GET | `/api/messages/unread` | 获取未读消息数 | ✅ |

### 🤖 AI 服务

| 方法 | 路径 | 描述 | 认证 |
|:---|:---|:---|:---|
| POST | `/api/ai/analyze` | AI 分析地点或文字 | ❌ |
| POST | `/api/chat` | 与阿尼亚聊天 | ❌ |
| GET | `/api/chat/history/:user_id` | 获取聊天历史 | ✅ |

### 📊 访客统计

| 方法 | 路径 | 描述 | 认证 |
|:---|:---|:---|:---|
| GET | `/api/stats/visits` | 获取访问统计 | ✅ |
| GET | `/api/stats/realtime` | 获取实时访客 | ✅ |

### 📍 地理服务

| 方法 | 路径 | 描述 | 认证 |
|:---|:---|:---|:---|
| GET | `/api/pois` | 搜索附近兴趣点 | ❌ |
| GET | `/api/geocode/reverse` | 逆地理编码（坐标转地址） | ❌ |

### 🔌 WebSocket

**连接地址：** `ws://your-domain/api/ws?token=YOUR_JWT_TOKEN`

**消息格式：**

```javascript
// 发送消息
ws.send(JSON.stringify({
  type: 'chat',
  conversation_id: 1,
  sender_id: 1,
  receiver_id: 2,
  content: 'Hello!',
  created_at: new Date().toISOString()
}));

// 接收消息
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  console.log('收到消息:', msg);
};
```

---

## 📊 数据模型

### ER Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │       │    posts     │       │   comments   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │───┐   │ id (PK)      │───┐   │ id (PK)      │
│ username     │   │   │ user_id (FK) │◄──┘   │ post_id (FK) │◄──┐
│ password     │   │   │ title        │       │ user_id (FK) │◄──┼──┐
│ nickname     │   │   │ content      │       │ content      │   │  │
│ avatar       │   │   │ type         │       │ reply_to_id  │   │  │
│ gender       │   │   │ location     │       │ reply_to_user│   │  │
│ bio          │   │   │ latitude     │       │ created_at   │   │  │
│ email        │   │   │ longitude    │       └──────────────┘   │  │
│ phone        │   │   │ created_at   │                          │  │
│ registration_ip│ │   └──────────────┘                          │  │
│ created_at   │   │         ▲                                   │  │
└──────────────┘   │         │                                   │  │
       ▲           │         │                                   │  │
       │           │         │                                   │  │
┌──────────────┐   │         │         ┌──────────────┐         │  │
│    likes     │   │         │         │comment_likes │         │  │
├──────────────┤   │         │         ├──────────────┤         │  │
│ id (PK)      │   │         │         │ id (PK)      │         │  │
│ user_id (FK) │───┘         │         │ user_id (FK) │─────────┘  │
│ post_id (FK) │─────────────┘         │ comment_id   │◄───────────┘
│ created_at   │                       │ created_at   │
└──────────────┘                       └──────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   messages   │       │conversations │       │   visits     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ sender_id    │───────│ user_id (FK) │       │ ip_address   │
│ receiver_id  │       │ peer_id (FK) │       │ user_agent   │
│ content      │       │ last_message │       │ path         │
│ post_id      │       │ last_msg_time│       │ method       │
│ is_read      │       │ unread_count │       │ user_id (FK) │
│ created_at   │       │ created_at   │       │ referer      │
└──────────────┘       └──────────────┘       │ created_at   │
                                               └──────────────┘

┌──────────────┐       ┌──────────────┐
│  chat_message│       │    spots     │
├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │
│ user_id (FK) │       │ name         │
│ role         │       │ description  │
│ content      │       │ latitude     │
│ created_at   │       │ longitude    │
└──────────────┘       │ ...          │
                       └──────────────┘
```

### 核心数据表

| 表名 | 说明 | 主要字段 |
|:---|:---|:---|
| `users` | 用户表 | id, username, nickname, avatar, gender, bio, email, phone, registration_ip |
| `posts` | 帖子表 | id, user_id, title, content, type, location_name, latitude, longitude |
| `comments` | 评论表 | id, post_id, user_id, content, reply_to_id, reply_to_user |
| `likes` | 帖子点赞表 | id, user_id, post_id |
| `comment_likes` | 评论点赞表 | id, user_id, comment_id |
| `conversations` | 会话表 | id, user_id, peer_id, last_message, last_msg_time, unread_count |
| `messages` | 消息表 | id, sender_id, receiver_id, content, post_id, is_read |
| `visits` | 访客记录表 | id, ip_address, user_agent, path, method, user_id, referer |
| `chat_messages` | 聊天记录表 | id, user_id, role, content |
| `spots` | 打卡点表 | id, name, description, latitude, longitude, category, rating |
| `reviews` | 打卡点评论表 | id, spot_id, author, content, rating, images, likes |

---

## 🚀 快速部署

### 环境要求

| 依赖 | 版本要求 | 说明 |
|:---|:---|:---|
| Go | ≥ 1.21 | 后端运行环境 |
| Node.js | ≥ 18.0 | 前端构建环境 |
| MySQL | ≥ 8.0 | 数据库 |
| Nginx | ≥ 1.20 | 反向代理 |
| 阿里云百炼 API Key | 可选 | AI 功能需要 |

### 方式一：完整部署（推荐）

#### 1️⃣ 克隆项目

```bash
git clone -b main https://github.com/codedancewth/TapSpot.git
cd TapSpot
```

#### 2️⃣ 配置数据库

```sql
-- 创建数据库
CREATE DATABASE tapspot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户（可选）
CREATE USER 'tapspot'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON tapspot.* TO 'tapspot'@'localhost';
FLUSH PRIVILEGES;
```

#### 3️⃣ 配置后端

```bash
cd backend

# 下载依赖
go mod download

# 修改数据库配置
# 编辑 config/database.go，更新数据库连接信息

# 配置 AI API Key（可选）
export AI_API_KEY="your-alibaba-cloud-api-key"
```

#### 4️⃣ 构建并运行后端

```bash
# 编译
go build -o tapspot .

# 方式 A：直接运行
./tapspot

# 方式 B：使用 systemd 管理（推荐）
sudo cp tapspot.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable tapspot
sudo systemctl start tapspot
```

#### 5️⃣ 构建前端

```bash
cd ../frontend

# 安装依赖
npm install

# 构建
npm run build

# 部署到 Nginx 目录
sudo cp -r dist/* /var/www/tapspot/
```

#### 6️⃣ 配置 Nginx

```nginx
# /etc/nginx/conf.d/tapspot.conf

server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或 IP

    # 前端静态文件
    root /var/www/tapspot;
    index index.html;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # WebSocket 代理
    location /api/ws {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# 测试配置
sudo nginx -t

# 重载配置
sudo systemctl reload nginx
```

### 方式二：快速启动（开发环境）

```bash
# 后端
cd backend
go run main.go

# 前端（另一个终端）
cd frontend
npm run dev
```

### 验证部署

```bash
# 检查后端健康状态
curl http://localhost:8080/api/health

# 预期响应
{"status":"ok","time":"2026-02-23T..."}
```

---

## 📈 开发路线

### ✅ 已完成

- [x] 用户注册登录系统
- [x] 地图打卡与标记
- [x] 帖子发布与管理
- [x] 评论与回复功能
- [x] 点赞系统（帖子 + 评论）
- [x] 最佳评论 PK 机制
- [x] 用户资料编辑
- [x] 用户空间展示
- [x] 💬 实时聊天系统（WebSocket）
- [x] 消息轮询机制
- [x] 未读消息提醒
- [x] 🤖 AI 地点分析
- [x] 🤖 阿尼亚聊天机器人
- [x] 📊 访客统计系统
- [x] 用户搜索功能
- [x] 密码修改功能
- [x] 聊天记录保存

### 🚧 进行中

- [ ] 图片上传功能
- [ ] 消息推送通知
- [ ] AI 推荐优化

### 📅 计划中

- [ ] 关注/粉丝系统
- [ ] 地点收藏夹
- [ ] 热门地点推荐算法
- [ ] 微信小程序版本
- [ ] AI 智能内容审核
- [ ] 多语言支持

---

## 🔧 常见问题

### Q: WebSocket 连接失败？

确保 Nginx 正确配置了 WebSocket 代理：

```nginx
location /api/ws {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 86400;
}
```

### Q: 消息发送后没有实时显示？

系统采用双重保障机制：
1. WebSocket 实时推送
2. HTTP 轮询（每 2 秒）作为备用

如果 WebSocket 断开，轮询机制会自动接管。

### Q: 如何修改数据库配置？

编辑 `backend/config/database.go` 文件：

```go
dsn := "user:password@tcp(127.0.0.1:3306)/tapspot?charset=utf8mb4&parseTime=True&loc=Local"
```

### Q: AI 功能如何使用？

1. 注册阿里云百炼账号
2. 获取 API Key
3. 设置环境变量：`export AI_API_KEY="your-api-key"`
4. 重启后端服务

未配置 API Key 时，AI 功能会返回模拟数据。

### Q: 如何查看访客统计？

访问统计 API 需要认证：

```bash
# 获取访问统计
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8080/api/stats/visits

# 获取实时访客
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8080/api/stats/realtime
```

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. **Fork** 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 **Pull Request**

### 开发规范

- 遵循 Go 和 React 代码规范
- 提交信息使用英文或中文，清晰描述变更
- 新功能需要包含测试用例
- 更新文档说明新功能的用法

---

## 📄 开源协议

本项目基于 **MIT License** 开源协议。

---

## 📞 联系我们

- **GitHub**: [https://github.com/codedancewth/TapSpot](https://github.com/codedancewth/TapSpot)
- **Issues**: [提交问题](https://github.com/codedancewth/TapSpot/issues)
- **Email**: contact@tapspot.dev (示例)

---

## 🙏 致谢

感谢以下开源项目：

- [React](https://react.dev/) - UI 框架
- [Leaflet](https://leafletjs.com/) - 地图库
- [Gin](https://gin-gonic.com/) - Go Web 框架
- [GORM](https://gorm.io/) - Go ORM 库
- [阿里云百炼](https://bailian.console.aliyun.com/) - AI 模型服务
- [Lucide Icons](https://lucide.dev/) - 图标库

---

<p align="center">
  <i>Made with ❤️ by TapSpot Team</i>
</p>

<p align="center">
  <b>⭐ 如果这个项目对你有帮助，请给我们一个 Star！</b>
</p>
