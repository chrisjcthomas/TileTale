## 2026-01-16 - Development Server Path Traversal
**Vulnerability:** The `start.js` development server was vulnerable to path traversal (`../`) and allowed access to sensitive files like `.env`, `server.js`, and `package.json` because it served `req.url` directly from the project root.
**Learning:** Development tools and scripts that expose an HTTP server are often overlooked but can be just as dangerous as the main application if they lack basic security controls, especially when they bind to network interfaces.
**Prevention:** When serving files based on user input (URL), always resolve the path using `path.resolve`, verify it starts with the expected root directory, and implement an allowlist of extensions or a blocklist of sensitive files/directories.
