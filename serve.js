const http = require('http');
const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');
const mime = {
  html: 'text/html', css: 'text/css', js: 'application/javascript',
  json: 'application/json', png: 'image/png', jpg: 'image/jpeg',
  svg: 'image/svg+xml', ico: 'image/x-icon', webmanifest: 'application/manifest+json'
};

http.createServer((req, res) => {
  let url = req.url === '/' ? '/index.html' : req.url;
  let fp = path.join(appDir, url.replace(/^\//, ''));
  let ext = path.extname(fp).slice(1);
  res.setHeader('Content-Type', mime[ext] || 'text/plain');
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    res.end(fs.readFileSync(fp));
  } catch (e) {
    res.statusCode = 404;
    res.end('Not Found');
  }
}).listen(8080, '0.0.0.0', () => {
  console.log('HTTP server running on http://localhost:8080');
});
