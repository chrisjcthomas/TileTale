## 2024-05-22 - Weak Randomness in Auth Flow
**Vulnerability:** Used `Math.random()` for generating CSRF state tokens in `routes/auth.js`.
**Learning:** Common pattern in this codebase (also seen in frontend). Developers might copy-paste insecure random generation snippets.
**Prevention:** Enforce use of `crypto.randomBytes()` for all security tokens via linter rules or code reviews.

## 2024-05-22 - Missing Middleware Crash Risk
**Vulnerability:** `req.cookies` accessed without checking existence, and `cookie-parser` is missing.
**Learning:** Express middleware dependencies (like `cookie-parser`) are assumed but not installed.
**Prevention:** Verify all `req` properties (cookies, body, etc.) are populated by middleware or access them safely.
