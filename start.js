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

// Sensitive files and directories to block
const BLOCKED_FILES = [
  '.env',
  '.env.example',
  'server.js',
  'config.js',
  'start.js',
  'package.json',
  'package-lock.json',
  'README.md',
  '.gitignore'
];

const BLOCKED_DIRS = [
  'routes',
  'controllers',
  'middleware',
  'node_modules',
  '.git',
  '.jules'
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
    try {
      // Basic security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');

      // Parse URL and sanitize path
      const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
      let pathname = parsedUrl.pathname;

      // Prevent directory traversal
      const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
      const filePath = path.join(__dirname, safePath === '/' ? 'index.html' : safePath);

      // Security Check 1: Ensure path is within root directory
      if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('403 Forbidden: Access Denied');
        return;
      }

      const filename = path.basename(filePath);
      const relativePath = path.relative(__dirname, filePath);

      // Security Check 2: Block dotfiles and sensitive files
      // filename.startsWith('.') covers .env, .git, etc.
      // But we explicitly list some too for clarity or if they are not dotfiles
      if (filename.startsWith('.') ||
          BLOCKED_FILES.includes(filename) ||
          BLOCKED_DIRS.some(dir => relativePath.split(path.sep)[0] === dir)) {

        console.warn(`Blocked access to sensitive file: ${relativePath}`);
        res.writeHead(403);
        res.end('403 Forbidden: Access to sensitive file denied');
        return;
      }

      // Get the file extension
      const extname = path.extname(filePath);
      let contentType = MIME_TYPES[extname] || 'application/octet-stream';

      // Read the file
      fs.readFile(filePath, (err, content) => {
        if (err) {
          if (err.code === 'ENOENT') {
            // File not found
            fs.readFile(path.join(__dirname, '404.html'), (err404, content404) => {
              res.writeHead(404, { 'Content-Type': 'text/html' });
              res.end(content404 || '404 Not Found', 'utf-8');
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
    } catch (error) {
      console.error('Request handling error:', error);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
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
