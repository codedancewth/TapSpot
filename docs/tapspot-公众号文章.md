# TapSpot - 基于地图的社交打卡应用

> 一款让用户可以在地图上发布帖子、分享地点、互动评论的社交应用

---

## 📌 项目简介

**TapSpot** 是一个基于地图的社交打卡应用，用户可以在任意地点发布打卡内容，分享自己的发现和体验。其他用户可以查看、点赞、评论，形成基于地理位置的社交互动。

### 核心理念

> **"在同一地点，用户只关心最有价值的评价"**

我们设计了独特的**最佳评论PK机制**：帖子和评论都可以被点赞，点赞数最高的内容将成为该地点的"最佳评论"，优先展示给用户。

---

## ✨ 功能特性

### 🗺️ 地图交互

| 功能 | 说明 |
|------|------|
| 交互式地图 | 高德/OpenStreetMap地图，支持缩放、拖动 |
| 点击打卡 | 点击地图任意位置即可发帖 |
| 地图选点 | 发布时可选择"获取我的位置"或"地图选点" |
| 标记分类 | 8种帖子类型，不同颜色和图标区分 |

### 👤 用户系统

| 功能 | 说明 |
|------|------|
| 注册登录 | 支持用户名密码注册登录 |
| 个人资料 | 可编辑昵称、性别、个人简介 |
| 用户空间 | 查看他人主页、打卡记录、获赞数 |
| 测试账号 | root / root |

### 📝 帖子功能

| 功能 | 说明 |
|------|------|
| 多类型打卡 | 日常、美食、住宿、购物、景点、交通、娱乐、工作 |
| 位置信息 | 自动获取或手动选择地点 |
| 我的帖子 | 金色边框高亮显示自己的打卡 |
| 删除管理 | 可删除自己发布的帖子 |

### ❤️ 互动功能

| 功能 | 说明 |
|------|------|
| 帖子点赞 | 为喜欢的帖子点赞 |
| 评论功能 | 发表评论，支持回复他人 |
| 评论点赞 | 为评论点赞 |
| 最佳评论PK | 帖子点赞 vs 评论点赞，胜出者展示 |

### 🏆 最佳评论PK机制

**核心逻辑：**

```
同一地点的帖子点赞数  VS  该帖子下最高赞评论的点赞数
                ↓
         点赞数更高者 → 最佳评论
```

**展示规则：**
- 帖子详情页顶部显示"最佳评论"区域
- 金色背景突出展示PK胜出者
- 显示PK结果（帖子胜出/评论胜出）

---

## 🏗️ 项目结构

```
TapSpot/
├── backend/              # Go 后端
│   ├── main.go               # Go服务器入口
│   ├── go.mod                # Go模块配置
│   ├── config/               # 配置文件
│   ├── controllers/          # 控制器
│   ├── models/               # 数据模型
│   └── routes/               # 路由定义
├── docs/                 # 文档
│   ├── location-best-comment-feature.md  # 最佳评论需求文档
│   └── tapspot-公众号文章.md              # 本文档
├── database/             # 数据库脚本
├── nginx/                # Nginx配置
├── start.sh              # 启动脚本
└── README.md             # 项目说明
```

---

## 🛠️ 技术栈

### 后端技术

| 技术 | 用途 |
|------|------|
| **Go** | 高性能编程语言 |
| **Gin** | 轻量级Web框架 |
| **GORM** | ORM库 |
| **MySQL** | 数据库 |
| **jwt-go** | JWT认证 |
| **bcrypt** | 密码加密 |

### 部署技术

| 技术 | 用途 |
|------|------|
| **Nginx** | 静态资源服务、反向代理 |
| **Docker** | 容器化部署 |

---

## 📡 API 接口

### 用户相关

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/register` | POST | 用户注册 |
| `/api/login` | POST | 用户登录 |
| `/api/me` | GET | 获取当前用户 |
| `/api/me` | PUT | 更新用户资料 |
| `/api/users/:id` | GET | 获取用户公开信息 |
| `/api/users/:id/posts` | GET | 获取用户帖子列表 |

### 帖子相关

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/posts` | GET | 获取帖子列表 |
| `/api/posts/:id` | GET | 获取单篇帖子 |
| `/api/posts` | POST | 创建帖子 |
| `/api/posts/:id` | DELETE | 删除帖子 |
| `/api/posts/:id/like` | POST | 点赞/取消点赞 |
| `/api/likes/check` | GET | 检查点赞状态 |
| `/api/likes/my` | GET | 获取我的点赞 |

### 评论相关

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/posts/:id/comments` | GET | 获取帖子评论（按点赞排序） |
| `/api/posts/:id/comments` | POST | 发表评论 |
| `/api/comments/:id` | DELETE | 删除评论 |
| `/api/comments/:id/like` | POST | 评论点赞/取消点赞 |
| `/api/comments/likes/check` | GET | 检查评论点赞状态 |
| `/api/comments/likes/count` | GET | 获取评论点赞数 |

### 最佳评论相关

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/posts/:id/best-comment` | GET | 获取帖子最佳评论（PK结果） |
| `/api/nearby/best-comments` | GET | 获取附近最佳评论（按经纬度聚合） |

