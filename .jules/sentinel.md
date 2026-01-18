## 2024-05-23 - Weak CSRF Token Generation
**Vulnerability:** The application used `Math.random()` to generate CSRF state tokens, which is not cryptographically secure and predictable.
**Learning:** Even for "random" tokens used in OAuth flows, using non-secure RNGs can compromise the integrity of the authentication process.
**Prevention:** Always use `crypto.randomBytes()` or `crypto.webcrypto` for security-critical random values.

## 2024-05-23 - Missing Middleware Dependency
**Vulnerability:** The application relied on `req.cookies` but did not have `cookie-parser` middleware installed or configured, causing the auth flow to crash or fail silently.
**Learning:** Always verify that expected middleware is actually present in the server configuration. Do not assume `req.cookies` is populated by Express default.
**Prevention:** Explicitly check for necessary middleware or implement fallback mechanisms if adding dependencies is restricted.
