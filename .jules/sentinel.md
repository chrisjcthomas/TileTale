## 2024-02-14 - Weak Randomness in Auth State
**Vulnerability:** The OAuth state parameter was generated using `Math.random()`, which is not cryptographically secure and predictable.
**Learning:** Even simple "random" strings for security tokens must use CSPRNG. `Math.random` is never safe for security contexts. Additionally, missing middleware (`cookie-parser`) can silently break security checks (state validation) if not tested.
**Prevention:** Use `crypto.randomBytes()` for all security tokens. Verify middleware stack includes necessary parsers for security logic to function.
