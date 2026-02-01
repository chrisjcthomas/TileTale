## 2024-05-23 - Broken Authentication via Missing Middleware
**Vulnerability:** The OAuth callback relied on `req.cookies` to verify the CSRF state token, but `cookie-parser` was missing from the middleware stack.
**Learning:** Checking for the *presence* of security code (like cookie verification logic) is not enough; one must verify the *infrastructure* (middleware) required to support it exists.
**Prevention:** Verification scripts should check for required middleware configuration, not just logic presence.
