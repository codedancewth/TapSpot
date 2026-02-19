package controllers

import (
	"math"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func init() {
	rand.Seed(time.Now().UnixNano())
}

// POI 兴趣点
type POI struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	Type      string  `json:"type"`
	TypeName  string  `json:"typeName"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Address   string  `json:"address"`
	Distance  int     `json:"distance"`
}

// GetPOIs POI搜索API（模拟）
func GetPOIs(c *gin.Context) {
	location := c.Query("location") // "lng,lat"
	radius := 3000
	if r := c.Query("radius"); r != "" {
		if parsed, err := strconv.Atoi(r); err == nil {
			radius = parsed
		}
	}

	if location == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "缺少 location 参数"})
		return
	}

	lngStr, latStr := splitLocation(location)
	lng, lat := parseFloat64Pair(lngStr, latStr)

	// POI类型
	poiTypes := []struct {
		typeName string
		names    []string
	}{
		{"restaurant", []string{"肯德基", "麦当劳", "星巴克", "瑞幸咖啡", "海底捞", "呷哺呷哺", "必胜客", "真功夫"}},
		{"hotel", []string{"如家酒店", "汉庭酒店", "7天酒店", "锦江之星", "全季酒店", "亚朵酒店"}},
		{"shopping", []string{"万达广场", "华润万家", "永辉超市", "盒马鲜生", "名创优品", "屈臣氏"}},
		{"scenic", []string{"人民公园", "中心广场", "历史博物馆", "科技馆", "海洋世界", "动物园"}},
		{"entertainment", []string{"万达影城", "KTV", "网吧", "健身房", "游泳馆", "游乐场"}},
	}

	// 生成20-40个随机POI
	count := rand.Intn(20) + 20
	pois := make([]POI, count)

	for i := 0; i < count; i++ {
		poiType := poiTypes[rand.Intn(len(poiTypes))]
		name := poiType.names[rand.Intn(len(poiType.names))]

		// 随机偏移
		offsetLat := (rand.Float64() - 0.5) * (float64(radius) / 111000)
		offsetLng := (rand.Float64() - 0.5) * (float64(radius) / 111000 / math.Cos(lat*math.Pi/180))

		pois[i] = POI{
			ID:        "poi_" + time.Now().Format("20060102150405") + "_" + strconv.Itoa(i),
			Name:      name + "(" + strconv.Itoa(rand.Intn(100)+1) + "号店)",
			Type:      poiType.typeName,
			TypeName:  getTypeName(poiType.typeName),
			Latitude:  lat + offsetLat,
			Longitude: lng + offsetLng,
			Address:   "某某路" + strconv.Itoa(rand.Intn(999)+1) + "号",
			Distance:  rand.Intn(radius),
		}
	}

	// 按距离排序
	for i := 0; i < len(pois); i++ {
		for j := i + 1; j < len(pois); j++ {
			if pois[i].Distance > pois[j].Distance {
				pois[i], pois[j] = pois[j], pois[i]
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"pois": pois})
}

// ReverseGeocode 逆地理编码API
func ReverseGeocode(c *gin.Context) {
	location := c.Query("location") // "lng,lat"

	if location == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "缺少 location 参数"})
		return
	}

	lngStr, latStr := splitLocation(location)
	lng, lat := parseFloat64Pair(lngStr, latStr)

	// 城市范围
	cities := []struct {
		name     string
		latRange [2]float64
		lngRange [2]float64
	}{
		{"北京", [2]float64{39.5, 41}, [2]float64{115.5, 117.5}},
		{"上海", [2]float64{30.5, 31.5}, [2]float64{121, 122}},
		{"广州", [2]float64{22.5, 23.5}, [2]float64{113, 113.8}},
		{"深圳", [2]float64{22.4, 22.9}, [2]float64{113.8, 114.5}},
		{"杭州", [2]float64{30, 30.5}, [2]float64{120, 120.5}},
		{"成都", [2]float64{30.5, 31}, [2]float64{103.8, 104.2}},
		{"武汉", [2]float64{30.3, 30.8}, [2]float64{114, 114.5}},
		{"西安", [2]float64{34.2, 34.4}, [2]float64{108.8, 109.1}},
		{"南京", [2]float64{31.9, 32.2}, [2]float64{118.6, 119}},
		{"重庆", [2]float64{29.4, 29.8}, [2]float64{106.3, 106.7}},
	}

	cityName := "未知城市"
	for _, city := range cities {
		if lat >= city.latRange[0] && lat <= city.latRange[1] &&
			lng >= city.lngRange[0] && lng <= city.lngRange[1] {
			cityName = city.name
			break
		}
	}

	streets := []string{"中山路", "人民路", "解放路", "建设路", "和平路", "光明路", "幸福路", "文化路"}
	street := streets[rand.Intn(len(streets))]
	number := rand.Intn(999) + 1
	address := cityName + "市某区" + street + strconv.Itoa(number) + "号"

	c.JSON(http.StatusOK, gin.H{
		"status": "1",
		"info":   "OK",
		"regeocode": gin.H{
			"formatted_address": address,
			"addressComponent": gin.H{
				"city":     cityName,
				"district": "某区",
				"street":   street,
				"number":   strconv.Itoa(number) + "号",
			},
		},
	})
}

// HealthCheck 健康检查
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
		"time":   time.Now().Format("2006-01-02T15:04:05Z07:00"),
	})
}

// 辅助函数
func getTypeName(t string) string {
	names := map[string]string{
		"restaurant":    "餐饮",
		"hotel":         "酒店",
		"shopping":      "购物",
		"scenic":        "景点",
		"entertainment": "娱乐",
	}
	if n, ok := names[t]; ok {
		return n
	}
	return t
}
