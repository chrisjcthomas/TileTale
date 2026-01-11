## 2024-03-21 - [Weak CSRF Token Generation]
**Vulnerability:** Used `Math.random()` for generating CSRF state tokens. This is not cryptographically secure and can be predicted by an attacker.
**Learning:** Even for "random" strings like state tokens, using standard RNGs (`Math.random`) is a security risk. Always use `crypto.randomBytes`.
**Prevention:** Enforce use of `crypto` module for any security-related randomness.
