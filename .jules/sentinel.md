# Sentinel's Journal

## 2024-05-22 - Exposed Credentials in Client-Side Logs
**Vulnerability:** The login form in `script.js` was logging the username and password to the browser console using `console.log`.
**Learning:** This existed likely as a debugging aid during development or as a placeholder for actual backend integration. Even in demo code, this trains developers to treat credentials insecurely.
**Prevention:** Remove `console.log` statements involving sensitive data. Ensure debugging logs are stripped in production or use a logging level that excludes sensitive data.
