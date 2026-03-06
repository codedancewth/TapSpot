-- TapSpot 测试数据初始化脚本
-- 执行：docker exec -i tapspot-mysql mysql -uroot -pTapSpot@2026 tapspot < init_test_data.sql

-- 清空现有数据（软删除的数据保留）
DELETE FROM likes WHERE id > 0;
DELETE FROM comments WHERE id > 0;
DELETE FROM posts WHERE id > 0;
DELETE FROM users WHERE id > 1;

-- 重置自增 ID
ALTER TABLE comments AUTO_INCREMENT = 1;
ALTER TABLE posts AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 2;

-- 插入测试用户
INSERT INTO users (id, username, password, nickname, avatar, gender, bio, email, phone, created_at, updated_at) VALUES
(2, 'wth2026', '$2a$10$XQxNv5KZJxJxJxJxJxJxJOXQxNv5KZJxJxJxJxJxJxJxJxJxJxJxJ', '舞力全开', '/avatars/user2.png', 'male', '热爱旅行和打卡', 'wth2026@example.com', '13800138001', NOW(), NOW()),
(3, 'traveler', '$2a$10$XQxNv5KZJxJxJxJxJxJxJOXQxNv5KZJxJxJxJxJxJxJxJxJxJxJxJ', '旅行家', '/avatars/user3.png', 'female', '探索世界的每一个角落', 'traveler@example.com', '13800138002', NOW(), NOW()),
(4, 'foodie', '$2a$10$XQxNv5KZJxJxJxJxJxJxJOXQxNv5KZJxJxJxJxJxJxJxJxJxJxJxJ', '美食家', '/avatars/user4.png', 'male', '吃遍全球美食', 'foodie@example.com', '13800138003', NOW(), NOW()),
(5, 'photographer', '$2a$10$XQxNv5KZJxJxJxJxJxJxJOXQxNv5KZJxJxJxJxJxJxJxJxJxJxJxJ', '摄影师', '/avatars/user5.png', 'female', '用镜头记录美好', 'photographer@example.com', '13800138004', NOW(), NOW());

