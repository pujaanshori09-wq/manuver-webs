import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profileDir = path.join(process.env.TEMP, 'chrome-cdp-' + Date.now());

const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  `--user-data-dir=${profileDir}`,
  '--remote-debugging-port=9333',
  'about:blank'
]);

async function waitForChrome(maxAttempts = 15, delay = 500) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9333/json/list');
      if (res.ok) {
        const tabs = await res.json();
        if (tabs && tabs[0]?.webSocketDebuggerUrl) return tabs[0].webSocketDebuggerUrl;
      }
    } catch (_) {}
    await new Promise(r => setTimeout(r, delay));
  }
  throw new Error('Chrome remote debugging did not respond on port 9333');
}

(async () => {
  try {
    const wsUrl = await waitForChrome();
    const ws = new WebSocket(wsUrl);
    let id = 1;

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        const handler = (event) => {
          const data = JSON.parse(event.data);
          if (data.id === msgId) {
            ws.removeEventListener('message', handler);
            resolve(data.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    ws.onopen = async () => {
      ws.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        if (data.method === 'Runtime.consoleAPICalled') {
          console.log('[BROWSER CONSOLE]', data.params.type, data.params.args.map(a => a.value || a.description).join(' '));
        }
        if (data.method === 'Runtime.exceptionThrown') {
          console.error('[BROWSER EXCEPTION]', data.params.exceptionDetails.text, data.params.exceptionDetails.exception?.description);
        }
        if (data.method === 'Network.loadingFailed') {
          console.error('[NETWORK FAILED]', data.params.errorText, data.params.type);
        }
        if (data.method === 'Network.requestWillBeSent') {
          console.log('[REQ]', data.params.request.url);
        }
      });

      await send('Runtime.enable');
      await send('Page.enable');
      await send('Network.enable');

      console.log('Navigating to dashboard.html?preview=1 ...');
      const navPromise = new Promise((resolve) => {
        const h = (e) => {
          const d = JSON.parse(e.data);
          if (d.method === 'Page.loadEventFired') {
            ws.removeEventListener('message', h);
            resolve();
          }
        };
        ws.addEventListener('message', h);
      });

      await send('Page.navigate', { url: 'http://localhost:5173/dashboard.html?preview=1' });
      await navPromise;
      console.log('Page loaded!');

      // Wait 1.5 seconds for async bootstrap
      await new Promise(r => setTimeout(r, 1500));

      const dom = await send('Runtime.evaluate', { expression: 'document.getElementById("dashboard-app")?.className' });
      console.log('dashboard-app className:', dom.result.value);

      const testImport = await send('Runtime.evaluate', { expression: 'import("/src/dashboard.js").catch(e => e.stack)', awaitPromise: true, returnByValue: true });
      console.log('IMPORT RESULT:', testImport.result.value);

      const evalRes = await send('Runtime.evaluate', { expression: `({
        loaderClass: document.getElementById('dashboard-loader')?.className,
        appClass: document.getElementById('dashboard-app')?.className,
        docTitle: document.title,
        chatRoot: !!document.querySelector('.chat-widget-root')
      })`, returnByValue: true });
      console.log('EVAL STATE:', evalRes.result.value);

      // Capture 1440px Desktop
      console.log('Capturing 1440x900...');
      await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
      await new Promise(r => setTimeout(r, 400));
      const shot1440 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('C:\\Users\\Asus\\.gemini\\antigravity\\brain\\d5e3a715-148f-46de-834a-a770b4f29c03\\screenshot-1440.png', Buffer.from(shot1440.data, 'base64'));

      // Capture 390px Mobile Viewport (iPhone 14 / modern mobile standard)
      console.log('Capturing 390x844 mobile...');
      await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
      await new Promise(r => setTimeout(r, 400));
      const shot390 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('C:\\Users\\Asus\\.gemini\\antigravity\\brain\\d5e3a715-148f-46de-834a-a770b4f29c03\\screenshot-390.png', Buffer.from(shot390.data, 'base64'));

      console.log('Screenshots written successfully!');
      ws.close();
      chrome.kill();
      process.exit(0);
    };
  } catch (err) {
    console.error('CDP error:', err);
    chrome.kill();
    process.exit(1);
  }
})();
