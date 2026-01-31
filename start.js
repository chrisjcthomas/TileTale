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
    // Default to index.html
    let filePath = '.' + req.url;
    if (filePath === './') {
      filePath = './index.html';
    }

    // Get the file extension
    const extname = path.extname(filePath);
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';

    // SECURITY: Prevent Path Traversal and protect sensitive files
    const rootDir = path.resolve('.');
    const absolutePath = path.resolve(filePath);

    // 1. Ensure path is within root directory
    if (!absolutePath.startsWith(rootDir)) {
      res.writeHead(403);
      res.end('Forbidden: Access denied');
      return;
    }

    // 2. Check for sensitive files/directories
    const relativePath = path.relative(rootDir, absolutePath);
    const parts = relativePath.split(path.sep);

    // Block hidden files (starting with .)
    if (parts.some(part => part.startsWith('.'))) {
      res.writeHead(403);
      res.end('Forbidden: Access to hidden files denied');
      return;
    }

    // Block sensitive backend directories
    const blockedDirs = ['routes', 'controllers', 'middleware', 'node_modules'];
    if (parts.some(part => blockedDirs.includes(part))) {
      res.writeHead(403);
      res.end('Forbidden: Access to sensitive directory denied');
      return;
    }

    // Block sensitive files in root
    const blockedFiles = [
      'server.js', 'start.js', 'config.js',
      'package.json', 'package-lock.json',
      'README.md', 'start-app.sh', 'start-app.bat'
    ];
    if (parts.length === 1 && blockedFiles.includes(parts[0])) {
      res.writeHead(403);
      res.end('Forbidden: Access to sensitive file denied');
      return;
    }

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
