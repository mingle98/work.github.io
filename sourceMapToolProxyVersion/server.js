const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

// 跨域允许全部
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  // 支持字请求头，常用POST请求会预检
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// 简单代理: /proxy?url=目标地址
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    res.status(400).json({error: '缺少url参数'});
    return;
  }
  try {
    // 转发请求
    const response = await fetch(targetUrl, {
      headers: {
        // 你可以按需求设置头，可避免被服务器拒绝，模拟浏览器请求
        'User-Agent': 'Mozilla/5.0 (Node Proxy)'
      }
    });

    // 内容类型
    res.setHeader('content-type', response.headers.get('content-type') || 'application/octet-stream');

    // 状态码转发
    res.status(response.status);

    // 传输响应体
    response.body.pipe(res);
  } catch (error) {
    res.status(500).json({error: '代理请求失败', details: error.message});
  }
});

app.listen(PORT, () => {
  console.log(`代理服务器运行于 http://localhost:${PORT}`);
  console.log('用法示例: http://localhost:3000/proxy?url=https://example.com/file.js.map');
});
