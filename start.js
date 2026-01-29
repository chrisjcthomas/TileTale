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
      // Parse URL to handle query parameters and decoding
      const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      let pathname = parsedUrl.pathname;

      // Default to index.html
      if (pathname === '/') {
        pathname = '/index.html';
      }

      // Security: Resolve path to absolute path to prevent traversal
      const fullPath = path.join(__dirname, pathname);

      // 1. Path Traversal Check
      if (!fullPath.startsWith(__dirname)) {
        console.warn(`[Security] Blocked path traversal attempt: ${req.url}`);
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
      }

      // 2. Sensitive File Block
      // Define sensitive files and directories that should not be served
      const BLACKLIST = [
        'server.js', 'config.js', 'start.js', '.env', 'package.json', 'package-lock.json',
        'README.md', 'start-app.sh', 'start-app.bat', '.gitignore'
      ];
      const BLACKLIST_DIRS = ['routes', 'controllers', 'middleware', 'node_modules', '.git', '.jules'];

      const relativePath = path.relative(__dirname, fullPath);
      // Check if exact match or inside blocked directory
      const pathSegments = relativePath.split(path.sep);
      const rootSegment = pathSegments[0];

      if (BLACKLIST.includes(relativePath) || BLACKLIST_DIRS.includes(rootSegment)) {
        console.warn(`[Security] Blocked sensitive file access: ${req.url}`);
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
      }

      // Get the file extension for MIME type
      const extname = path.extname(fullPath);
      let contentType = MIME_TYPES[extname] || 'application/octet-stream';

      // Read the file
      fs.readFile(fullPath, (err, content) => {
        if (err) {
          if (err.code === 'ENOENT') {
            // File not found
            // Check if 404.html exists
            const path404 = path.join(__dirname, '404.html');
            fs.readFile(path404, (err404, content404) => {
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
       res.writeHead(400);
       res.end('Bad Request');
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
