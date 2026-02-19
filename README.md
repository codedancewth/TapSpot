<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql" alt="MySQL">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

<h1 align="center">📍 TapSpot</h1>
<h3 align="center">基于地理围栏的智能社交打卡平台</h3>

<p align="center">
  <i>Discover • Share • Connect</i>
</p>

<p align="center">
  <a href="#-核心特性">核心特性</a> •
  <a href="#-技术架构">技术架构</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-api-文档">API 文档</a> •
  <a href="#-贡献指南">贡献指南</a>
</p>

---

## 🎯 项目愿景

**TapSpot** 重新定义了基于位置的社会化体验。我们相信，每一个地点都有其独特的故事，每一次打卡都值得被记住。通过创新的**内容竞争机制**，让优质内容自然浮现，为用户提供最有价值的信息。

### 核心理念

> *"在同一时空坐标下，让最有价值的声音被听见"*

---

## ✨ 核心特性

### 🗺️ 沉浸式地图体验

| 特性 | 描述 |
|:---:|:---|
| **智能地图交互** | 基于高德/OpenStreetMap的流畅地图体验，支持多级缩放与平滑过渡 |
| **精准地理定位** | 一键获取当前位置，或通过地图选点精确定位目标区域 |
| **动态标记系统** | 8种精心设计的分类图标，根据缩放级别自适应大小，悬停时光晕流转 |
| **个性化标识** | 用户的打卡以金色边框高亮显示，一眼识别自己的足迹 |

### 👤 完整的用户生态

| 特性 | 描述 |
|:---:|:---|
| **安全认证体系** | JWT Token 认证 + Bcrypt 密码加密，保障账户安全 |
| **个人空间** | 可自定义昵称、性别、个人简介，展示独特的个人形象 |
| **社交名片** | 查看他人主页，了解TA的打卡足迹和获得的认可 |
| **数据分析** | 打卡统计、获赞总数，量化你的影响力 |

### 📝 丰富的内容表达

| 特性 | 描述 |
|:---:|:---|
| **多维度分类** | 日常·美食·住宿·购物·景点·交通·娱乐·工作，8大场景全覆盖 |
| **图文结合** | 标题+内容+位置的三维信息表达，完整记录每一刻 |
| **内容管理** | 支持编辑与删除，内容完全由你掌控 |

### 🏆 创新的内容竞争机制

这是 TapSpot 最具创新性的核心功能：

```
┌─────────────────────────────────────────────────────────┐
│                    最佳评论 PK 系统                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│    📍 帖子点赞数    ⚔️    💬 最高赞评论点赞数            │
│                           ↓                             │
│              点赞数更高者 → 🏆 最佳内容                   │
│                                                         │
│    核心理念：帖子和评论都是"内容"，让用户决定谁更有价值    │
└─────────────────────────────────────────────────────────┘
```

**展示规则：**
- 帖子详情页顶部显著展示"最佳评论"区域
- 金色渐变背景 + 奖杯图标，突出PK胜出者
- 实时显示PK结果与获胜原因

### ❤️ 立体的互动体系

| 互动类型 | 描述 |
|:---:|:---|
| **帖子点赞** | 对优质内容表达认可 |
| **评论发表** | 分享你的观点和体验 |
| **评论回复** | 与其他用户深度交流 |
| **评论点赞** | 让有价值的评论脱颖而出 |

---

## 🏗️ 技术架构

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  React 18 + Vite + Leaflet + Lucide Icons           │   │
│  │  • 响应式设计 • 组件化架构 • 状态管理 • 路由控制      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        API Gateway                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Nginx Reverse Proxy + Load Balancing               │   │
│  │  • 静态资源服务 • API代理 • SSL终止 • 缓存优化       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend Layer                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Node.js + Express + MySQL2                         │   │
│  │  • RESTful API • JWT认证 • 连接池 • 中间件链         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  MySQL 8.0                                          │   │
│  │  • 用户数据 • 帖子内容 • 评论互动 • 点赞关系          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈详解

