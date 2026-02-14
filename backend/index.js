const express = require('express')
const mysql = require('mysql2/promise')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()
const PORT = 3002
const JWT_SECRET = 'tapspot-secret-key-2026'

// 中间件
app.use(cors())
app.use(express.json())

// 数据库连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'TapSpot@2026',
  database: 'tapspot',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// JWT 验证中间件
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: '请先登录' })
    }
    const decoded = jwt.verify(token, JWT_SECRET)
    const [users] = await pool.execute('SELECT id, username, nickname FROM users WHERE id = ?', [decoded.userId])
    if (users.length === 0) {
      return res.status(401).json({ error: '用户不存在' })
    }
    req.user = users[0]
    next()
  } catch (error) {
    res.status(401).json({ error: '登录已过期，请重新登录' })
  }
}

// ============ 用户相关 API ============

// 注册
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' })
    }
    if (username.length < 3) {
      return res.status(400).json({ error: '用户名至少3个字符' })
    }
    if (password.length < 3) {
      return res.status(400).json({ error: '密码至少3个字符' })
    }

    // 检查用户名是否已存在
    const [existing] = await pool.execute('SELECT id FROM users WHERE username = ?', [username])
    if (existing.length > 0) {
      return res.status(400).json({ error: '用户名已存在' })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // 创建用户
    const [result] = await pool.execute(
      'INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)',
      [username, hashedPassword, nickname || username]
    )

    const token = jwt.sign({ userId: result.insertId }, JWT_SECRET, { expiresIn: '30d' })
    
    res.json({
      success: true,
      user: { id: result.insertId, username, nickname: nickname || username },
      token
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: '注册失败，请稍后重试' })
  }
})

// 登录
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: '请输入用户名和密码' })
    }

    // 特殊处理 root 账号
    if (username === 'root' && password === 'root') {
      const [rootUser] = await pool.execute('SELECT id, username, nickname FROM users WHERE username = ?', ['root'])
      const token = jwt.sign({ userId: rootUser[0].id }, JWT_SECRET, { expiresIn: '30d' })
      return res.json({
        success: true,
        user: rootUser[0],
        token
      })
    }

    // 查找用户
    const [users] = await pool.execute('SELECT * FROM users WHERE username = ?', [username])
    if (users.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    const user = users[0]
    
    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' })
    
    res.json({
      success: true,
      user: { id: user.id, username: user.username, nickname: user.nickname },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: '登录失败，请稍后重试' })
  }
})

// 获取当前用户信息
app.get('/api/me', auth, (req, res) => {
  res.json({ user: req.user })
})

// ============ 帖子相关 API ============

// 获取帖子列表
app.get('/api/posts', async (req, res) => {
  try {
    const { type, userId, search, limit = 50, offset = 0 } = req.query
    
    let sql = `
      SELECT p.*, u.username, u.nickname,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `
    const params = []

    if (type && type !== 'all') {
      sql += ' AND p.type = ?'
      params.push(type)
    }

    if (userId) {
      sql += ' AND p.user_id = ?'
      params.push(parseInt(userId))
    }

    if (search) {
      sql += ' AND (p.title LIKE ? OR p.content LIKE ? OR p.location_name LIKE ?)'
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    sql += ' ORDER BY p.created_at DESC'
    
    const [posts] = await pool.execute(sql, params)
    
    // 格式化返回数据
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      type: post.type,
      location_name: post.location_name,
      latitude: parseFloat(post.latitude),
      longitude: parseFloat(post.longitude),
      likes: post.like_count,
      author: post.nickname || post.username,
      authorId: post.user_id,
      createdAt: post.created_at
    }))

    res.json({ posts: formattedPosts })
  } catch (error) {
    console.error('Get posts error:', error)
    res.status(500).json({ error: '获取帖子失败' })
  }
})

// 获取单篇帖子
app.get('/api/posts/:id', async (req, res) => {
  try {
    const [posts] = await pool.execute(`
      SELECT p.*, u.username, u.nickname,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [req.params.id])

    if (posts.length === 0) {
      return res.status(404).json({ error: '帖子不存在' })
    }

    const post = posts[0]
    res.json({
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        type: post.type,
        location_name: post.location_name,
        latitude: parseFloat(post.latitude),
        longitude: parseFloat(post.longitude),
        likes: post.like_count,
        author: post.nickname || post.username,
        authorId: post.user_id,
        createdAt: post.created_at
      }
    })
  } catch (error) {
    console.error('Get post error:', error)
    res.status(500).json({ error: '获取帖子失败' })
  }
})

// 创建帖子
app.post('/api/posts', auth, async (req, res) => {
  try {
    const { title, content, type = 'post', location_name, latitude, longitude } = req.body

    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容不能为空' })
    }
    if (!latitude || !longitude) {
      return res.status(400).json({ error: '请选择位置' })
    }

    const [result] = await pool.execute(
      `INSERT INTO posts (user_id, title, content, type, location_name, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title, content, type, location_name, latitude, longitude]
    )

    res.json({
      success: true,
      post: {
        id: result.insertId,
        title,
        content,
        type,
        location_name,
        latitude,
        longitude,
        likes: 0,
        author: req.user.nickname,
        authorId: req.user.id,
        createdAt: new Date()
      }
    })
  } catch (error) {
    console.error('Create post error:', error)
    res.status(500).json({ error: '发布失败，请稍后重试' })
  }
})

