## 2026-02-05 - Insecure Randomness in OAuth State
**Vulnerability:** Used `Math.random()` to generate CSRF state parameters in OAuth flow.
**Learning:** Developers often reach for `Math.random()` for convenience, but it is not cryptographically secure, making CSRF tokens predictable.
**Prevention:** Enforce use of `crypto.randomBytes()` or `crypto.randomUUID()` for all security-sensitive values via linter rules or code review.
