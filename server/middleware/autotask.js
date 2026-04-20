require('dotenv').config();
const axios = require('axios');

const atClient = axios.create({
  baseURL: `${process.env.AT_ZONE_URL}/atservicesrest/v1.0`,
  headers: {
    'Content-Type': 'application/json',
    'UserName': process.env.AT_USERNAME,
    'Secret': process.env.AT_SECRET,
    'ApiIntegrationCode': process.env.AT_INTEGRATION_CODE || '',
  },
  timeout: 15000,
});

atClient.interceptors.request.use((config) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[AT] ${config.method?.toUpperCase()} ${config.url}`);
  }
  return config;
});

module.exports = atClient;
