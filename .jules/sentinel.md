## 2024-05-22 - Path Traversal in Development Server
**Vulnerability:** The `start.js` development server blindly concatenated `.` with `req.url` to serve files, exposing the entire project root (including source code and configuration) on the frontend port.
**Learning:** Development tools often lack the security rigor of production code but can be just as dangerous if they expose sensitive data or are accidentally deployed.
**Prevention:** Always validate file paths and use allow-lists for static file servers, even in development scripts. Never assume the "root" is safe to expose.
