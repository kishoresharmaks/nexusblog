/**
 * Production Runner for Single-Service Fullstack Deployment on Render
 * Starts NestJS API on internal port (default: 4000)
 * Starts Next.js Web on public Render PORT (default: 3000 / )
 */

const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const apiPort = process.env.API_PORT || process.env.INTERNAL_API_PORT || '4000';
const webPort = process.env.WEB_PORT || process.env.PORT || '3000';

console.log('----------------------------------------------------');
console.log('🚀 Launching NexusBlog Fullstack Production Service');
console.log(`📡 Next.js Web (Public): Port ${webPort}`);
console.log(`⚙️  NestJS API (Internal): Port ${apiPort}`);
console.log('----------------------------------------------------');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'pnpm.cmd' : 'pnpm';

// 1. Start Backend API
const apiEnv = {
  ...process.env,
  PORT: apiPort,
  API_PORT: apiPort,
  INTERNAL_API_PORT: apiPort,
};

const apiProcess = spawn(npmCmd, ['--filter', '@nexus/api', 'start:prod'], {
  cwd: rootDir,
  env: apiEnv,
  shell: true,
  stdio: ['inherit', 'pipe', 'pipe'],
});

apiProcess.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) console.log(`[API] ${line}`);
  });
});

apiProcess.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) console.error(`[API-ERR] ${line}`);
  });
});

// 2. Start Frontend Web
const webEnv = {
  ...process.env,
  PORT: webPort,
  INTERNAL_API_URL: process.env.INTERNAL_API_URL || `http://127.0.0.1:${apiPort}/api`,
  INTERNAL_UPLOADS_URL: process.env.INTERNAL_UPLOADS_URL || `http://127.0.0.1:${apiPort}/uploads`,
};

const webProcess = spawn(npmCmd, ['--filter', '@nexus/web', 'start'], {
  cwd: rootDir,
  env: webEnv,
  shell: true,
  stdio: ['inherit', 'pipe', 'pipe'],
});

webProcess.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) console.log(`[WEB] ${line}`);
  });
});

webProcess.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) console.error(`[WEB-ERR] ${line}`);
  });
});

// Clean termination handling
function shutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Shutting down services...`);
  try {
    apiProcess.kill(signal);
  } catch {}
  try {
    webProcess.kill(signal);
  } catch {}
  setTimeout(() => process.exit(0), 1000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

apiProcess.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`[API] Process exited with code ${code}`);
  }
});

webProcess.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`[WEB] Process exited with code ${code}`);
  }
});
