#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
深圳游玩助手 — 单文件 Python 脚本
功能：
  - 获取深圳实时天气（模拟 + 可扩展真实 API）
  - 推荐适合天气的景点/商场
  - 生成结构化一日游玩计划
  - 输出 Markdown 或纯文本

使用方式：
  $ python shenzhen_tour.py
  $ python shenzhen_tour.py --text      # 纯文本输出
  $ python shenzhen_tour.py --json      # JSON 格式输出

作者: momo（由用户创建）
"""

import sys
import json
import argparse
from datetime import datetime
from typing import List, Dict, Optional

# === 内置景点数据（精简版，可扩展）===
VENUES = [
    {
        "id": "sz001",
        "name": "深圳湾公园",
        "type": "scenic",
        "tags": ["outdoor", "free", "view", "sunset"],
        "description": "滨海长廊，可远眺香港，适合散步、骑行、看日落。晴天首选。",
        "best_weather": ["晴", "多云"]
    },
    {
        "id": "sz002",
        "name": "华侨城创意文化园 (OCT-LOFT)",
        "type": "cultural",
        "tags": ["outdoor", "indoor", "art", "cafe"],
        "description": "旧厂房改造的艺术区，展览+咖啡+手作店聚集地，雨天也有大量室内空间。",
        "best_weather": ["晴", "多云", "小雨"]
    },
    {
        "id": "sz003",
        "name": "万象天地",
        "type": "mall",
        "tags": ["indoor", "luxury", "dining", "photo"],
        "description": "开放式高端商场，设计感强，网红打卡地，餐饮丰富，全天候舒适。",
        "best_weather": ["任何天气"]
    },
    {
        "id": "sz004",
        "name": "世界之窗",
        "type": "attraction",
        "tags": ["outdoor", "ticket", "family"],
        "description": "微缩世界景观主题公园，适合家庭出游；雨天部分区域受限。",
        "best_weather": ["晴", "多云"]
    },
    {
        "id": "sz005",
        "name": "海上世界",
        "type": "scenic",
        "tags": ["outdoor", "night", "dining", "view"],
        "description": "“明华轮”为核心，集购物、餐饮、夜景于一体，傍晚至夜间最出片。",
        "best_weather": ["晴", "多云"]
    },
    {
        "id": "sz006",
        "name": "深圳博物馆",
        "type": "cultural",
        "tags": ["indoor", "free", "education"],
        "description": "免费开放，了解深圳历史与岭南文化，空调充足，雨天理想选择。",
        "best_weather": ["任何天气"]
    },
    {
        "id": "sz007",
        "name": "大梅沙海滨公园",
        "type": "scenic",
        "tags": ["outdoor", "beach", "summer"],
        "description": "深圳著名海滩，夏季戏水胜地；非夏季/雨天不推荐。",
        "best_weather": ["晴", "高温"]
    },
    {
        "id": "sz008",
        "name": "COCO Park",
        "type": "mall",
        "tags": ["indoor", "fashion", "dining", "entertainment"],
        "description": "福田核心商圈，品牌全、影院+电玩+美食一站式，通勤便利。",
        "best_weather": ["任何天气"]
    }
]

def get_simulated_weather() -> Dict:
    """模拟深圳实时天气（实际可替换为 requests.get('https://api.open-meteo.com/...')）"""
    return {
        "location": "深圳",
        "temp": 22,
        "condition": "多云",
        "humidity": 65,
        "windSpeed": 12,
        "precipitation": 10,
        "uvIndex": 5,
        "feelsLike": 23,
        "timestamp": datetime.now().isoformat()
    }

def filter_venues_by_weather(venues: List[Dict], weather: Dict) -> List[Dict]:
    condition = weather["condition"]
    precipitation = weather["precipitation"]
    is_rainy = precipitation > 30
    is_sunny = "晴" in condition
    is_cloudy = "云" in condition

    candidates = []
    for v in venues:
        # 强制排除雨天户外（除非有 indoor 标签）
        if is_rainy and "indoor" not in v["tags"] and "任何天气" not in v["best_weather"]:
            continue
        # 优先保留兼容项
        if "任何天气" in v["best_weather"]:
            candidates.append(v)
            continue
        if any(w in condition or w == "多云" for w in v["best_weather"]):
            candidates.append(v)

    # 去重类型：确保 mall / scenic / cultural 各至少1个
    by_type = {}
    for v in candidates:
        if v["type"] not in by_type:
            by_type[v["type"]] = v
    return list(by_type.values())[:4]

def generate_markdown_plan(weather: Dict, recommended: List[Dict]) -> str:
    items = []
    for i, v in enumerate(recommended, 1):
        items.append(f"{i}. {v['name']} — {v['description']}")

    plan = "\n".join(items) if items else "暂无推荐地点"

    return f"""🌤️ 【今日深圳天气】  
- 温度: {weather['temp']}°C  
- 天气: {weather['condition']}  
- 湿度: {weather['humidity']}%  
- 风速: {weather['windSpeed']} km/h  
- 降水概率: {weather['precipitation']}%  
- 体感温度: {weather['feelsLike']}°C  

🎯 【推荐行程】  
{plan}

💡 小贴士：建议携带轻便外套；地铁覆盖广，推荐使用「深圳通」APP扫码乘车。
"""

def main():
    parser = argparse.ArgumentParser(description="深圳游玩助手")
    parser.add_argument("--text", action="store_true", help="输出纯文本")
    parser.add_argument("--json", action="store_true", help="输出 JSON")
    args = parser.parse_args()

    weather = get_simulated_weather()
    recommended = filter_venues_by_weather(VENUES, weather)
    md_plan = generate_markdown_plan(weather, recommended)

    if args.json:
        output = {
            "weather": weather,
            "recommendations": [v["name"] for v in recommended],
            "plan_markdown": md_plan,
            "timestamp": datetime.now().isoformat()
        }
        print(json.dumps(output, ensure_ascii=False, indent=2))
    elif args.text:
        # 简化为纯文本
        lines = md_plan.split('\n')
        text_plan = '\n'.join([line.strip('📌✅💡🎯🌤️') for line in lines if not line.startswith('```')])
        print(text_plan)
    else:
        print(md_plan)

if __name__ == "__main__":
    main()