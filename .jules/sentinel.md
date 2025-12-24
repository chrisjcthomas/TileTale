## 2024-05-23 - Auth Flow Security Enhancements
**Vulnerability:** Weak Randomness (CWE-330) in CSRF state generation and Information Exposure (CWE-200) via URL query parameters.
**Learning:** The auth flow was broken due to missing `cookie-parser`, which also prevented the CSRF check from working. `Math.random()` was used for security tokens.
**Prevention:** Always use `crypto.randomBytes` for security tokens. Pass sensitive tokens via URL fragments (`#`) instead of query parameters (`?`) to avoid logging. Ensure middleware dependencies like `cookie-parser` are present.
