## 2024-05-23 - Insecure OAuth State Generation & Missing Middleware
**Vulnerability:** OAuth state parameter used insecure `Math.random()`. Authentication flow was broken due to missing `cookie-parser`.
**Learning:** Security features (CSRF) often rely on basic middleware. Missing standard middleware can be a subtle security gap.
**Prevention:** Always verify required middleware (like `cookie-parser`) is present when handling cookies.
