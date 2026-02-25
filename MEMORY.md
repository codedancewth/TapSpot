# TapSpot 项目记忆

## 项目概况
TapSpot 是一个基于位置的社交平台，支持用户发布带地理位置的帖子、私信聊天、用户搜索等功能。

## 服务器信息
- **服务器 IP**: 43.135.148.74
- **后端端口**: 8080
- **前端**: nginx 托管
- **数据库**: MySQL + GORM
- **仓库**: https://github.com/codedancewth/TapSpot

## 核心功能
1. 用户注册/登录（记录注册 IP）
2. 位置帖子发布与浏览
3. 用户搜索（按昵称模糊查询）
4. 私信聊天系统
5. 访客统计（记录访问 IP、路径）
6. AI 位置分析（阿里云百炼 Qwen3-Coder-Plus）

## API 配置
- **AI API**: 阿里云百炼
- **端点**: https://coding.dashscope.aliyuncs.com/v1
- **模型**: qwen3-coder-plus
- **API Key**: sk-sp-58397f71c3304b03879e04efd48f9e4b（配置在 backend/.env）

## 重要设计决策
1. **API 返回格式**: 所有列表 API 返回 `[]` 而不是 `null`，防止前端 `.filter()` 报错
2. **用户搜索**: 只搜索昵称，不搜索用户名
3. **代码结构**: 按业务逻辑分层（dto/services/middleware/controllers）
4. **文档**: 整合到 README.md，不单独建 docs 文件夹
5. **访客记录**: 自动记录访问 IP，跳过静态资源

## 测试账号
- 管理员：root / root
- 用户：wth2066272 / wth2066272（昵称：吴生）

## 关键 API 端点
- `POST /api/ai/analyze` - AI 位置分析
- `GET /api/users/stats` - 用户统计（需认证）
- `GET /api/stats/visits` - 访客统计（需认证）
- `GET /api/stats/realtime` - 实时访客（需认证）
- `GET /api/users/search?q=xxx` - 用户搜索（公开）
