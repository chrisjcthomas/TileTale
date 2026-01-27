## 2026-01-27 - Broken Auth Flow and Weak Randomness
**Vulnerability:** Authentication was non-functional due to missing `cookie-parser` dependency, and relied on insecure `Math.random()` for CSRF tokens.
**Learning:** The project mixed "demo" logic with production routes, leading to missing dependencies (`cookie-parser`) that broke security features (CSRF checks).
**Prevention:** Always verify that security-critical middleware (like cookie parsers) is installed and configured. Use `crypto.randomBytes` instead of `Math.random` for any security tokens.
