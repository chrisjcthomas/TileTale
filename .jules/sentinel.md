## 2025-01-26 - Insecure CSRF Token Generation & Missing Middleware
**Vulnerability:** CSRF protection relied on `Math.random()`, which is cryptographically insecure and predictable. Additionally, `cookie-parser` was missing, causing the application to crash (DoS) when attempting to verify the CSRF token from cookies.
**Learning:** Authentication flows often depend on specific middleware (like `cookie-parser`) that are not included by default in Express 4+. Missing these creates functional bugs that look like security failures.
**Prevention:** Use `crypto.randomBytes()` for all security-sensitive token generation. Verify middleware dependencies are installed and configured for all parts of the request object accessed (cookies, body, etc.).
