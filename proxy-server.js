const express = require('express');
const path = require('path');
const https = require('https');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'simpro-dashboard.html'));
});

// Proxy endpoint - forwards requests to SimPro API
app.use('/api-proxy', (req, res) => {
  const simproBase = req.headers['x-simpro-base'];
  const apiKey = req.headers['x-api-key'];

  if (!simproBase || !apiKey) {
    return res.status(400).json({ error: 'Missing x-simpro-base or x-api-key headers' });
  }

  const targetUrl = new URL(simproBase);
  const proxyPath = req.url;
  const isHttps = targetUrl.protocol === 'https:';
  const lib = isHttps ? https : http;

  const options = {
    hostname: targetUrl.hostname,
    port: targetUrl.port || (isHttps ? 443 : 80),
    path: proxyPath,
    method: req.method,
    headers: {
      'Authorization': apiKey.startsWith('Bearer ') ? apiKey : 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  };

  const proxyReq = lib.request(options, (proxyRes) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(proxyRes.statusCode);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: 'Proxy request failed: ' + err.message });
  });

  proxyReq.end();
});

app.listen(PORT, () => {
  console.log(`SimPro Dashboard running on port ${PORT}`);
});