-- 插入测试帖子（覆盖不同地区和类别）
INSERT INTO posts (user_id, title, content, type, location_name, latitude, longitude, created_at, updated_at) VALUES
-- 中东地区帖子
(2, '迪拜哈利法塔打卡', '世界最高建筑，太震撼了！夜景更美，推荐晚上来。', 'post', '哈利法塔', 25.1972, 55.2744, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(3, '伊朗波斯波利斯遗址', '古老的波斯帝国遗址，历史感满满。建议请个导游讲解。', 'post', '波斯波利斯', 29.9347, 52.8928, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(4, '沙特利雅得美食', '这里的烤肉太棒了！推荐尝试当地的 Kebab。', 'post', '利雅得', 24.7136, 46.6753, DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
(2, '阿联酋阿布扎比清真寺', '谢赫扎耶德清真寺，白色大理石建筑太美了。', 'post', '谢赫扎耶德清真寺', 24.4128, 54.4747, DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(5, '土耳其卡帕多奇亚热气球', '凌晨 4 点起床值得！热气球日出太美了。', 'post', '卡帕多奇亚', 38.6431, 34.8289, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),

-- 中国地区帖子
(3, '北京故宫', '红墙黄瓦，感受皇家气派。建议早上去，人少。', 'post', '故宫博物院', 39.9163, 116.3972, DATE_SUB(NOW(), INTERVAL 6 DAY), NOW()),
(4, '上海外滩夜景', '魔都夜景名不虚传，东方明珠亮灯瞬间太美了。', 'post', '外滩', 31.2397, 121.4900, DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(5, '西安兵马俑', '世界第八大奇迹，每个俑都不一样。', 'post', '秦始皇兵马俑', 34.3848, 109.2734, DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
(2, '成都大熊猫基地', '花花太可爱了！建议早点去，熊猫上午比较活跃。', 'post', '成都大熊猫繁育研究基地', 30.7329, 104.1451, DATE_SUB(NOW(), INTERVAL 9 DAY), NOW()),
(3, '杭州西湖', '欲把西湖比西子，淡妆浓抹总相宜。断桥残雪很美。', 'post', '西湖', 30.2594, 120.1492, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(4, '桂林漓江', '桂林山水甲天下，漓江风光甲桂林。竹筏漂流推荐！', 'post', '漓江', 25.2736, 110.2869, DATE_SUB(NOW(), INTERVAL 11 DAY), NOW()),
(5, '张家界国家森林公园', '阿凡达取景地，石柱峰林太壮观了。', 'post', '张家界', 29.3249, 110.4344, DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
(2, '西藏布达拉宫', '世界屋脊上的明珠，信仰的力量。', 'post', '布达拉宫', 29.6555, 91.1172, DATE_SUB(NOW(), INTERVAL 13 DAY), NOW()),
(3, '云南丽江古城', '柔软时光，适合发呆的地方。晚上酒吧街很热闹。', 'post', '丽江古城', 26.8721, 100.2362, DATE_SUB(NOW(), INTERVAL 14 DAY), NOW()),
(4, '新疆喀纳斯', '神的后花园，秋天的颜色最美。', 'post', '喀纳斯湖', 48.6169, 87.0669, DATE_SUB(NOW(), INTERVAL 15 DAY), NOW());

-- 插入测试评论
INSERT INTO comments (post_id, user_id, content, reply_to_id, reply_to_user, created_at, updated_at) VALUES
(1, 3, '我也去了！确实很震撼', NULL, NULL, DATE_SUB(NOW(), INTERVAL 23 HOUR), NOW()),
(1, 4, '门票贵吗？', NULL, NULL, DATE_SUB(NOW(), INTERVAL 22 HOUR), NOW()),
(1, 2, '大概 150 迪拉姆，值得！', 2, 'foodie', DATE_SUB(NOW(), INTERVAL 21 HOUR), NOW()),
(2, 5, '伊朗签证好办吗？', NULL, NULL, DATE_SUB(NOW(), INTERVAL 47 HOUR), NOW()),
(2, 3, '落地签，很方便', 4, 'photographer', DATE_SUB(NOW(), INTERVAL 46 HOUR), NOW()),
(6, 2, '故宫一定要提前预约！', NULL, NULL, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
(6, 4, '周一闭馆，别跑空了', NULL, NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(7, 3, '外滩免费，太棒了', NULL, NULL, DATE_SUB(NOW(), INTERVAL 6 DAY), NOW()),
(9, 5, '花花是我的最爱！', NULL, NULL, DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
(9, 3, '记得带充电宝，拍照太多', NULL, NULL, DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(10, 4, '西湖边的龙井茶不错', NULL, NULL, DATE_SUB(NOW(), INTERVAL 9 DAY), NOW()),
(12, 2, '玻璃栈道刺激！', NULL, NULL, DATE_SUB(NOW(), INTERVAL 11 DAY), NOW()),
(13, 5, '高原反应严重吗？', NULL, NULL, DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
(13, 2, '第一天别洗澡，慢慢适应', 13, 'photographer', DATE_SUB(NOW(), INTERVAL 11 DAY), NOW()),
(15, 3, '秋天去颜色最丰富', NULL, NULL, DATE_SUB(NOW(), INTERVAL 14 DAY), NOW());

-- 插入测试点赞
INSERT INTO likes (post_id, user_id, created_at) VALUES
(1, 3, NOW()), (1, 4, NOW()), (1, 5, NOW()),
(2, 2, NOW()), (2, 5, NOW()),
(3, 2, NOW()), (3, 3, NOW()),
(4, 3, NOW()), (4, 4, NOW()), (4, 5, NOW()),
(5, 2, NOW()), (5, 3, NOW()), (5, 4, NOW()), (5, 5, NOW()),
(6, 2, NOW()), (6, 4, NOW()),
(7, 3, NOW()), (7, 5, NOW()),
(8, 2, NOW()), (8, 3, NOW()), (8, 4, NOW()),
(9, 3, NOW()), (9, 4, NOW()), (9, 5, NOW()),
(10, 2, NOW()), (10, 5, NOW()),
(11, 3, NOW()), (11, 4, NOW()),
(12, 2, NOW()), (12, 3, NOW()), (12, 5, NOW()),
(13, 4, NOW()), (13, 5, NOW()),
(14, 2, NOW()), (14, 3, NOW()),
(15, 2, NOW()), (15, 3, NOW()), (15, 4, NOW()), (15, 5, NOW());

-- 验证数据
SELECT 'Users:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Posts:', COUNT(*) FROM posts
UNION ALL
SELECT 'Comments:', COUNT(*) FROM comments
UNION ALL
SELECT 'Likes:', COUNT(*) FROM likes;
