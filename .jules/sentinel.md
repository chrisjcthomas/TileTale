## 2024-03-21 - [Weak PRNG and Missing Middleware]
**Vulnerability:** Weak Random Number Generator (Math.random) used for CSRF tokens. Missing `cookie-parser` middleware preventing CSRF check from working.
**Learning:** `Math.random()` is not cryptographically secure. Functional bugs (missing middleware) can mask security vulnerabilities or prevent security features from working.
**Prevention:** Use `crypto.randomBytes` for security tokens. Ensure all used middleware is installed and configured.
