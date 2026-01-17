# Sentinel Journal

## 2024-05-24 - CSRF State Generation
**Vulnerability:** CSRF state generation in `routes/auth.js` uses `Math.random()`, which is not cryptographically secure.
**Learning:** `Math.random()` is predictable and should not be used for security-critical values like CSRF tokens or nonces.
**Prevention:** Use `crypto.randomBytes` or a dedicated library for generating secure random strings.
