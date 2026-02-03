# Sentinel Journal

## 2024-05-23 - Critical Dev Tool Exposure
**Vulnerability:** The `start.js` development script implements a simple HTTP server that serves ANY file requested from the root directory, including `.env`, `server.js`, and `.git` config, via path traversal (e.g. `http://localhost:5500/server.js`).
**Learning:** Development tools often lack the security controls of production servers. Custom scripts like `start.js` can inadvertently expose the entire codebase if they don't validate file paths or whitelist extensions.
**Prevention:** Always implement path validation (prevent `..`) and whitelist allowed file extensions/directories even in development servers. Better yet, use established tools like `live-server` or `vite` instead of custom scripts.

## 2024-05-23 - Broken Auth & Insecure CSRF
**Vulnerability:** Authentication was completely broken due to missing `cookie-parser` middleware, causing server crashes on login. Additionally, CSRF tokens were generated using insecure `Math.random()`.
**Learning:** Core middleware dependencies can be missed if not explicitly checked. `Math.random()` is frequently misused for security contexts.
**Prevention:** Use `crypto.randomBytes()` for tokens. Verify all middleware required for authentication flows (like cookie parsing) is present and configured.
