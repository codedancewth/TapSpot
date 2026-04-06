-- TapSpot 任务系统数据库表
-- 版本: v1.0
-- 日期: 2026-04-06

-- 任务表
CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL COMMENT '任务标题',
    description TEXT COMMENT '任务描述',
    type TINYINT NOT NULL COMMENT '1签到 2拍照 3问答 4探索 5挑战',
    latitude DECIMAL(10, 8) NOT NULL COMMENT '纬度',
    longitude DECIMAL(11, 8) NOT NULL COMMENT '经度',
    location_name VARCHAR(255) COMMENT '地点名称',
    radius INT DEFAULT 100 COMMENT '有效范围（米）',
    points INT NOT NULL DEFAULT 0 COMMENT '基础积分',
    bonus_points INT DEFAULT 0 COMMENT '额外奖励积分',
    question TEXT COMMENT '问答任务的问题',
    answer VARCHAR(255) COMMENT '问答任务的答案',
    max_participants INT DEFAULT 0 COMMENT '最大参与人数，0=无限制',
    start_date DATETIME COMMENT '任务开始时间',
    end_date DATETIME COMMENT '任务结束时间',
    daily_limit BOOLEAN DEFAULT TRUE COMMENT '是否每日限制',
    publisher_type TINYINT DEFAULT 1 COMMENT '1=系统 2=用户',
    publisher_id BIGINT UNSIGNED COMMENT '发布者用户ID',
    participant_count INT DEFAULT 0 COMMENT '已参与人数',
    status TINYINT DEFAULT 0 COMMENT '0草稿 1进行中 2结束 3取消',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_end_date (end_date),
    INDEX idx_location (latitude, longitude),
    INDEX idx_publisher (publisher_id),
    INDEX idx_created (created_at)
);

-- 任务完成记录表
CREATE TABLE IF NOT EXISTS task_completions (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    task_id BIGINT UNSIGNED NOT NULL COMMENT '任务ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    completed_at DATETIME NOT NULL COMMENT '完成时间',
    points_earned INT NOT NULL COMMENT '获得的积分',
    proof_photo_url VARCHAR(512) COMMENT '证明照片URL',
    answer VARCHAR(255) COMMENT '问答答案',
    actual_lat DECIMAL(10, 8) COMMENT '实际签到纬度',
    actual_lng DECIMAL(11, 8) COMMENT '实际签到经度',
    distance FLOAT COMMENT '与任务点的距离（米）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_task_user (task_id, user_id),
    INDEX idx_user (user_id),
    INDEX idx_completed_at (completed_at),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 用户积分表
CREATE TABLE IF NOT EXISTS user_points (
    user_id BIGINT UNSIGNED PRIMARY KEY COMMENT '用户ID',
    total_points INT DEFAULT 0 COMMENT '历史总积分',
    available_points INT DEFAULT 0 COMMENT '可用积分',
    weekly_points INT DEFAULT 0 COMMENT '本周积分',
    monthly_points INT DEFAULT 0 COMMENT '本月积分',
    total_tasks INT DEFAULT 0 COMMENT '完成任务数',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_total (total_points),
    INDEX idx_weekly (weekly_points),
    INDEX idx_monthly (monthly_points),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 每日任务记录表
CREATE TABLE IF NOT EXISTS daily_task_records (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    task_date DATE NOT NULL COMMENT '任务日期',
    tasks_completed INT DEFAULT 0 COMMENT '完成任务数',
    points_earned INT DEFAULT 0 COMMENT '获得积分',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_date (user_id, task_date),
    INDEX idx_task_date (task_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 用户等级表（与PlayerLevel合并）
-- 注意：如果已存在 PlayerLevel 表，此表会被复用
CREATE TABLE IF NOT EXISTS user_levels (
    user_id BIGINT UNSIGNED PRIMARY KEY COMMENT '用户ID',
    level INT DEFAULT 1 COMMENT '等级',
    title VARCHAR(50) DEFAULT '探索者' COMMENT '称号',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 插入示例系统任务
INSERT INTO tasks (title, description, type, latitude, longitude, location_name, radius, points, bonus_points, publisher_type, status) VALUES
('📍 天安门广场签到', '来天安门广场完成签到，感受祖国的庄严', 1, 39.9073, 116.3910, '天安门广场', 200, 30, 10, 1, 1),
('📍 故宫博物院签到', '探访紫禁城，了解历史文化', 1, 39.9163, 116.3972, '故宫博物院', 150, 50, 20, 1, 1),
('📍 三里屯酒吧街签到', '时尚地标，体验夜生活', 1, 39.9365, 116.4537, '三里屯', 100, 20, 5, 1, 1),
('📸 拍摄一张胡同照片', '用相机记录老北京胡同', 2, 39.9289, 116.4175, '南锣鼓巷', 100, 40, 15, 1, 1),
('📸 拍摄外滩夜景', '记录上海的璀璨夜景', 2, 31.2405, 121.4900, '外滩', 150, 60, 20, 1, 1),
('❓ 故宫有多少间房？', '回答关于故宫的知识问题', 3, 39.9163, 116.3972, '故宫博物院', 100, 50, 20, 1, 1),
('❓ 东方明珠塔有多高？', '测试你对上海地标的了解', 3, 31.2397, 121.4998, '东方明珠', 100, 50, 20, 1, 1),
('🗺️ 发现一个新地点', '探索并签到一个你从未去过的地方', 4, 0, 0, '任意地点', 0, 100, 50, 1, 1),
('🔥 登顶长城', '完成一次长城签到，挑战自我', 5, 40.4319, 116.5704, '八达岭长城', 300, 200, 100, 1, 1),
('🔥 徒步西湖一圈', '环湖徒步，完成挑战', 5, 30.2462, 120.1479, '西湖', 1000, 300, 150, 1, 1);

-- 初始化已有用户的积分记录
INSERT INTO user_points (user_id, total_points, available_points, weekly_points, monthly_points, total_tasks)
SELECT id, 0, 100, 0, 0, 0 FROM users WHERE id NOT IN (SELECT user_id FROM user_points);

-- 初始化已有用户的等级记录
INSERT INTO user_levels (user_id, level, title)
SELECT id, 1, '探索者' FROM users WHERE id NOT IN (SELECT user_id FROM user_levels);
