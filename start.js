/**
 * Development startup script
 * Starts both the backend server and a simple HTTP server for the frontend
 */

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const open = require('open');

// Configuration
const BACKEND_PORT = process.env.PORT || 3000;
const FRONTEND_PORT = 5500;

// Security: Files and Directories to block from the frontend server
const BLOCKED_FILES = [
  '.env', '.env.example', '.env.local',
  '.gitignore', '.gitattributes',
  'server.js', 'start.js', 'config.js',
  'package.json', 'package-lock.json',
  'start-app.bat', 'start-app.sh'
];

const BLOCKED_DIRS = [
  'routes', 'controllers', 'middleware', 'node_modules',
  '.git', '.jules', '.vscode', '.idea'
];

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
  const rootDir = process.cwd();

  const server = http.createServer((req, res) => {
    try {
      // Parse URL to get clean pathname (ignoring query params)
      const parsedUrl = url.parse(req.url);
      let pathname = parsedUrl.pathname || '/';

      // Decode percent-encoded characters (e.g. %20 for space)
      try {
        pathname = decodeURIComponent(pathname);
      } catch (e) {
        res.writeHead(400);
        return res.end('400 Bad Request: Invalid URL encoding');
      }

      // Default to index.html for root request
      if (pathname === '/') {
        pathname = '/index.html';
      }

      // Security Check 1: Path Traversal Protection
      // Resolve the full path and ensure it's within the root directory
      const filePath = path.join(rootDir, pathname);

      // IMPORTANT: path.resolve removes trailing slashes, so we normalized expectations
      const resolvedPath = path.resolve(filePath);

      if (!resolvedPath.startsWith(rootDir)) {
        console.warn(`[Security] Blocked path traversal attempt: ${req.url}`);
        res.writeHead(403);
        return res.end('403 Forbidden: Access denied');
      }

      // Security Check 2: Block Sensitive Files and Directories
      const relativePath = path.relative(rootDir, resolvedPath);
      const segments = relativePath.split(path.sep);
      const filename = path.basename(resolvedPath);

      // Check if any path segment is in BLOCKED_DIRS (e.g. routes/auth.js)
      // or if the file starts with '.' (hidden files)
      // or if the filename is in BLOCKED_FILES
      const isBlockedDir = segments.some(seg => BLOCKED_DIRS.includes(seg));
      const isHiddenFile = filename.startsWith('.'); // Block .env, .git, etc.
      const isBlockedFile = BLOCKED_FILES.includes(filename);

      if (isBlockedDir || isHiddenFile || isBlockedFile) {
         console.warn(`[Security] Blocked access to sensitive file: ${relativePath}`);
         res.writeHead(403);
         return res.end('403 Forbidden: Access to this resource is blocked');
      }

      // Get the file extension
      const extname = path.extname(resolvedPath);
      let contentType = MIME_TYPES[extname] || 'application/octet-stream';

      // Read the file
      fs.readFile(resolvedPath, (err, content) => {
        if (err) {
          if (err.code === 'ENOENT') {
            // File not found
            // Try to serve 404.html if it exists, otherwise standard message
            const notFoundPath = path.join(rootDir, '404.html');
            fs.readFile(notFoundPath, (err404, content404) => {
               if (!err404) {
                 res.writeHead(404, { 'Content-Type': 'text/html' });
                 res.end(content404, 'utf-8');
               } else {
                 res.writeHead(404, { 'Content-Type': 'text/plain' });
                 res.end('404 Not Found', 'utf-8');
               }
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
       console.error('Request processing error:', error);
       res.writeHead(500);
       res.end('Internal Server Error');
    }
  });

  server.listen(FRONTEND_PORT, () => {
    console.log(`Frontend server running at http://localhost:${FRONTEND_PORT}/`);

    // Open the browser
    // Note: In some environments (like headless), open might fail or hang.
    // We catch errors just in case, though open usually promises.
    open(`http://localhost:${FRONTEND_PORT}/`).catch(err => {
        console.log('Failed to open browser automatically:', err.message);
    });
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