#### Frontend Technologies

| 技术 | 版本 | 用途 |
|:---|:---:|:---|
| **React** | 18.x | 声明式UI框架，组件化开发 |
| **Vite** | 5.x | 下一代前端构建工具，极速HMR |
| **Leaflet** | 1.9.x | 轻量级开源地图库 |
| **react-leaflet** | 4.x | React地图组件封装 |
| **Lucide React** | latest | 精美的开源图标库 |
| **Axios** | 1.x | Promise based HTTP客户端 |

#### Backend Technologies

| 技术 | 版本 | 用途 |
|:---|:---:|:---|
| **Node.js** | 18+ | JavaScript运行时 |
| **Express** | 4.x | 极简Web框架 |
| **MySQL2** | 3.x | MySQL客户端（支持Promise） |
| **bcryptjs** | 2.x | 密码哈希加密 |
| **jsonwebtoken** | 9.x | JWT认证令牌 |
| **cors** | 2.x | 跨域资源共享 |

#### DevOps & Infrastructure

| 技术 | 用途 |
|:---|:---|
| **Nginx** | 反向代理、静态资源服务、负载均衡 |
| **Git** | 版本控制与协作 |
| **PM2** | 进程管理（生产环境推荐） |

---

## 📁 项目结构

```
TapSpot/
├── 📂 backend/                    # 后端服务
│   ├── 📄 index.js                   # Express应用入口
│   ├── 📄 package.json               # 依赖配置
│   └── 📂 node_modules/              # 依赖包
│
├── 📂 frontend/                   # 前端应用
│   ├── 📂 src/                       # 源代码
│   │   ├── 📄 App.jsx                   # 主应用组件
│   │   └── 📂 styles/                   # 样式文件
│   ├── 📂 dist/                      # 构建产物
│   ├── 📄 vite.config.js             # Vite配置
│   └── 📄 package.json               # 依赖配置
│
├── 📂 docs/                       # 项目文档
│   ├── 📄 location-best-comment-feature.md  # 需求文档
│   └── 📄 tapspot-公众号文章.md              # 宣传文章
│
├── 📂 database/                   # 数据库脚本
│
├── 📄 start.sh                    # 启动脚本
├── 📄 deploy.sh                   # 部署脚本
├── 📄 README.md                   # 项目说明
└── 📄 LICENSE                     # 开源协议
```

---

## 🚀 快速开始

### 环境要求

| 依赖 | 版本要求 |
|:---|:---:|
| Node.js | ≥ 18.0.0 |
| MySQL | ≥ 8.0 |
| npm / yarn | latest |

### 安装步骤

```bash
# 1️⃣ 克隆项目
git clone https://github.com/codedancewth/TapSpot.git
cd TapSpot

# 2️⃣ 安装后端依赖
cd backend
npm install

# 3️⃣ 配置数据库
# 创建MySQL数据库: CREATE DATABASE tapspot;
# 修改 index.js 中的数据库连接配置

# 4️⃣ 启动后端服务 (端口 3002)
node index.js

# 5️⃣ 安装前端依赖
cd ../frontend
npm install

# 6️⃣ 启动前端服务 (端口 3000)
npm run dev
```

### 访问应用

| 服务 | 地址 |
|:---|:---|
| 前端应用 | http://localhost:3000 |
| 后端API | http://localhost:3002/api |
| 测试账号 | root / root |

---

## 📖 API 文档

### 🔐 用户认证

```http
POST /api/register     # 用户注册
POST /api/login        # 用户登录
GET  /api/me           # 获取当前用户信息
PUT  /api/me           # 更新用户资料
GET  /api/users/:id    # 获取用户公开信息
```

### 📝 帖子管理

```http
GET    /api/posts           # 获取帖子列表
GET    /api/posts/:id       # 获取帖子详情
POST   /api/posts           # 创建帖子
DELETE /api/posts/:id       # 删除帖子
POST   /api/posts/:id/like  # 点赞/取消点赞
```

