#!/usr/bin/env python3
"""
高德地图瓦片下载脚本
下载全中国范围的地图瓦片（缩放级别1-10）
"""

import os
import requests
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

# 高德瓦片URL模板
URL_TEMPLATE = "https://webrd0{}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={}&y={}&z={}"

# 输出目录
OUTPUT_DIR = "/root/.openclaw/workspace/TapSpot/tiles"

# 中国范围大致边界（Web墨卡托坐标）
# 经度: 73°E - 135°E
# 纬度: 18°N - 54°N

def get_tile_range(zoom):
    """根据缩放级别计算中国范围内的瓦片坐标范围"""
    # 简化计算：中国大致范围
    # X: 73°E - 135°E
    # Y: 18°N - 54°N
    
    n = 2 ** zoom
    
    # 经度转瓦片X
    min_x = int((73.0 + 180) / 360 * n)
    max_x = int((135.0 + 180) / 360 * n) + 1
    
    # 纬度转瓦片Y (Web墨卡托)
    import math
    def lat_to_y(lat):
        lat_rad = math.radians(lat)
        return int((1 - math.log(math.tan(lat_rad) + 1/math.cos(lat_rad)) / math.pi) / 2 * n)
    
    min_y = lat_to_y(54.0)
    max_y = lat_to_y(18.0) + 1
    
    return min_x, max_x, min_y, max_y

def download_tile(z, x, y, retry=3):
    """下载单个瓦片"""
    dir_path = os.path.join(OUTPUT_DIR, str(z), str(x))
    file_path = os.path.join(dir_path, f"{y}.png")
    
    # 已存在则跳过
    if os.path.exists(file_path):
        return True, "exists"
    
    os.makedirs(dir_path, exist_ok=True)
    
    # 轮询服务器 1-4
    server = (x + y) % 4 + 1
    url = URL_TEMPLATE.format(server, x, y, z)
    
    for attempt in range(retry):
        try:
            resp = requests.get(url, timeout=10)
            if resp.status_code == 200:
                with open(file_path, 'wb') as f:
                    f.write(resp.content)
                return True, "downloaded"
            else:
                time.sleep(0.5)
        except Exception as e:
            time.sleep(1)
    
    return False, f"failed after {retry} attempts"

def download_zoom_level(zoom, max_workers=10):
    """下载指定缩放级别的所有瓦片"""
    min_x, max_x, min_y, max_y = get_tile_range(zoom)
    total = (max_x - min_x) * (max_y - min_y)
    
    print(f"\n缩放级别 {zoom}: X[{min_x}-{max_x}] Y[{min_y}-{max_y}] 共 {total} 个瓦片")
    
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
                print(f"  进度: {i+1}/{total} (下载:{downloaded} 已存在:{exists} 失败:{failed})")
    
    return downloaded, exists, failed

def main():
    print("=" * 50)
    print("高德地图瓦片下载器 - 全中国范围")
    print("=" * 50)
    print(f"输出目录: {OUTPUT_DIR}")
    print("缩放级别: 1-10")
    print()
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    total_stats = {"downloaded": 0, "exists": 0, "failed": 0}
    
    start_time = time.time()
    
    for zoom in range(1, 11):  # 缩放级别1-10
        downloaded, exists, failed = download_zoom_level(zoom, max_workers=20)
        total_stats["downloaded"] += downloaded
        total_stats["exists"] += exists
        total_stats["failed"] += failed
    
    elapsed = time.time() - start_time
    
    print("\n" + "=" * 50)
    print("下载完成！")
    print(f"总耗时: {elapsed:.1f} 秒")
    print(f"新下载: {total_stats['downloaded']}")
    print(f"已存在: {total_stats['exists']}")
    print(f"失败: {total_stats['failed']}")
    print("=" * 50)

if __name__ == "__main__":
    main()
