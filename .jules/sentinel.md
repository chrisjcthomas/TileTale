## 2026-01-15 - Weak CSRF Token Generation
**Vulnerability:** The application used `Math.random()` to generate CSRF state tokens, which is not cryptographically secure and makes the tokens predictable.
**Learning:** Even simple random strings for security purposes must use `crypto` (e.g., `crypto.randomBytes`). `Math.random` is never sufficient for security tokens.
**Prevention:** Always use `crypto.randomBytes` or `crypto.randomUUID` for generating nonces, session IDs, or CSRF tokens.

## 2026-01-15 - Missing Middleware Dependencies
**Vulnerability:** The application relied on `req.cookies` in `routes/auth.js` but `cookie-parser` was not configured in the main application, causing authentication flows to crash or fail silently.
**Learning:** Middleware dependencies (like `cookie-parser`) must be explicitly configured in the main app entry point (`server.js`) if route handlers rely on them. Do not assume they are present.
**Prevention:** Verify all required middleware is installed and configured in `server.js` or apply it locally in the router if it's specific to a route.