### 💬 评论互动

```http
GET    /api/posts/:id/comments     # 获取评论列表
POST   /api/posts/:id/comments     # 发表评论
DELETE /api/comments/:id           # 删除评论
POST   /api/comments/:id/like      # 评论点赞/取消
```

### 🏆 最佳评论

```http
GET /api/posts/:id/best-comment     # 获取最佳评论(PK结果)
GET /api/nearby/best-comments       # 附近最佳评论(按位置聚合)
```

### 📍 地理服务

```http
GET /api/pois               # 搜索附近兴趣点
GET /api/geocode/reverse    # 逆地理编码
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
│ gender       │   │   │ location     │       │ created_at   │   │  │
│ bio          │   │   │ latitude     │       └──────────────┘   │  │
│ created_at   │   │   │ longitude    │                          │  │
└──────────────┘   │   │ created_at   │                          │  │
       ▲           │   └──────────────┘                          │  │
       │           │         ▲                                   │  │
       │           │         │                                   │  │
┌──────────────┐   │         │         ┌──────────────┐         │  │
│    likes     │   │         │         │comment_likes │         │  │
├──────────────┤   │         │         ├──────────────┤         │  │
│ id (PK)      │   │         │         │ id (PK)      │         │  │
│ user_id (FK) │───┘         │         │ user_id (FK) │─────────┘  │
│ post_id (FK) │─────────────┘         │ comment_id   │◄───────────┘
│ created_at   │                       │ created_at   │
└──────────────┘                       └──────────────┘
```

---

## 🎨 设计亮点

### 1. 内容竞争机制

首创的"最佳评论PK"系统，打破传统的内容层级关系，让帖子和评论在同一维度竞争。用户用点赞投票，最有价值的内容自然浮现。

### 2. 视觉体验

- **8种精心设计的图标**：每种打卡类型都有独特的SVG图标
- **动态响应式标记**：根据地图缩放级别自动调整大小
- **光晕悬停效果**：鼠标悬停时标记发光，增强交互反馈
- **金色标识系统**：用户的打卡以金色边框突出显示

### 3. 地理聚合算法

基于经纬度的智能聚合，在指定半径范围内自动计算"最佳内容"，为用户提供该地点最有价值的信息。

### 4. 安全架构

- **JWT Token认证**：无状态认证，支持分布式部署
- **Bcrypt密码加密**：10轮salt，防止彩虹表攻击
- **输入校验**：前后端双重验证，防止注入攻击

---

## 📈 开发路线

### ✅ 已完成

- [x] 用户注册登录系统
- [x] 地图打卡与标记
- [x] 帖子发布与管理
- [x] 评论与回复功能
- [x] 点赞系统（帖子+评论）
- [x] 最佳评论PK机制
- [x] 用户资料编辑
- [x] 用户空间展示

### 🚧 进行中

- [ ] 图片上传功能
- [ ] 消息通知系统

### 📅 计划中

- [ ] 私信功能
- [ ] 关注/粉丝系统
- [ ] 地点收藏夹
- [ ] 热门地点推荐算法
- [ ] 微信小程序版本
- [ ] AI智能内容审核

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. **Fork** 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 **Pull Request**

### 代码规范

- 遵循 ESLint 规则
- 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)
- 保持代码简洁，添加必要注释

---

## 📄 开源协议

本项目基于 **MIT License** 开源协议。

```
MIT License

Copyright (c) 2026 TapSpot Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 📞 联系我们

- **微信**: wutianh4099
- **GitHub**: [https://github.com/codedancewth/TapSpot](https://github.com/codedancewth/TapSpot)
- **Issues**: [提交问题](https://github.com/codedancewth/TapSpot/issues)

---

<p align="center">
  <i>Made with ❤️ by TapSpot Team</i>
</p>

<p align="center">
  <b>⭐ 如果这个项目对你有帮助，请给我们一个 Star！</b>
</p>
