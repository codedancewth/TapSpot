const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3002;

// 中间件
app.use(cors());
app.use(express.json());

// 模拟数据
let spots = [
  {
    id: 1,
    name: "Eiffel Tower",
    description: "Iconic iron tower in Paris",
    latitude: 48.8584,
    longitude: 2.2945,
    country: "France",
    city: "Paris",
    category: "Attraction",
    rating: 4.7,
    review_count: 12500,
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    name: "Statue of Liberty",
    description: "Famous statue in New York Harbor",
    latitude: 40.6892,
    longitude: -74.0445,
    country: "United States",
    city: "New York",
    category: "Attraction",
    rating: 4.6,
    review_count: 8900,
    created_at: "2024-01-02T00:00:00Z"
  },
  {
    id: 3,
    name: "Great Wall of China",
    description: "Ancient fortification in China",
    latitude: 40.4319,
    longitude: 116.5704,
    country: "China",
    city: "Beijing",
    category: "Historical",
    rating: 4.8,
    review_count: 7500,
    created_at: "2024-01-03T00:00:00Z"
  },
  {
    id: 4,
    name: "Taj Mahal",
    description: "White marble mausoleum in India",
    latitude: 27.1751,
    longitude: 78.0421,
    country: "India",
    city: "Agra",
    category: "Historical",
    rating: 4.9,
    review_count: 6800,
    created_at: "2024-01-04T00:00:00Z"
  },
  {
    id: 5,
    name: "Sydney Opera House",
    description: "Performing arts center in Sydney",
    latitude: -33.8568,
    longitude: 151.2153,
    country: "Australia",
    city: "Sydney",
    category: "Attraction",
    rating: 4.5,
    review_count: 5200,
    created_at: "2024-01-05T00:00:00Z"
  },
  {
    id: 6,
    name: "Tokyo Tower",
    description: "Communications and observation tower in Tokyo",
    latitude: 35.6586,
    longitude: 139.7454,
    country: "Japan",
    city: "Tokyo",
    category: "Attraction",
    rating: 4.4,
    review_count: 3200,
    created_at: "2024-01-06T00:00:00Z"
  },
  {
    id: 7,
    name: "Big Ben",
    description: "Iconic clock tower in London",
    latitude: 51.5007,
    longitude: -0.1246,
    country: "United Kingdom",
    city: "London",
    category: "Historical",
    rating: 4.6,
    review_count: 4100,
    created_at: "2024-01-07T00:00:00Z"
  },
  {
    id: 8,
    name: "Santorini Sunset View",
    description: "Beautiful sunset spot in Greece",
    latitude: 36.3932,
    longitude: 25.4615,
    country: "Greece",
    city: "Santorini",
    category: "Nature",
    rating: 4.9,
    review_count: 2800,
    created_at: "2024-01-08T00:00:00Z"
  },
  {
    id: 9,
    name: "Times Square",
    description: "Major commercial intersection in NYC",
    latitude: 40.7580,
    longitude: -73.9855,
    country: "United States",
    city: "New York",
    category: "Urban",
    rating: 4.3,
    review_count: 5600,
    created_at: "2024-01-09T00:00:00Z"
  },
  {
    id: 10,
    name: "Amazon Rainforest",
    description: "Largest tropical rainforest",
    latitude: -3.4653,
    longitude: -62.2159,
    country: "Brazil",
    city: "Amazonas",
    category: "Nature",
    rating: 4.8,
    review_count: 1900,
    created_at: "2024-01-10T00:00:00Z"
  }
];

let reviews = [
  { id: 1, spot_id: 1, author: "Traveler123", content: "Absolutely breathtaking at night! The light show is magical.", rating: 5, likes: 42 },
  { id: 2, spot_id: 1, author: "ParisLover", content: "A must-visit in Paris. The view from the top is incredible.", rating: 4, likes: 28 },
  { id: 3, spot_id: 2, author: "NYCVisitor", content: "The ferry ride was amazing and the statue is huge!", rating: 5, likes: 35 },
  { id: 4, spot_id: 2, author: "HistoryBuff", content: "Very educational tour. Learned a lot about American history.", rating: 4, likes: 19 },
  { id: 5, spot_id: 3, author: "AdventureSeeker", content: "Hiking the wall was challenging but worth every step.", rating: 5, likes: 56 }
];

let nextSpotId = 11;
let nextReviewId = 6;

// API路由
app.get('/api/v1/stats', (req, res) => {
  const countrySet = new Set(spots.map(spot => spot.country));
  res.json({
    success: true,
    data: {
      total_spots: spots.length,
      total_reviews: reviews.length,
      total_countries: countrySet.size
    }
  });
});

