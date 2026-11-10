import http from 'http';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const distDir = path.join(process.cwd(), 'dist');

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '/dashboard') reqPath = '/dashboard.html';
  const filePath = path.join(distDir, reqPath);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const mimeMap = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    };
    res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    const fallback = path.join(distDir, 'dashboard.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(fallback).pipe(res);
  }
});

const PORT = 8899;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server listening on port ${PORT}...`);
  const artifactDir = 'C:\\Users\\Asus\\.gemini\\antigravity\\brain\\d5e3a715-148f-46de-834a-a770b4f29c03';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempProfile1 = path.join(process.env.TEMP, 'chrome-shot-' + Date.now() + '-1440');
  const tempProfile2 = path.join(process.env.TEMP, 'chrome-shot-' + Date.now() + '-1920');

  const out1440 = path.join(artifactDir, 'screenshot-1440.png');
  const out1920 = path.join(artifactDir, 'screenshot-1920.png');

  try {
    console.log('Capturing 1440px screenshot...');
    execSync(`"${chromePath}" --headless=new --disable-gpu --virtual-time-budget=3000 --run-all-compositor-stages-before-draw --user-data-dir="${tempProfile1}" --screenshot="${out1440}" --window-size=1440,900 --hide-scrollbars "http://127.0.0.1:${PORT}/dashboard?preview=1"`, { stdio: 'inherit' });

    console.log('Capturing 1920px screenshot...');
    execSync(`"${chromePath}" --headless=new --disable-gpu --virtual-time-budget=3000 --run-all-compositor-stages-before-draw --user-data-dir="${tempProfile2}" --screenshot="${out1920}" --window-size=1920,1080 --hide-scrollbars "http://127.0.0.1:${PORT}/dashboard?preview=1"`, { stdio: 'inherit' });

    console.log('Finished capturing screenshots!');
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
