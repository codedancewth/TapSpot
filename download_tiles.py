#!/usr/bin/env python3
"""
高德地图瓦片下载脚本 - XYZ标准格式
只下载中国区域 (经度 73-135, 纬度 18-54)
"""

import os
import requests
import time
import math
from concurrent.futures import ThreadPoolExecutor, as_completed

OUTPUT_DIR = "/root/.openclaw/workspace/TapSpot/tiles"

def latlon_to_tile(lat, lon, zoom):
    """经纬度转瓦片坐标"""
    n = 2 ** zoom
    x = int((lon + 180) / 360 * n)
    lat_rad = math.radians(lat)
    y = int((1 - math.asinh(math.tan(lat_rad)) / math.pi) / 2 * n)
    return x, y

def get_tile_range(zoom):
    """计算中国范围瓦片坐标"""
    # 中国范围: 经度73-135, 纬度18-54
    x_min, y_min = latlon_to_tile(54, 73, zoom)  # 西北角
    x_max, y_max = latlon_to_tile(18, 135, zoom)  # 东南角
    return x_min, x_max, min(y_min, y_max), max(y_min, y_max)

def download_tile(z, x, y, retry=3):
    """下载单个瓦片"""
    # 高德瓦片URL - XYZ标准格式
    server = (x + y) % 4  # 负载均衡
    url = f"https://webrd0{server}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
    
    dir_path = os.path.join(OUTPUT_DIR, str(z), str(x))
    file_path = os.path.join(dir_path, f"{y}.png")
    
    if os.path.exists(file_path):
        return None  # 已存在
    
    for attempt in range(retry):
        try:
            resp = requests.get(url, timeout=10, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://gaode.com/'
            })
            if resp.status_code == 200 and len(resp.content) > 100:
                os.makedirs(dir_path, exist_ok=True)
                with open(file_path, 'wb') as f:
                    f.write(resp.content)
                return True
        except:
            pass
        time.sleep(0.1)
    return False

def main():
    # 缩放级别 1-10
    zooms = range(1, 11)
    
    total = 0
    success = 0
    
    for z in zooms:
        x_min, x_max, y_min, y_max = get_tile_range(z)
        tiles_in_zoom = (x_max - x_min + 1) * (y_max - y_min + 1)
        print(f"Zoom {z}: x={x_min}-{x_max}, y={y_min}-{y_max}, 共 {tiles_in_zoom} 个瓦片")
        total += tiles_in_zoom
    
    print(f"\n总计: {total} 个瓦片")
    print("开始下载...\n")
    
    for z in zooms:
        x_min, x_max, y_min, y_max = get_tile_range(z)
        
        tasks = []
        for x in range(x_min, x_max + 1):
            for y in range(y_min, y_max + 1):
                tasks.append((z, x, y))
        
        z_success = 0
        with ThreadPoolExecutor(max_workers=20) as executor:
            futures = {executor.submit(download_tile, z, x, y): (x, y) for z, x, y in tasks}
            for future in as_completed(futures):
                result = future.result()
                if result:
                    z_success += 1
                    success += 1
        
        print(f"Zoom {z} 完成: {z_success}/{len(tasks)}")

    print(f"\n下载完成: {success}/{total}")

if __name__ == "__main__":
    main()
