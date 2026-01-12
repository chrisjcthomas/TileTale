## 2026-01-12 - Critical Path Traversal in Development Server
**Vulnerability:** The development server (`start.js`) allowed directory traversal and arbitrary file reading because it served files based on unvalidated user input (`req.url`).
**Learning:** Even development tools can be dangerous if they expose the file system. Security controls should be applied to all entry points, not just production code.
**Prevention:** Always validate and sanitize file paths. Use a whitelist of allowed files or serve from a dedicated static directory.