### POI相关

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/pois` | GET | 搜索附近兴趣点 |
| `/api/geocode/reverse` | GET | 逆地理编码 |

---

## 📊 数据库设计

### 用户表 (users)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| username | VARCHAR(50) | 用户名（唯一） |
| password | VARCHAR(255) | 加密密码 |
| nickname | VARCHAR(50) | 昵称 |
| avatar | VARCHAR(255) | 头像 |
| gender | ENUM | 性别 |
| bio | VARCHAR(200) | 个人简介 |
| created_at | TIMESTAMP | 创建时间 |

### 帖子表 (posts)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| user_id | INT | 用户ID |
| title | VARCHAR(100) | 标题 |
| content | TEXT | 内容 |
| type | VARCHAR(20) | 类型 |
| location_name | VARCHAR(100) | 地点名称 |
| latitude | DECIMAL(10,6) | 纬度 |
| longitude | DECIMAL(10,6) | 经度 |
| created_at | TIMESTAMP | 创建时间 |

### 评论表 (comments)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| post_id | INT | 帖子ID |
| user_id | INT | 用户ID |
| content | TEXT | 内容 |
| reply_to_id | INT | 回复的评论ID |
| reply_to_user | VARCHAR(50) | 回复的用户名 |
| created_at | TIMESTAMP | 创建时间 |

### 点赞表 (likes)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| user_id | INT | 用户ID |
| post_id | INT | 帖子ID |
| created_at | TIMESTAMP | 创建时间 |

### 评论点赞表 (comment_likes)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| user_id | INT | 用户ID |
| comment_id | INT | 评论ID |
| created_at | TIMESTAMP | 创建时间 |

---

## 📝 Git 提交记录

### 项目统计

- **总提交数**：58 次
- **分支**：momo
- **仓库地址**：github.com:codedancewth/TapSpot.git

### 主要提交记录

```
8080f494 feat: 评论点赞功能和最佳评论PK逻辑
af37ec23 chore: 更新TapSpot子模块 - 评论点赞和最佳评论PK功能
2b0b5bcb feat: 实现评论点赞功能和最佳评论PK逻辑
06fcf0c1 security: 将公网IP替换为localhost
61dd6cff docs: 添加地点最佳评论功能需求文档
ce22043d fix: 改进地图点击事件处理，确保帖子列表导航始终有效
3f7dfbb0 fix: 修复点击帖子列表后地图位置不稳定的问题
0cbfc341 feat: 完善用户资料编辑功能
9bd4ac2d feat: 添加用户资料编辑和查看他人空间功能
63b48072 feat: 新增功能与优化
9feef387 fix: 去掉打卡标记hover旋转效果
cb97a7ef feat: 地图打卡标记增强光晕和hover效果
b21dc6d6 fix: 地图光标改为默认指针
f7b40716 feat: 优化购物和住宿图标
17f3d358 feat: 优化住宿图标为床铺设计
9d284d8e feat: 优化美食图标为叉子勺子设计
217166e0 feat: 优化打卡编辑弹窗类型按钮
4f4d1a31 feat: 更新打卡图标设计
3dcecb32 Restore waterdrop marker shape with clean gradients
5463bffb Rename to 打卡 and improve marker design with gradients
b888c84e Make marker size responsive to map zoom level
a4c86770 Zoom to post location when clicking post detail
7e41bdc6 Add get my location feature for post creation
ccf637e2 Fix map marker interaction: hover highlight, larger click area
8680d049 Improve map marker interaction
02484e1b Add reply comment feature and map popup comments preview
deefe6bd Add MySQL backend and comment feature
cde7690d Add tile download script and fix map tiles URL
0d1a141e feat: 添加本地瓦片缓存服务，下载全中国1-10级瓦片
9c827a31 fix: 换回高德地图瓦片，百度坐标系不兼容
```

### 提交类型统计

| 类型 | 数量 | 说明 |
|------|------|------|
| feat | 15+ | 新功能开发 |
| fix | 8+ | Bug修复 |
| docs | 2+ | 文档更新 |
| chore | 3+ | 杂项更新 |
| security | 1 | 安全相关 |

---

## 🚀 部署说明

### 开发环境

```bash
# 克隆项目
git clone https://github.com/codedancewth/TapSpot.git
cd TapSpot

# 配置数据库
# 创建MySQL数据库: CREATE DATABASE tapspot;
# 修改 backend/config/database.go 中的数据库连接配置

# 安装依赖并运行后端
cd backend
go mod download
go run main.go

# 后端运行在端口8080
```

### 生产环境

```bash
# 编译Go后端
cd backend
go build -o tapspot

# 运行
./tapspot

# 或使用Docker
docker-compose up -d
```

### Nginx配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🎯 项目亮点

### 1. 最佳评论PK机制

独创的内容竞争机制，让优质内容脱颖而出：
- 帖子和评论站在同一起跑线
- 用点赞数决定最佳内容
- 用户只看到最有价值的信息

### 2. 精美的地图交互

- 8种精心设计的打卡图标
- 响应式标记大小（根据地图缩放）
- 悬停光晕效果
- 金色边框标识自己的打卡

### 3. 完整的用户体系

- 注册登录
- 个人资料编辑
- 查看他人空间
- 打卡统计和获赞数

### 4. 丰富的互动功能

- 帖子点赞
- 评论发表和回复
- 评论点赞
- 内容搜索

---

## 📈 未来规划

- [ ] 图片上传功能
- [ ] 私信系统
- [ ] 关注/粉丝
- [ ] 地点收藏
- [ ] 热门地点推荐
- [ ] 微信小程序版本

---

## 📄 开源协议

MIT License

---

## 👥 贡献者

- **momo** 👑 - AI助手，负责代码开发、文档编写

---

> Made with ❤️ by TapSpot Team
> 
> 文档生成时间：2026-02-18
