## 2024-05-22 - Missing Middleware breaks CSRF Protection
**Vulnerability:** The application attempted to implement CSRF protection using a state cookie, but the `cookie-parser` middleware was missing. This meant the CSRF check would always fail (DoS) or potentially be bypassed if logic was loose.
**Learning:** Security features often depend on underlying infrastructure (middleware) being present. A missing dependency can render a security control useless.
**Prevention:** Ensure all middleware required for security checks (like cookie parsers, body parsers) are installed and configured in the main application entry point.

## 2024-05-22 - Weak Randomness in CSRF State
**Vulnerability:** `Math.random()` was used to generate CSRF state parameters.
**Learning:** Developers often reach for `Math.random()` for all random needs, forgetting it is not cryptographically secure.
**Prevention:** Always use `crypto.randomBytes` or `crypto.randomUUID` for security-sensitive tokens.