app.get('/api/v1/countries', (req, res) => {
  const countryCounts = {};
  spots.forEach(spot => {
    countryCounts[spot.country] = (countryCounts[spot.country] || 0) + 1;
  });
  
  const countries = Object.entries(countryCounts).map(([country, count]) => ({
    country,
    count
  }));
  
  res.json({
    success: true,
    data: countries
  });
});

app.get('/api/v1/spots', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.page_size) || 20;
  const country = req.query.country;
  const category = req.query.category;
  
  let filteredSpots = [...spots];
  
  if (country) {
    filteredSpots = filteredSpots.filter(spot => spot.country === country);
  }
  
  if (category) {
    filteredSpots = filteredSpots.filter(spot => spot.category === category);
  }
  
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedSpots = filteredSpots.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: {
      spots: paginatedSpots,
      total: filteredSpots.length,
      page,
      page_size: pageSize
    }
  });
});

app.get('/api/v1/spots/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const spot = spots.find(s => s.id === id);
  
  if (!spot) {
    return res.status(404).json({
      success: false,
      message: "Spot not found"
    });
  }
  
  const spotReviews = reviews.filter(r => r.spot_id === id);
  
  res.json({
    success: true,
    data: {
      ...spot,
      reviews: spotReviews
    }
  });
});

app.post('/api/v1/spots', (req, res) => {
  const newSpot = {
    id: nextSpotId++,
    ...req.body,
    rating: 0,
    review_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  spots.push(newSpot);
  
  res.status(201).json({
    success: true,
    data: newSpot
  });
});

app.get('/api/v1/spots/:id/reviews', (req, res) => {
  const spotId = parseInt(req.params.id);
  const spotReviews = reviews.filter(r => r.spot_id === spotId);
  
  res.json({
    success: true,
    data: {
      reviews: spotReviews,
      total: spotReviews.length,
      page: 1,
      page_size: spotReviews.length
    }
  });
});

app.post('/api/v1/spots/:id/reviews', (req, res) => {
  const spotId = parseInt(req.params.id);
  const newReview = {
    id: nextReviewId++,
    spot_id: spotId,
    ...req.body,
    likes: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  reviews.push(newReview);
  
  // 更新spot的评分
  const spotReviews = reviews.filter(r => r.spot_id === spotId);
  const avgRating = spotReviews.reduce((sum, r) => sum + r.rating, 0) / spotReviews.length;
  
  const spotIndex = spots.findIndex(s => s.id === spotId);
  if (spotIndex !== -1) {
    spots[spotIndex].rating = parseFloat(avgRating.toFixed(1));
    spots[spotIndex].review_count = spotReviews.length;
  }
  
  res.status(201).json({
    success: true,
    data: newReview
  });
});

app.post('/api/v1/reviews/:id/like', (req, res) => {
  const reviewId = parseInt(req.params.id);
  const reviewIndex = reviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Review not found"
    });
  }
  
  reviews[reviewIndex].likes += 1;
  
  res.json({
    success: true,
    data: reviews[reviewIndex]
  });
});

