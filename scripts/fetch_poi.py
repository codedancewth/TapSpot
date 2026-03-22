#!/usr/bin/env python3
"""
生成中国主要城市真实 POI 数据（离线 JSON）
"""
import json
import math
import os

# 真实 POI 数据集
POI_DATA = {
    "北京": [
        {"name": "故宫博物院", "type": "scenic", "lat": 39.9163, "lng": 116.3972, "address": "东城区景山前街4号", "district": "东城区"},
        {"name": "天安门广场", "type": "scenic", "lat": 39.9075, "lng": 116.3912, "address": "东城区西长安街", "district": "东城区"},
        {"name": "八达岭长城", "type": "scenic", "lat": 40.3592, "lng": 116.0203, "address": "延庆区八达岭镇", "district": "延庆区"},
        {"name": "颐和园", "type": "scenic", "lat": 39.9993, "lng": 116.4661, "address": "海淀区新建宫门路19号", "district": "海淀区"},
        {"name": "天坛公园", "type": "scenic", "lat": 39.8829, "lng": 116.4106, "address": "东城区天坛内东里7号", "district": "东城区"},
        {"name": "北海公园", "type": "scenic", "lat": 39.9289, "lng": 116.3905, "address": "西城区文津街1号", "district": "西城区"},
        {"name": "南锣鼓巷", "type": "scenic", "lat": 39.9339, "lng": 116.4032, "address": "东城区南锣鼓巷", "district": "东城区"},
        {"name": "三里屯太古里", "type": "shopping", "lat": 39.9354, "lng": 116.4520, "address": "朝阳区三里屯路19号", "district": "朝阳区"},
        {"name": "王府井步行街", "type": "shopping", "lat": 39.9148, "lng": 116.4100, "address": "东城区王府井大街", "district": "东城区"},
        {"name": "国家体育场(鸟巢)", "type": "scenic", "lat": 39.9905, "lng": 116.3975, "address": "朝阳区国家体育场南路1号", "district": "朝阳区"},
        {"name": "水立方", "type": "swim", "lat": 39.9923, "lng": 116.3936, "address": "朝阳区天辰东路11号", "district": "朝阳区"},
        {"name": "后海酒吧街", "type": "entertainment", "lat": 39.9373, "lng": 116.3978, "address": "西城区后海", "district": "西城区"},
        {"name": "全聚德烤鸭", "type": "food", "lat": 39.9042, "lng": 116.4074, "address": "东城区前门大街30号", "district": "东城区"},
        {"name": "北京华尔道夫酒店", "type": "hotel", "lat": 39.9128, "lng": 116.4180, "address": "东城区王府井金宝街8号", "district": "东城区"},
    ],
    "上海": [
        {"name": "外滩", "type": "scenic", "lat": 31.2397, "lng": 121.4900, "address": "黄浦区中山东一路", "district": "黄浦区"},
        {"name": "东方明珠塔", "type": "scenic", "lat": 31.2397, "lng": 121.4995, "address": "浦东新区世纪大道1号", "district": "浦东新区"},
        {"name": "豫园", "type": "scenic", "lat": 31.2279, "lng": 121.4899, "address": "黄浦区豫园老街279号", "district": "黄浦区"},
        {"name": "南京路步行街", "type": "shopping", "lat": 31.2352, "lng": 121.4741, "address": "黄浦区南京东路", "district": "黄浦区"},
        {"name": "迪士尼乐园", "type": "entertainment", "lat": 31.1430, "lng": 121.6580, "address": "浦东新区川沙新镇", "district": "浦东新区"},
        {"name": "新天地", "type": "shopping", "lat": 31.2215, "lng": 121.4765, "address": "黄浦区太仓路181号", "district": "黄浦区"},
        {"name": "静安寺", "type": "scenic", "lat": 31.2295, "lng": 121.4542, "address": "静安区南京西路1686号", "district": "静安区"},
        {"name": "城隍庙", "type": "food", "lat": 31.2276, "lng": 121.4904, "address": "黄浦区方浜中路249号", "district": "黄浦区"},
        {"name": "上海半岛酒店", "type": "hotel", "lat": 31.2332, "lng": 121.4821, "address": "黄浦区广东路20号", "district": "黄浦区"},
        {"name": "上海外滩W酒店", "type": "hotel", "lat": 31.2408, "lng": 121.4950, "address": "浦东新区浦明路88号", "district": "浦东新区"},
    ],
    "广州": [
        {"name": "广州塔", "type": "scenic", "lat": 23.1064, "lng": 113.3190, "address": "海珠区阅江中路222号", "district": "海珠区"},
        {"name": "珠江夜游", "type": "swim", "lat": 23.1137, "lng": 113.3255, "address": "越秀区沿江东路", "district": "越秀区"},
        {"name": "白云山", "type": "scenic", "lat": 23.1863, "lng": 113.2650, "address": "白云区广园中路801号", "district": "白云区"},
        {"name": "长隆野生动物世界", "type": "scenic", "lat": 22.9752, "lng": 113.3482, "address": "番禺区大石镇", "district": "番禺区"},
        {"name": "沙面", "type": "scenic", "lat": 23.1235, "lng": 113.2443, "address": "荔湾区沙面南街", "district": "荔湾区"},
        {"name": "上下九步行街", "type": "shopping", "lat": 23.1197, "lng": 113.2491, "address": "荔湾区下九路", "district": "荔湾区"},
        {"name": "太古汇", "type": "shopping", "lat": 23.1346, "lng": 113.3666, "address": "天河区天河路383号", "district": "天河区"},
        {"name": "陶陶居", "type": "food", "lat": 23.1206, "lng": 113.2581, "address": "荔湾区第十甫路22号", "district": "荔湾区"},
        {"name": "广州四季酒店", "type": "hotel", "lat": 23.1180, "lng": 113.3188, "address": "天河区珠江西路5号", "district": "天河区"},
    ],
    "深圳": [
        {"name": "世界之窗", "type": "scenic", "lat": 22.5408, "lng": 113.9730, "address": "南山区深南大道9037号", "district": "南山区"},
        {"name": "欢乐谷", "type": "entertainment", "lat": 22.5420, "lng": 113.9805, "address": "南山区侨城西街18号", "district": "南山区"},
        {"name": "东部华侨城", "type": "scenic", "lat": 22.6196, "lng": 114.2387, "address": "盐田区大梅沙", "district": "盐田区"},
        {"name": "深圳湾公园", "type": "scenic", "lat": 22.4972, "lng": 113.9510, "address": "南山区深圳湾畔", "district": "南山区"},
        {"name": "大梅沙海滨公园", "type": "swim", "lat": 22.5930, "lng": 114.2790, "address": "盐田区大梅沙盐梅路", "district": "盐田区"},
        {"name": "东门步行街", "type": "shopping", "lat": 22.5556, "lng": 114.1314, "address": "罗湖区东门老街", "district": "罗湖区"},
        {"name": "Coco Park", "type": "shopping", "lat": 22.5412, "lng": 114.0555, "address": "福田区福华路", "district": "福田区"},
        {"name": "深圳香格里拉大酒店", "type": "hotel", "lat": 22.5430, "lng": 114.0610, "address": "罗湖区建设路1002号", "district": "罗湖区"},
    ],
    "成都": [
        {"name": "大熊猫基地", "type": "scenic", "lat": 30.7329, "lng": 104.1451, "address": "成华区外北熊猫大道1375号", "district": "成华区"},
        {"name": "宽窄巷子", "type": "scenic", "lat": 30.6634, "lng": 104.0537, "address": "青羊区长顺街附近", "district": "青羊区"},
        {"name": "锦里古街", "type": "scenic", "lat": 30.6572, "lng": 104.0580, "address": "武侯区武侯祠大街231号", "district": "武侯区"},
        {"name": "春熙路", "type": "shopping", "lat": 30.6572, "lng": 104.0795, "address": "锦江区春熙路", "district": "锦江区"},
        {"name": "太古里", "type": "shopping", "lat": 30.6598, "lng": 104.0915, "address": "锦江区大慈寺路", "district": "锦江区"},
        {"name": "九眼桥酒吧街", "type": "entertainment", "lat": 30.6394, "lng": 104.0735, "address": "锦江区九眼桥", "district": "锦江区"},
        {"name": "小龙坎火锅", "type": "food", "lat": 30.6637, "lng": 104.0655, "address": "锦江区东大街99号", "district": "锦江区"},
        {"name": "都江堰景区", "type": "scenic", "lat": 30.9988, "lng": 103.6133, "address": "都江堰市公园路90号", "district": "都江堰市"},
        {"name": "青城山", "type": "scenic", "lat": 30.8853, "lng": 103.5292, "address": "都江堰市青城山镇", "district": "都江堰市"},
        {"name": "成都香格里拉大酒店", "type": "hotel", "lat": 30.6548, "lng": 104.0630, "address": "锦江区滨江东路9号", "district": "锦江区"},
    ],
    "杭州": [
        {"name": "西湖", "type": "scenic", "lat": 30.2441, "lng": 120.1488, "address": "西湖区西湖", "district": "西湖区"},
        {"name": "断桥残雪", "type": "scenic", "lat": 30.2580, "lng": 120.1520, "address": "西湖区北山街", "district": "西湖区"},
        {"name": "雷峰塔", "type": "scenic", "lat": 30.2312, "lng": 120.1485, "address": "西湖区南山路15号", "district": "西湖区"},
        {"name": "灵隐寺", "type": "scenic", "lat": 30.2371, "lng": 120.1031, "address": "西湖区灵隐路法云弄1号", "district": "西湖区"},
        {"name": "宋城", "type": "entertainment", "lat": 30.1917, "lng": 120.1425, "address": "西湖区之江路148号", "district": "西湖区"},
        {"name": "河坊街", "type": "scenic", "lat": 30.2506, "lng": 120.1470, "address": "上城区河坊街", "district": "上城区"},
        {"name": "西溪湿地公园", "type": "scenic", "lat": 30.1656, "lng": 120.0647, "address": "西湖区天目山路518号", "district": "西湖区"},
        {"name": "千岛湖", "type": "swim", "lat": 29.9833, "lng": 119.0167, "address": "淳安县千岛湖镇", "district": "淳安县"},
        {"name": "杭州西子湖四季酒店", "type": "hotel", "lat": 30.2365, "lng": 120.1355, "address": "西湖区灵隐路5号", "district": "西湖区"},
    ],
    "重庆": [
        {"name": "洪崖洞", "type": "scenic", "lat": 29.5647, "lng": 106.5784, "address": "渝中区嘉滨路88号", "district": "渝中区"},
        {"name": "解放碑", "type": "shopping", "lat": 29.5589, "lng": 106.5782, "address": "渝中区解放碑", "district": "渝中区"},
        {"name": "长江索道", "type": "scenic", "lat": 29.5538, "lng": 106.5872, "address": "渝中区新华路151号", "district": "渝中区"},
        {"name": "磁器口古镇", "type": "scenic", "lat": 29.5795, "lng": 106.4498, "address": "沙坪坝区磁器口街道", "district": "沙坪坝区"},
        {"name": "武隆天生三桥", "type": "scenic", "lat": 29.4105, "lng": 107.8945, "address": "武隆区仙女山镇", "district": "武隆区"},
        {"name": "观音桥步行街", "type": "shopping", "lat": 29.5762, "lng": 106.4672, "address": "江北区观音桥", "district": "江北区"},
        {"name": "重庆火锅", "type": "food", "lat": 29.5580, "lng": 106.5800, "address": "渝中区八一路", "district": "渝中区"},
        {"name": "重庆威斯汀酒店", "type": "hotel", "lat": 29.5580, "lng": 106.5830, "address": "渝中区新华路222号", "district": "渝中区"},
    ],
    "武汉": [
        {"name": "黄鹤楼", "type": "scenic", "lat": 30.5494, "lng": 114.3072, "address": "武昌区蛇山西山坡特1号", "district": "武昌区"},
        {"name": "东湖风景区", "type": "scenic", "lat": 30.5545, "lng": 114.3908, "address": "武昌区东湖路特1号", "district": "武昌区"},
        {"name": "户部巷", "type": "food", "lat": 30.5430, "lng": 114.2755, "address": "武昌区户部巷", "district": "武昌区"},
        {"name": "楚河汉街", "type": "shopping", "lat": 30.5660, "lng": 114.3110, "address": "武昌区中北路", "district": "武昌区"},
        {"name": "武汉香格里拉大酒店", "type": "hotel", "lat": 30.5865, "lng": 114.3015, "address": "江岸区汉口滨江路", "district": "江岸区"},
    ],
    "西安": [
        {"name": "秦始皇兵马俑", "type": "scenic", "lat": 34.3848, "lng": 109.2734, "address": "临潼区秦始皇帝陵博物院", "district": "临潼区"},
        {"name": "大雁塔", "type": "scenic", "lat": 34.2190, "lng": 108.9633, "address": "雁塔区慈恩路1号", "district": "雁塔区"},
        {"name": "大唐芙蓉园", "type": "scenic", "lat": 34.2055, "lng": 108.9742, "address": "雁塔区芙蓉西路99号", "district": "雁塔区"},
        {"name": "西安城墙", "type": "scenic", "lat": 34.2658, "lng": 108.9432, "address": "碑林区城墙", "district": "碑林区"},
        {"name": "回民街", "type": "food", "lat": 34.2619, "lng": 108.9436, "address": "莲湖区北院门街道", "district": "莲湖区"},
        {"name": "大唐不夜城", "type": "scenic", "lat": 34.2062, "lng": 108.9482, "address": "雁塔区慈恩路", "district": "雁塔区"},
        {"name": "钟楼", "type": "scenic", "lat": 34.2625, "lng": 108.9431, "address": "碑林区东大街和南大街交汇处", "district": "碑林区"},
        {"name": "西安香格里拉大酒店", "type": "hotel", "lat": 34.2580, "lng": 108.9530, "address": "莲湖区大庆路88号", "district": "莲湖区"},
    ],
    "南京": [
        {"name": "中山陵", "type": "scenic", "lat": 31.8788, "lng": 118.8579, "address": "玄武区中山陵", "district": "玄武区"},
        {"name": "夫子庙", "type": "scenic", "lat": 32.0175, "lng": 118.7845, "address": "秦淮区贡院街152号", "district": "秦淮区"},
        {"name": "明孝陵", "type": "scenic", "lat": 31.8917, "lng": 118.8556, "address": "玄武区中山陵风景区内", "district": "玄武区"},
        {"name": "南京总统府", "type": "scenic", "lat": 32.0289, "lng": 118.7834, "address": "玄武区长江路292号", "district": "玄武区"},
        {"name": "新街口", "type": "shopping", "lat": 32.0400, "lng": 118.7830, "address": "玄武区中山路", "district": "玄武区"},
        {"name": "南京香格里拉大酒店", "type": "hotel", "lat": 32.0280, "lng": 118.7880, "address": "玄武区中央路329号", "district": "玄武区"},
    ],
    "苏州": [
        {"name": "拙政园", "type": "scenic", "lat": 31.3231, "lng": 120.6220, "address": "姑苏区东北街178号", "district": "姑苏区"},
        {"name": "平江路", "type": "scenic", "lat": 31.3187, "lng": 120.6358, "address": "姑苏区平江路", "district": "姑苏区"},
        {"name": "苏州博物馆", "type": "scenic", "lat": 31.3221, "lng": 120.6269, "address": "姑苏区东北街204号", "district": "姑苏区"},
        {"name": "周庄古镇", "type": "scenic", "lat": 31.1163, "lng": 120.8477, "address": "昆山市周庄镇", "district": "昆山市"},
        {"name": "同里古镇", "type": "scenic", "lat": 31.0896, "lng": 120.7414, "address": "吴江区同里镇", "district": "吴江区"},
        {"name": "苏州香格里拉大酒店", "type": "hotel", "lat": 31.3245, "lng": 120.6310, "address": "姑苏区塔倪路9号", "district": "姑苏区"},
    ],
    "青岛": [
        {"name": "栈桥", "type": "scenic", "lat": 36.0680, "lng": 120.3025, "address": "市南区太平路14号", "district": "市南区"},
        {"name": "八大关风景区", "type": "scenic", "lat": 36.0480, "lng": 120.3058, "address": "市南区武胜关路", "district": "市南区"},
        {"name": "崂山", "type": "scenic", "lat": 36.1030, "lng": 120.4860, "address": "崂山区崂山路", "district": "崂山区"},
        {"name": "金沙滩", "type": "swim", "lat": 36.0583, "lng": 120.3156, "address": "黄岛区金沙滩路", "district": "黄岛区"},
        {"name": "青岛啤酒街", "type": "food", "lat": 36.0680, "lng": 120.3720, "address": "市北区登州路", "district": "市北区"},
        {"name": "五四广场", "type": "scenic", "lat": 36.0650, "lng": 120.3825, "address": "市南区东海西路", "district": "市南区"},
    ],
    "厦门": [
        {"name": "鼓浪屿", "type": "scenic", "lat": 24.4449, "lng": 118.0678, "address": "思明区鼓浪屿", "district": "思明区"},
        {"name": "厦门大学", "type": "scenic", "lat": 24.4345, "lng": 118.0926, "address": "思明区思明南路422号", "district": "思明区"},
        {"name": "曾厝垵", "type": "scenic", "lat": 24.4493, "lng": 118.0593, "address": "思明区曾厝垵", "district": "思明区"},
        {"name": "环岛路", "type": "scenic", "lat": 24.4600, "lng": 118.1000, "address": "思明区环岛路", "district": "思明区"},
        {"name": "中山路步行街", "type": "shopping", "lat": 24.4545, "lng": 118.0768, "address": "思明区中山路", "district": "思明区"},
    ],
    "长沙": [
        {"name": "岳麓山", "type": "scenic", "lat": 28.1822, "lng": 112.9389, "address": "岳麓区岳麓山", "district": "岳麓区"},
        {"name": "橘子洲头", "type": "scenic", "lat": 28.1866, "lng": 112.9395, "address": "岳麓区橘子洲头", "district": "岳麓区"},
        {"name": "坡子街", "type": "food", "lat": 28.1932, "lng": 112.9738, "address": "天心区坡子街", "district": "天心区"},
        {"name": "太平街", "type": "scenic", "lat": 28.1968, "lng": 112.9750, "address": "天心区太平街", "district": "天心区"},
        {"name": "五一广场", "type": "shopping", "lat": 28.2283, "lng": 112.9388, "address": "芙蓉区五一大道", "district": "芙蓉区"},
    ],
    "昆明": [
        {"name": "石林景区", "type": "scenic", "lat": 24.8075, "lng": 103.3243, "address": "石林彝族自治县石林风景区", "district": "石林县"},
        {"name": "滇池", "type": "swim", "lat": 24.8607, "lng": 102.8333, "address": "西山区滇池", "district": "西山区"},
        {"name": "翠湖", "type": "scenic", "lat": 25.0430, "lng": 102.7960, "address": "五华区翠湖公园", "district": "五华区"},
        {"name": "大理古城", "type": "scenic", "lat": 25.6069, "lng": 100.2676, "address": "大理市大理古城", "district": "大理市"},
        {"name": "洱海", "type": "swim", "lat": 25.8499, "lng": 100.1417, "address": "大理市洱海", "district": "大理市"},
        {"name": "丽江古城", "type": "scenic", "lat": 26.8724, "lng": 100.2318, "address": "古城区丽江古城", "district": "古城区"},
    ],
    "哈尔滨": [
        {"name": "冰雪大世界", "type": "entertainment", "lat": 45.8030, "lng": 126.5360, "address": "松北区太阳岛风景区", "district": "松北区"},
        {"name": "中央大街", "type": "scenic", "lat": 45.8035, "lng": 126.6170, "address": "道里区中央大街", "district": "道里区"},
        {"name": "圣索菲亚教堂", "type": "scenic", "lat": 45.8039, "lng": 126.6220, "address": "道里区透笼街88号", "district": "道里区"},
        {"name": "松花江", "type": "swim", "lat": 45.7800, "lng": 126.5500, "address": "道里区松花江畔", "district": "道里区"},
    ],
    "三亚": [
        {"name": "天涯海角", "type": "scenic", "lat": 18.2927, "lng": 109.3540, "address": "天涯区天涯海角游览区", "district": "天涯区"},
        {"name": "亚龙湾", "type": "swim", "lat": 18.1709, "lng": 109.6518, "address": "吉阳区亚龙湾", "district": "吉阳区"},
        {"name": "蜈支洲岛", "type": "swim", "lat": 18.3053, "lng": 109.7642, "address": "海棠区蜈支洲岛", "district": "海棠区"},
        {"name": "南山文化旅游区", "type": "scenic", "lat": 18.3493, "lng": 109.4878, "address": "崖州区南山文化旅游区", "district": "崖州区"},
        {"name": "大东海", "type": "swim", "lat": 18.2008, "lng": 109.5235, "address": "吉阳区大东海旅游区", "district": "吉阳区"},
    ],
    "天津": [
        {"name": "天津古文化街", "type": "scenic", "lat": 39.1387, "lng": 117.1890, "address": "南开区古文化街", "district": "南开区"},
        {"name": "意大利风情街", "type": "scenic", "lat": 39.1485, "lng": 117.1940, "address": "河北区意式风情街", "district": "河北区"},
        {"name": "天津之眼", "type": "scenic", "lat": 39.1568, "lng": 117.1828, "address": "河北区永乐桥", "district": "河北区"},
        {"name": "五大道", "type": "scenic", "lat": 39.1215, "lng": 117.1870, "address": "和平区五大道", "district": "和平区"},
        {"name": "津湾广场", "type": "scenic", "lat": 39.1355, "lng": 117.2018, "address": "和平区解放北路", "district": "和平区"},
    ],
}

# 合并所有城市 POI，分配唯一 ID
all_pois = []
poi_id = 1
for city, pois in POI_DATA.items():
    for poi in pois:
        poi['id'] = f'poi_{poi_id:05d}'
        poi['city'] = city
        # 计算到中心点的近似距离（用于排序）
        all_pois.append(poi)
        poi_id += 1

# 输出到 JSON
output = {'pois': all_pois, 'total': len(all_pois), 'cities': list(POI_DATA.keys())}
output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'china_pois.json')
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"生成了 {len(all_pois)} 个 POI，保存到 {output_path}")
print(f"覆盖城市: {', '.join(POI_DATA.keys())}")
