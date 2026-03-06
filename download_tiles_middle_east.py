#!/usr/bin/env python3
"""
高德地图瓦片下载脚本 - 中东地区
下载中东地区（伊朗、伊拉克、沙特阿拉伯等）的地图瓦片（缩放级别 1-10）
"""

import os
import requests
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import math

# 高德瓦片 URL 模板
URL_TEMPLATE = "https://webrd0{}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={}&y={}&z={}"

# 输出目录
OUTPUT_DIR = "/root/.openclaw/workspace/TapSpot/tiles"

# 中东地区范围（Web 墨卡托坐标）
# 经度：35°E - 65°E (覆盖伊朗、伊拉克、沙特、阿联酋、土耳其东部等)
# 纬度：12°N - 42°N (覆盖土耳其南部到也门)

def get_tile_range(zoom, region="middle_east"):
    """根据缩放级别和地区计算瓦片坐标范围"""
    
    n = 2 ** zoom
    
    # 经度转瓦片 X
    def lon_to_x(lon):
        return int((lon + 180) / 360 * n)
    
    # 纬度转瓦片 Y (Web 墨卡托)
    def lat_to_y(lat):
        lat_rad = math.radians(lat)
        return int((1 - math.log(math.tan(lat_rad) + 1/math.cos(lat_rad)) / math.pi) / 2 * n)
    
    if region == "middle_east":
        # 中东地区：35°E-65°E, 12°N-42°N
        min_x = lon_to_x(35.0)
        max_x = lon_to_x(65.0) + 1
        min_y = lat_to_y(42.0)
        max_y = lat_to_y(12.0) + 1
    elif region == "china":
        # 中国地区：73°E-135°E, 18°N-54°N
        min_x = lon_to_x(73.0)
        max_x = lon_to_x(135.0) + 1
        min_y = lat_to_y(54.0)
        max_y = lat_to_y(18.0) + 1
    else:
        # 全球范围（慎用）
        min_x = 0
        max_x = n
        min_y = 0
        max_y = n
    
    return min_x, max_x, min_y, max_y

def download_tile(z, x, y, retry=3):
    """下载单个瓦片"""
    dir_path = os.path.join(OUTPUT_DIR, str(z), str(x))
    file_path = os.path.join(dir_path, f"{y}.png")
    
    # 已存在则跳过
    if os.path.exists(file_path):
        return True, "exists"
    
    try:
        os.makedirs(dir_path, exist_ok=True)
    except Exception as e:
        return False, f"mkdir failed: {e}"
    
    # 轮询服务器 1-4
    server = (x + y) % 4 + 1
    url = URL_TEMPLATE.format(server, x, y, z)
    
    for attempt in range(retry):
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.amap.com/'
            }
            resp = requests.get(url, headers=headers, timeout=15)
            if resp.status_code == 200:
                with open(file_path, 'wb') as f:
                    f.write(resp.content)
                return True, "downloaded"
            else:
                time.sleep(0.5)
        except Exception as e:
            if attempt < retry - 1:
                time.sleep(1)
    
    return False, f"failed after {retry} attempts"

def download_zoom_level(zoom, region="middle_east", max_workers=10):
    """下载指定缩放级别和地区的所有瓦片"""
    min_x, max_x, min_y, max_y = get_tile_range(zoom, region)
    total = (max_x - min_x) * (max_y - min_y)
    
    region_name = "中东" if region == "middle_east" else "中国"
    print(f"\n【{region_name}】缩放级别 {zoom}: X[{min_x}-{max_x}] Y[{min_y}-{max_y}] 共 {total} 个瓦片")
    
    downloaded = 0
    exists = 0
    failed = 0
    
    tasks = []
    for x in range(min_x, max_x):
        for y in range(min_y, max_y):
            tasks.append((zoom, x, y))
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(download_tile, z, x, y): (x, y) for z, x, y in tasks}
        
        for i, future in enumerate(as_completed(futures)):
            success, status = future.result()
            if success:
                if status == "downloaded":
                    downloaded += 1
                else:
                    exists += 1
            else:
                failed += 1
            
            # 进度显示
            if (i + 1) % 100 == 0 or i + 1 == total:
                print(f"  进度：{i+1}/{total} (下载:{downloaded} 已存在:{exists} 失败:{failed})")
    
    return downloaded, exists, failed

def main():
    print("=" * 60)
    print("高德地图瓦片下载器 - 中东地区 + 中国")
    print("=" * 60)
    print(f"输出目录：{OUTPUT_DIR}")
    print("缩放级别：1-10")
    print("覆盖区域：中东 (伊朗/伊拉克/沙特等) + 中国")
    print()
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    total_stats = {"downloaded": 0, "exists": 0, "failed": 0}
    
    start_time = time.time()
    
    # 先下载中东地区
    print("\n>>> 开始下载【中东地区】瓦片...")
    for zoom in range(1, 11):
        downloaded, exists, failed = download_zoom_level(zoom, region="middle_east", max_workers=20)
        total_stats["downloaded"] += downloaded
        total_stats["exists"] += exists
        total_stats["failed"] += failed
    
    # 再下载中国地区（补充）
    print("\n>>> 开始下载【中国地区】瓦片...")
    for zoom in range(1, 11):
        downloaded, exists, failed = download_zoom_level(zoom, region="china", max_workers=20)
        total_stats["downloaded"] += downloaded
        total_stats["exists"] += exists
        total_stats["failed"] += failed
    
    elapsed = time.time() - start_time
    
    print("\n" + "=" * 60)
    print("✅ 下载完成！")
    print(f"总耗时：{elapsed:.1f} 秒 ({elapsed/60:.1f} 分钟)")
    print(f"新下载：{total_stats['downloaded']} 个瓦片")
    print(f"已存在：{total_stats['exists']} 个瓦片")
    print(f"失败：{total_stats['failed']} 个瓦片")
    print("=" * 60)

if __name__ == "__main__":
    main()