// 删除帖子
app.delete('/api/posts/:id', auth, async (req, res) => {
  try {
    const [posts] = await pool.execute('SELECT user_id FROM posts WHERE id = ?', [req.params.id])
    
    if (posts.length === 0) {
      return res.status(404).json({ error: '帖子不存在' })
    }
    
    if (posts[0].user_id !== req.user.id) {
      return res.status(403).json({ error: '无权删除此帖子' })
    }

    await pool.execute('DELETE FROM posts WHERE id = ?', [req.params.id])
    res.json({ success: true })
  } catch (error) {
    console.error('Delete post error:', error)
    res.status(500).json({ error: '删除失败' })
  }
})

// 点赞/取消点赞
app.post('/api/posts/:id/like', auth, async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.user.id

    // 检查是否已点赞
    const [existing] = await pool.execute(
      'SELECT id FROM likes WHERE user_id = ? AND post_id = ?',
      [userId, postId]
    )

    if (existing.length > 0) {
      // 取消点赞
      await pool.execute('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId])
      res.json({ success: true, liked: false })
    } else {
      // 添加点赞
      await pool.execute('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userId, postId])
      res.json({ success: true, liked: true })
    }
  } catch (error) {
    console.error('Like error:', error)
    res.status(500).json({ error: '操作失败' })
  }
})

// 获取用户是否点赞了某些帖子
app.get('/api/likes/check', auth, async (req, res) => {
  try {
    const { postIds } = req.query
    if (!postIds) {
      return res.json({ liked: [] })
    }

    const ids = postIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id))
    if (ids.length === 0) {
      return res.json({ liked: [] })
    }

    const placeholders = ids.map(() => '?').join(',')
    const [likes] = await pool.execute(
      `SELECT post_id FROM likes WHERE user_id = ? AND post_id IN (${placeholders})`,
      [req.user.id, ...ids]
    )

    res.json({ liked: likes.map(l => l.post_id) })
  } catch (error) {
    console.error('Check likes error:', error)
    res.status(500).json({ error: '检查失败' })
  }
})

// 获取用户点赞的帖子ID列表
app.get('/api/likes/my', auth, async (req, res) => {
  try {
    const [likes] = await pool.execute(
      'SELECT post_id FROM likes WHERE user_id = ?',
      [req.user.id]
    )
    res.json({ liked: likes.map(l => l.post_id) })
  } catch (error) {
    console.error('Get my likes error:', error)
    res.status(500).json({ error: '获取失败' })
  }
})

// ============ 评论相关 API ============

// 获取帖子评论（含评论数统计）
app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const [comments] = await pool.execute(`
      SELECT c.*, u.username, u.nickname
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [req.params.id])

    res.json({
      comments: comments.map(c => ({
        id: c.id,
        content: c.content,
        author: c.nickname || c.username,
        authorId: c.user_id,
        replyToId: c.reply_to_id,
        replyToUser: c.reply_to_user,
        createdAt: c.created_at
      }))
    })
  } catch (error) {
    console.error('Get comments error:', error)
    res.status(500).json({ error: '获取评论失败' })
  }
})

// 获取多个帖子的评论数
app.get('/api/posts/comments/count', async (req, res) => {
  try {
    const { postIds } = req.query
    if (!postIds) return res.json({ counts: {} })
    
    const ids = postIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id))
    if (ids.length === 0) return res.json({ counts: {} })

    const placeholders = ids.map(() => '?').join(',')
    const [rows] = await pool.execute(
      `SELECT post_id, COUNT(*) as count FROM comments WHERE post_id IN (${placeholders}) GROUP BY post_id`,
      ids
    )
    
    const counts = {}
    rows.forEach(r => { counts[r.post_id] = r.count })
    res.json({ counts })
  } catch (error) {
    console.error('Get comment counts error:', error)
    res.status(500).json({ error: '获取失败' })
  }
})

// 发表评论（支持回复）
app.post('/api/posts/:id/comments', auth, async (req, res) => {
  try {
    const { content, replyToId, replyToUser } = req.body
    if (!content || !content.trim()) {
      return res.status(400).json({ error: '评论内容不能为空' })
    }

    // 检查帖子是否存在
    const [posts] = await pool.execute('SELECT id FROM posts WHERE id = ?', [req.params.id])
    if (posts.length === 0) {
      return res.status(404).json({ error: '帖子不存在' })
    }

    const [result] = await pool.execute(
      'INSERT INTO comments (post_id, user_id, content, reply_to_id, reply_to_user) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, req.user.id, content.trim(), replyToId || null, replyToUser || null]
    )

    res.json({
      success: true,
      comment: {
        id: result.insertId,
        content: content.trim(),
        author: req.user.nickname,
        authorId: req.user.id,
        replyToId: replyToId || null,
        replyToUser: replyToUser || null,
        createdAt: new Date()
      }
    })
  } catch (error) {
    console.error('Create comment error:', error)
    res.status(500).json({ error: '评论失败' })
  }
})

// 删除评论
app.delete('/api/comments/:id', auth, async (req, res) => {
  try {
    const [comments] = await pool.execute('SELECT user_id FROM comments WHERE id = ?', [req.params.id])
    
    if (comments.length === 0) {
      return res.status(404).json({ error: '评论不存在' })
    }
    
    if (comments[0].user_id !== req.user.id) {
      return res.status(403).json({ error: '无权删除此评论' })
    }

    await pool.execute('DELETE FROM comments WHERE id = ?', [req.params.id])
    res.json({ success: true })
  } catch (error) {
    console.error('Delete comment error:', error)
    res.status(500).json({ error: '删除失败' })
  }
})

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 TapSpot API running on http://localhost:${PORT}`)
})
