## 2026-01-31 - Root-Based Dev Server Info Disclosure
**Vulnerability:** The `start.js` dev server served static files from the project root (`.`) using a simple `fs.readFile` with user input, exposing `.env` secrets and backend source code (`server.js`) on the frontend port.
**Learning:** Mixing frontend assets and backend code in the root directory without a dedicated `public` folder makes secure static file serving extremely difficult. A custom file server script was used instead of standard middleware, bypassing standard protections.
**Prevention:** Always use a dedicated directory (e.g., `public/` or `dist/`) for static assets. If serving from root is necessary, implement strict allowlists or extensive blocklists for sensitive files.
