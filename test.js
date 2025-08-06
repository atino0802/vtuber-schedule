
// 用法: node test.js <channelId> [limit]
// 範例: node test.js UCL_qhgtOy0dy1Agp8vkySQg 3

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const channelId = process.argv[2] || 'UCL_qhgtOy0dy1Agp8vkySQg';
const limit = process.argv[3] || 5;
const apiKey = 'fbe36b98-eddb-4db1-9df8-83a4fb6d34f0';
const url = `https://holodex.net/api/v2/channels/${channelId}/videos?type=stream&limit=${limit}`;

fetch(url, {
  headers: {
    'X-APIKEY': 'fbe36b98-eddb-4db1-9df8-83a4fb6d34f0'
  }
})
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(data => {
    console.log('API 回傳：', data);
  })
  .catch(err => console.error('API 錯誤：', err));
