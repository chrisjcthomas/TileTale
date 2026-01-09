## 2026-01-09 - Path Traversal & Source Code Disclosure
**Vulnerability:** The custom static file server (`start.js`) allowed serving any file from the root directory, including backend source code (`server.js`) and configuration (`config.js`).
**Learning:** Serving static files from the project root in a mixed frontend/backend codebase is dangerous. It makes it difficult to separate public assets from private backend code.
**Prevention:** Always use a dedicated `public/` directory for static assets. If that's not possible, implement strict allowlists for file extensions and blocklists for sensitive files/directories. Using standard middleware like `express.static` with a specific root is safer than custom implementations.
