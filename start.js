/**
 * Development startup script
 * Starts both the backend server and a simple HTTP server for the frontend
 */

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const open = require('open');

// Configuration
const BACKEND_PORT = process.env.PORT || 3000;
const FRONTEND_PORT = 5500;

// MIME types for serving static files
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Files that should NEVER be served
const BLOCKED_FILES = [
  '.env',
  '.git',
  '.gitignore',
  'server.js',
  'config.js',
  'package.json',
  'package-lock.json',
  'start.js',
  'start-app.sh',
  'start-app.bat',
  'README.md'
];

// Start the backend server
function startBackend() {
  console.log('Starting backend server...');

  const backend = spawn('node', ['server.js'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: BACKEND_PORT }
  });

  backend.on('error', (err) => {
    console.error('Failed to start backend server:', err);
  });

  return backend;
}

// Start a simple HTTP server for the frontend
function startFrontend() {
  console.log('Starting frontend server...');

  const server = http.createServer((req, res) => {
    // Basic path sanitization
    const safeUrl = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');

    // Default to index.html
    let filePath = '.' + safeUrl;
    if (filePath === './' || filePath === '.') {
      filePath = './index.html';
    }

    // Resolve absolute path to check for traversal
    const resolvedPath = path.resolve(filePath);
    const rootPath = path.resolve('.');

    // Security Check 1: Ensure file is within root directory (prevents ../../../ etc)
    if (!resolvedPath.startsWith(rootPath)) {
      res.writeHead(403);
      res.end('403 Forbidden: Access Denied');
      return;
    }

    // Get the file extension
    const extname = path.extname(filePath);

    // Security Check 2: Block sensitive files and ensure extension is allowed
    const basename = path.basename(filePath);

    // Check against blocked files list (exact match or starts with .env)
    const isBlocked = BLOCKED_FILES.some(blocked =>
      basename === blocked ||
      basename.startsWith('.env') ||
      basename === '.git'
    );

    // Also block files without extension if not whitelisted (assuming most sensitive files don't have extension or are specific)
    // But index.html has extension.
    // Also check if extension is in MIME_TYPES
    const isAllowedType = Object.keys(MIME_TYPES).includes(extname);

    if (isBlocked || !isAllowedType) {
      // Allow specific exceptions if needed, but generally if it's not a known web type or is blocked, deny it.
      // Exception: if it's a directory, we might want to serve index.html, but we handled that earlier with req.url

      console.log(`[Security] Blocked access to: ${filePath}`);
      res.writeHead(403);
      res.end('403 Forbidden: Restricted File');
      return;
    }

    let contentType = MIME_TYPES[extname] || 'application/octet-stream';

    // Read the file
    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // File not found
          fs.readFile('./404.html', (err, content) => {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(content || '404 Not Found', 'utf-8');
          });
        } else {
          // Server error
          res.writeHead(500);
          res.end(`Server Error: ${err.code}`);
        }
      } else {
        // Success
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  server.listen(FRONTEND_PORT, () => {
    console.log(`Frontend server running at http://localhost:${FRONTEND_PORT}/`);

    // Open the browser
    open(`http://localhost:${FRONTEND_PORT}/`);
  });

  return server;
}

// Main function
async function main() {
  console.log('Starting development environment...');

  // Check if backend dependencies are installed
  if (!fs.existsSync('./node_modules')) {
    console.log('Dependencies not found. Please run "npm install" manually before starting.');
    process.exit(1);
  }

  // Start servers
  const backend = startBackend();
  const frontend = startFrontend();

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Shutting down servers...');
    backend.kill();
    frontend.close();
    process.exit();
  });
}

// Run the main function
main().catch(err => {
  console.error('Error starting development environment:', err);
  process.exit(1);
});
