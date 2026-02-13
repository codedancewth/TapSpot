// 临时配置：使用公网API地址
const config = {
  apiBaseUrl: 'https://tapspot-api.loca.lt/api/v1'
};

// 覆盖前端的API配置
if (typeof window !== 'undefined') {
  window.__TAPSPOT_CONFIG = config;
  console.log('TapSpot公网配置已加载:', config);
}

// 导出配置
export default config;