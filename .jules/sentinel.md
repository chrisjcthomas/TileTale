## 2025-02-09 - Weak CSRF Token Generation
**Vulnerability:** Used `Math.random()` to generate OAuth state parameters, which are used as CSRF tokens. `Math.random()` is not cryptographically secure and predictable.
**Learning:** Developers often use `Math.random()` for convenience when `crypto` is not top of mind or they assume "random" is good enough for temporary tokens.
**Prevention:** Always use `crypto.randomBytes()` or `crypto.webcrypto.getRandomValues()` for any security-sensitive random values (tokens, nonces, keys).
