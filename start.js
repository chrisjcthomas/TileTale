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
    // Security: Prevent path traversal
    // Resolve the absolute path
    let safePath = path.resolve(__dirname, '.' + req.url);
    const rootPath = path.resolve(__dirname);

    // Ensure the resolved path starts with the root path and isn't a sibling attack
    // Add path separator to ensure we match a directory boundary (e.g. /app/ vs /app_backup/)
    if (!safePath.startsWith(rootPath + path.sep) && safePath !== rootPath) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden: Access Denied');
      return;
    }

    // Default to index.html if root is requested
    if (safePath === rootPath) {
      safePath = path.join(rootPath, 'index.html');
    }

    // Check file stats asynchronously
    fs.stat(safePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // If file doesn't exist or is a directory, serve 404
        const notFoundPath = path.join(rootPath, '404.html');
        fs.readFile(notFoundPath, (err404, content404) => {
          if (err404) {
            // Fallback if 404.html doesn't exist
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
          } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(content404, 'utf-8');
          }
        });
        return;
      }

      // Get the file extension
      const extname = path.extname(safePath);
      let contentType = MIME_TYPES[extname] || 'application/octet-stream';

      // Read the file
      fs.readFile(safePath, (readErr, content) => {
        if (readErr) {
          res.writeHead(500);
          res.end(`Server Error: ${readErr.code}`);
        } else {
          // Success
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
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
