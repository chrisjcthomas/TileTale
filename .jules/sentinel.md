## 2024-05-22 - Path Traversal in Development Server
**Vulnerability:** The `start.js` development server blindly concatenated `.` with `req.url` to serve files, exposing the entire project root (including source code and configuration) on the frontend port.
**Learning:** Development tools often lack the security rigor of production code but can be just as dangerous if they expose sensitive data or are accidentally deployed.
**Prevention:** Always validate file paths and use allow-lists for static file servers, even in development scripts. Never assume the "root" is safe to expose.

## 2025-02-09 - Weak CSRF Token Generation
**Vulnerability:** Used `Math.random()` to generate OAuth state parameters, which are used as CSRF tokens. `Math.random()` is not cryptographically secure and predictable.
**Learning:** Developers often use `Math.random()` for convenience when `crypto` is not top of mind or they assume "random" is good enough for temporary tokens.
**Prevention:** Always use `crypto.randomBytes()` or `crypto.webcrypto.getRandomValues()` for any security-sensitive random values (tokens, nonces, keys).
