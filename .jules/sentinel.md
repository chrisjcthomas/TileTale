## 2024-05-22 - Missing Cookie Parser Middleware
**Vulnerability:** The application relied on `req.cookies` to verify CSRF tokens during the OAuth callback, but the `cookie-parser` middleware was missing from the Express application. This meant `req.cookies` was always undefined, likely causing authentication to fail or (if the check was flawed) potentially bypassing CSRF protection.
**Learning:** Always verify that necessary middleware is installed and configured when implementing features that rely on specific request properties (like cookies). Code can look correct (e.g., `req.cookies.token`) but fail silently or catastrophically if the underlying parser is missing.
**Prevention:** Add integration tests that specifically exercise the full authentication flow, including cookie setting and retrieval, to catch missing middleware early.

## 2024-05-22 - Insecure Random Number Generation for CSRF Tokens
**Vulnerability:** The application used `Math.random()` to generate the `state` parameter for OAuth CSRF protection. `Math.random()` is not cryptographically secure and can be predicted, potentially allowing an attacker to forge the state parameter.
**Learning:** Never use `Math.random()` for security-critical values like tokens, nonces, or keys.
**Prevention:** Use `crypto.randomBytes()` (or `crypto.webcrypto` in newer environments) for all security-related random value generation.
