import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('⚡ Starting MANUVER full-stack development environment');
console.log('   - Express Backend & OAuth: http://localhost:5000');
console.log('   - Vite Frontend:           http://localhost:5173');
console.log('====================================================');

// 1. Start Express backend on port 5000 using fork (immune to Windows path spaces)
const serverModule = path.resolve(rootDir, 'server/index.js');
const serverProcess = fork(serverModule, [], {
  cwd: rootDir,
  stdio: 'inherit'
});

// 2. Start Vite dev server on port 5173 using fork
const viteModule = path.resolve(rootDir, 'node_modules/vite/bin/vite.js');
const viteProcess = fork(viteModule, ['--host', '0.0.0.0'], {
  cwd: rootDir,
  stdio: 'inherit'
});

function cleanup() {
  try {
    serverProcess.kill();
  } catch (_) {}
  try {
    viteProcess.kill();
  } catch (_) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
