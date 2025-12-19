## 2024-05-23 - [CRITICAL] Sensitive Data Exposure in Frontend
**Vulnerability:** Hardcoded logging of user credentials (username/password) to the browser console in `script.js`.
**Learning:** Even client-side code can expose sensitive data if developers use `console.log` for debugging and forget to remove it. This is a common pattern in "demo" or "starter" code that can be dangerous if copy-pasted into production.
**Prevention:**
1. Use a linter rule like `no-console` (warn or error) to catch these during development.
2. Review client-side code for any logging of input fields, especially those named "password", "token", "key", etc.
