const http = require('http');
const { spawn } = require('child_process');

const FRONTEND_PORT = 5500;
const BASE_URL = `http://localhost:${FRONTEND_PORT}`;

// Start the server
console.log('Starting server...');
const serverProcess = spawn('node', ['start.js'], {
  stdio: 'pipe',
  detached: false,
  env: process.env // Inherit environment variables
});

let serverReady = false;

// Pipe output to verify startup
serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  // console.log('[Server stdout]:', output);
  if (output.includes(`Frontend server running at http://localhost:${FRONTEND_PORT}/`)) {
    serverReady = true;
  }
});

serverProcess.stderr.on('data', (data) => {
  // console.error('[Server stderr]:', data.toString());
});

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${path}`, (res) => {
      resolve({
        statusCode: res.statusCode,
        headers: res.headers
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function runTests() {
  console.log('Waiting for server to start...');

  // Wait for server to be ready (max 10 seconds)
  for (let i = 0; i < 20; i++) {
    if (serverReady) break;
    await new Promise(r => setTimeout(r, 500));
  }

  if (!serverReady) {
    console.error('Server failed to start in time.');
    // Kill the process before exiting
    serverProcess.kill();
    process.exit(1);
  }

  console.log('Server started. Running tests...');
  let failed = false;

  try {
    // Test 1: Access index.html (Should succeed)
    console.log('Test 1: Access index.html');
    const res1 = await makeRequest('/index.html');
    if (res1.statusCode === 200) {
      console.log('✅ PASS: /index.html returned 200');
    } else {
      console.error(`❌ FAIL: /index.html returned ${res1.statusCode}`);
      failed = true;
    }

    // Test 2: Access server.js (Should be Forbidden)
    console.log('Test 2: Access server.js');
    const res2 = await makeRequest('/server.js');
    if (res2.statusCode === 403) {
      console.log('✅ PASS: /server.js returned 403 Forbidden');
    } else {
      console.error(`❌ FAIL: /server.js returned ${res2.statusCode} (Expected 403)`);
      failed = true;
    }

    // Test 3: Access .env.example (Should be Forbidden because it starts with .)
    console.log('Test 3: Access .env.example');
    const res3 = await makeRequest('/.env.example');
    if (res3.statusCode === 403) {
      console.log('✅ PASS: /.env.example returned 403 Forbidden');
    } else {
      console.error(`❌ FAIL: /.env.example returned ${res3.statusCode} (Expected 403)`);
      failed = true;
    }

    // Test 4: Access routes/auth.js (Blocked Directory)
    console.log('Test 4: Access routes/auth.js (Blocked Directory)');
    const res4 = await makeRequest('/routes/auth.js');
    if (res4.statusCode === 403) {
        console.log('✅ PASS: /routes/auth.js returned 403 Forbidden');
    } else {
        console.error(`❌ FAIL: /routes/auth.js returned ${res4.statusCode} (Expected 403)`);
        failed = true;
    }

  } catch (err) {
    console.error('Test execution error:', err);
    failed = true;
  } finally {
    // Cleanup
    console.log('Stopping server...');
    serverProcess.kill();
    // Use negative PID to kill process group if detached, but here it is not.
    // Just in case, try to find the backend process (port 3000) and kill it.
    // But since we are inside sandbox, we trust simple kill for now.

    // In case server.js was spawned by start.js, it might survive.
    // We can rely on 'pkill' in bash if needed, but let's exit.
    process.exit(failed ? 1 : 0);
  }
}

runTests();
