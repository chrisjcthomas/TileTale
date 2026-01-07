## 2024-03-24 - [CRITICAL] Dev Server Path Traversal and Source Disclosure
**Vulnerability:** The `start.js` development script serves files from the root directory (`.`) using `req.url` without restrictions. This allows unauthenticated access to backend source code, configuration files, and secrets (e.g., `.env`, `config.js`) via the frontend port (5500).
**Learning:** Development tools are often overlooked in security audits but can expose the entire application structure and secrets if accessible.
**Prevention:** Implement a blacklist or whitelist mechanism in dev servers. In this case, we added a blacklist to block access to sensitive files and directories.

## 2024-03-24 - [HIGH] Weak Randomness in CSRF State
**Vulnerability:** The authentication flow used `Math.random()` to generate CSRF state tokens. This is not cryptographically secure and can be predicted.
**Learning:** Always use `crypto.randomBytes` or similar CSPRNGs for security tokens.
**Prevention:** Replaced `Math.random()` with `crypto.randomBytes(16).toString('hex')`.
