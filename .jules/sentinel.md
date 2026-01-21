## 2025-05-25 - Weak PRNG for CSRF State
**Vulnerability:** Used `Math.random()` for generating OAuth state parameters in `routes/auth.js`.
**Learning:** Even in "demo" or initial integration code, insecure patterns like `Math.random()` for security tokens can persist if not caught early.
**Prevention:** Always use `crypto.randomBytes` or `crypto.getRandomValues` for any security-related randomness (tokens, nonces, keys).
