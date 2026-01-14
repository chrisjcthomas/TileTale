## 2024-05-22 - Unsafe Development Server Exposure
**Vulnerability:** The `start.js` script (used for `npm run dev:all`) serves static files from the project root (`.`) based on `req.url` without validation.
**Learning:** This exposes backend source code, configuration files (including `.env`), and secrets to anyone who can access the frontend port (5500). The mixing of frontend and backend files in the root directory encouraged this insecure pattern.
**Prevention:** Development servers should map specific public directories (e.g., `/public`) or use whitelisting for allowed files. Do not serve the project root directly.
