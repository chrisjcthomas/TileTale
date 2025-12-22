## 2024-03-24 - Insecure CSRF Token Generation
**Vulnerability:** Used `Math.random()` for generating CSRF state tokens in `routes/auth.js`.
**Learning:** `Math.random()` is not cryptographically secure and predictable, making CSRF tokens guessable.
**Prevention:** Always use `crypto.randomBytes()` (or `crypto.getRandomValues()` in frontend) for security-critical random values.
