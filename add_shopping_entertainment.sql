-- TapSpot 购物和娱乐测试数据
-- 执行：docker exec -i tapspot-mysql mysql -uroot -pTapSpot@2026 tapspot < add_shopping_entertainment.sql

-- 插入购物类打卡点 (type='shop')
INSERT INTO posts (user_id, title, content, type, location_name, latitude, longitude, created_at, updated_at) VALUES
-- 北京购物
(2, '三里屯太古里逛街', '潮流品牌聚集地，逛街购物天堂！推荐逛完去附近吃个饭。', 'shop', '北京三里屯太古里', 39.9365, 116.4550, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),

-- 上海购物
(4, '南京路步行街扫货', '中华商业第一街，老字号和商场云集。买特产的好地方！', 'shop', '上海南京路步行街', 31.2350, 121.4800, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),

-- 广州购物
(3, '天河城购物中心', '广州最大的购物中心之一，品牌齐全，吃喝玩乐一站式。', 'shop', '广州天河城', 23.1300, 113.3200, DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),

-- 成都购物
(5, '春熙路 IFS 打卡', '爬墙熊猫就在这里！商场高端品牌多，顶楼花园可以拍照。', 'shop', '成都春熙路 IFS', 30.6570, 104.0800, DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),

-- 娱乐类打卡点 (type='entertainment')
-- 北京娱乐
(2, '环球影城一日游', '北京环球影城太好玩了！变形金刚和哈利波特园区必玩，建议玩一整天。', 'entertainment', '北京环球影城', 39.8540, 116.6620, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),

-- 上海娱乐
(3, '迪士尼乐园打卡', '童话世界成真！推荐创极速光轮和加勒比海盗，晚上烟花秀必看。', 'entertainment', '上海迪士尼乐园', 31.1440, 121.6580, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),

-- 广州娱乐
(4, '长隆野生动物世界', '带娃必去！可以自驾看动物，大熊猫三胞胎超可爱。', 'entertainment', '广州长隆野生动物世界', 23.0050, 113.3100, DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),

-- 深圳娱乐
(5, '欢乐谷刺激之旅', '过山车爱好者的天堂！雪域雄鹰和完美风暴太刺激了。', 'entertainment', '深圳欢乐谷', 22.5470, 113.9700, DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),

-- 重庆娱乐
(2, '洪崖洞夜景打卡', '千与千寻现实版！晚上亮灯后超美，建议从千厮门大桥拍全景。', 'entertainment', '重庆洪崖洞', 29.5640, 106.5790, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),

-- 西安娱乐
(3, '大唐不夜城漫步', '梦回大唐！灯光秀和表演都很精彩，建议晚上去。', 'entertainment', '西安大唐不夜城', 34.2150, 108.9630, DATE_SUB(NOW(), INTERVAL 6 DAY), NOW());

-- 验证插入结果
SELECT '新增购物打卡点:' as category, COUNT(*) as count FROM posts WHERE type='shop'
UNION ALL
SELECT '新增娱乐打卡点:', COUNT(*) FROM posts WHERE type='entertainment';
