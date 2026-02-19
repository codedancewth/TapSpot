package controllers

import (
	"strconv"
	"strings"
)

// splitIDs 将逗号分隔的ID字符串转换为uint切片
func splitIDs(ids string) []uint {
	var result []uint
	for _, idStr := range strings.Split(ids, ",") {
		if id, err := strconv.ParseUint(strings.TrimSpace(idStr), 10, 64); err == nil {
			result = append(result, uint(id))
		}
	}
	return result
}

// parseUint 解析字符串为uint
func parseUint(s string) uint {
	id, _ := strconv.ParseUint(s, 10, 64)
	return uint(id)
}

// parseFloat64Pair 解析两个字符串为float64
func parseFloat64Pair(s1, s2 string) (float64, float64) {
	f1, _ := strconv.ParseFloat(s1, 64)
	f2, _ := strconv.ParseFloat(s2, 64)
	return f1, f2
}

// splitLocation 解析 "lng,lat" 格式的位置字符串，返回经度和纬度
func splitLocation(location string) (string, string) {
	parts := strings.Split(location, ",")
	if len(parts) == 2 {
		return parts[0], parts[1]
	}
	return "0", "0"
}
