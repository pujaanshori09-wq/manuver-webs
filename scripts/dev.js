import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const isWin = process.platform === 'win32';
const npxCmd = isWin ? 'npx.cmd' : 'npx';
const nodeCmd = process.execPath;

console.log('----------------------------------------------------');
console.log('⚡ Starting MANUVER full-stack development environment');
console.log('   - Express Backend & OAuth: http://localhost:5000');
console.log('   - Vite Frontend:           http://localhost:5173');
console.log('----------------------------------------------------');

// 1. Start Express backend on port 5000
const serverProcess = spawn(nodeCmd, ['server/index.js'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: isWin
});

// 2. Start Vite dev server on port 5173
const viteProcess = spawn(npxCmd, ['vite', '--host', '0.0.0.0'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: isWin
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
