## 2025-02-19 - Critical Path Traversal in Dev Server
**Vulnerability:** Path Traversal and Source Code Exposure in `start.js`
**Learning:** The custom development server constructed file paths using `'.' + req.url`, allowing attackers to read any file on the system (e.g., `../../etc/passwd`) or sensitive project files (`.env`, `server.js`) since the root directory mixes frontend and backend code.
**Prevention:** Use `path.resolve` to normalize paths and verify they start with the intended root directory. Implement strict blocklists for sensitive files/directories when serving from a root that contains mixed content.
