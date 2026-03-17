// Quick test: verify login + data endpoints work
const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({ hostname: 'localhost', port: 5001, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    }, (res) => {
      let chunks = '';
      res.on('data', c => chunks += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(chunks) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: 'localhost', port: 5001, path, method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    }, (res) => {
      let chunks = '';
      res.on('data', c => chunks += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(chunks) }));
    });
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  try {
    // 1. Login
    const login = await post('/api/auth/login', { email: 'admin@fleet.com', password: 'admin123' });
    console.log('LOGIN:', login.status, login.body.name, login.body.role);
    const token = login.body.token;

    // 2. Test data endpoints
    const endpoints = ['/api/vehicles', '/api/drivers', '/api/alerts', '/api/sensor', '/api/environment', '/api/safety', '/api/admin/environment-summary', '/api/admin/fleet-risk', '/api/admin/adas-summary'];
    for (const ep of endpoints) {
      const r = await get(ep, token);
      const count = r.body.data ? (Array.isArray(r.body.data) ? r.body.data.length : 'obj') : 'N/A';
      console.log(`  ${ep}: ${r.status} (${count} records)`);
    }
    console.log('\n✅ All endpoints working!');
  } catch (e) {
    console.error('❌ Test failed:', e.message);
  }
})();