app.get('/api/v1/spots/bounds', (req, res) => {
  const minLat = parseFloat(req.query.min_lat) || -90;
  const maxLat = parseFloat(req.query.max_lat) || 90;
  const minLng = parseFloat(req.query.min_lng) || -180;
  const maxLng = parseFloat(req.query.max_lng) || 180;
  
  const filteredSpots = spots.filter(spot => 
    spot.latitude >= minLat && 
    spot.latitude <= maxLat && 
    spot.longitude >= minLng && 
    spot.longitude <= maxLng
  );
  
  res.json({
    success: true,
    data: filteredSpots
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// POI 搜索 API（模拟高德数据，返回附近的兴趣点）
app.get('/api/pois', (req, res) => {
  const location = req.query.location; // "lng,lat"
  const radius = parseInt(req.query.radius) || 3000;

  if (!location) {
    return res.status(400).json({ error: '缺少 location 参数' });
  }

  const [lng, lat] = location.split(',').map(parseFloat);

  // 模拟 POI 数据（实际项目中应调用高德 API）
  // 这里返回一些随机生成的附近 POI
  const poiTypes = [
    { type: 'restaurant', typeName: '餐饮', names: ['肯德基', '麦当劳', '星巴克', '瑞幸咖啡', '海底捞', '呷哺呷哺', '必胜客', '真功夫'] },
    { type: 'hotel', typeName: '酒店', names: ['如家酒店', '汉庭酒店', '7天酒店', '锦江之星', '全季酒店', '亚朵酒店'] },
    { type: 'shopping', typeName: '购物', names: ['万达广场', '华润万家', '永辉超市', '盒马鲜生', '名创优品', '屈臣氏'] },
    { type: 'scenic', typeName: '景点', names: ['人民公园', '中心广场', '历史博物馆', '科技馆', '海洋世界', '动物园'] },
    { type: 'entertainment', typeName: '娱乐', names: ['万达影城', 'KTV', '网吧', '健身房', '游泳馆', '游乐场'] }
  ];

  // 生成 20-40 个随机 POI
  const count = Math.floor(Math.random() * 20) + 20;
  const pois = [];

  for (let i = 0; i < count; i++) {
    const poiType = poiTypes[Math.floor(Math.random() * poiTypes.length)];
    const name = poiType.names[Math.floor(Math.random() * poiType.names.length)];

    // 在中心点附近随机偏移（根据半径计算）
    const offsetLat = (Math.random() - 0.5) * (radius / 111000); // 1度纬度约111km
    const offsetLng = (Math.random() - 0.5) * (radius / 111000 / Math.cos(lat * Math.PI / 180));

    pois.push({
      id: `poi_${Date.now()}_${i}`,
      name: `${name}(${Math.floor(Math.random() * 100) + 1}号店)`,
      type: poiType.type,
      typeName: poiType.typeName,
      latitude: lat + offsetLat,
      longitude: lng + offsetLng,
      address: `某某路${Math.floor(Math.random() * 999) + 1}号`,
      distance: Math.floor(Math.random() * radius)
    });
  }

  // 按距离排序
  pois.sort((a, b) => a.distance - b.distance);

  res.json({ pois });
});

// 逆地理编码 API（根据经纬度获取地点名称）
app.get('/api/geocode/reverse', (req, res) => {
  const location = req.query.location; // "lng,lat"

  if (!location) {
    return res.status(400).json({ error: '缺少 location 参数' });
  }

  const [lng, lat] = location.split(',').map(parseFloat);

  // 模拟逆地理编码（实际项目中应调用高德 API）
  // 根据经纬度返回一个模拟的地点名称
  const cities = [
    { name: '北京', latRange: [39.5, 41], lngRange: [115.5, 117.5] },
    { name: '上海', latRange: [30.5, 31.5], lngRange: [121, 122] },
    { name: '广州', latRange: [22.5, 23.5], lngRange: [113, 113.8] },
    { name: '深圳', latRange: [22.4, 22.9], lngRange: [113.8, 114.5] },
    { name: '杭州', latRange: [30, 30.5], lngRange: [120, 120.5] },
    { name: '成都', latRange: [30.5, 31], lngRange: [103.8, 104.2] },
    { name: '武汉', latRange: [30.3, 30.8], lngRange: [114, 114.5] },
    { name: '西安', latRange: [34.2, 34.4], lngRange: [108.8, 109.1] },
    { name: '南京', latRange: [31.9, 32.2], lngRange: [118.6, 119] },
    { name: '重庆', latRange: [29.4, 29.8], lngRange: [106.3, 106.7] },
  ];

  let cityName = '未知城市';
  for (const city of cities) {
    if (lat >= city.latRange[0] && lat <= city.latRange[1] &&
        lng >= city.lngRange[0] && lng <= city.lngRange[1]) {
      cityName = city.name;
      break;
    }
  }

  // 生成模拟的详细地址
  const streets = ['中山路', '人民路', '解放路', '建设路', '和平路', '光明路', '幸福路', '文化路'];
  const street = streets[Math.floor(Math.random() * streets.length)];
  const number = Math.floor(Math.random() * 999) + 1;

  const address = `${cityName}市某区${street}${number}号`;

  res.json({
    status: '1',
    info: 'OK',
    regeocode: {
      formatted_address: address,
      addressComponent: {
        city: cityName,
        district: '某区',
        street: street,
        number: number + '号'
      }
    }
  });
});

// 启动服务器
const HOST = '0.0.0.0'; // 监听所有网络接口
app.listen(PORT, HOST, () => {
  console.log(`🚀 TapSpot API server running on port ${PORT}`);
  console.log(`📊 Total spots: ${spots.length}`);
  console.log(`💬 Total reviews: ${reviews.length}`);
  console.log(`🌍 Countries: ${new Set(spots.map(spot => spot.country)).size}`);
  console.log(`🔗 API Base URL: http://${HOST}:${PORT}/api/v1`);
  console.log(`🌐 网络访问: http://10.4.0.3:${PORT}/api/v1`);
});
