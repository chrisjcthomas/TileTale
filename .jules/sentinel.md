## 2024-05-23 - Broken Auth & Insecure State
**Vulnerability:** The OAuth flow relied on `req.cookies` to validate CSRF state, but `cookie-parser` was missing, causing all legitimate logins to fail. Additionally, the state parameter was generated using `Math.random()`.
**Learning:** Security controls (like CSRF checks) can accidentally become denial-of-service bugs if their dependencies (middleware) are missing. Developers might then be tempted to remove the check entirely.
**Prevention:** Always test the "unhappy path" (attack) AND the "happy path" (login) to ensure security controls are functional. Use linter rules to detect weak randomness.
