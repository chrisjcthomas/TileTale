## 2024-05-24 - Critical Password Exposure in Logs
**Vulnerability:** Found `console.log` statements in `script.js` that explicitly outputted the user's password to the browser console during login attempts (CWE-532).
**Learning:** Even in frontend code or "placeholder" logic, sensitive data should never be logged. This can expose credentials to anyone viewing the console or to third-party logging services.
**Prevention:** Use linting rules (like `no-console`) to flag log statements, especially in production builds. Review code for "debug" logs before committing.
