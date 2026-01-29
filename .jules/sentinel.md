
## 2026-01-29 - Critical Path Traversal in Dev Server
**Vulnerability:** The `start.js` development server blindly concatenated `req.url` to the file path (`'.' + req.url`), allowing arbitrary file read (path traversal) and source code disclosure.
**Learning:** Development tools often lack the security rigor of production code but can be just as dangerous if they expose sensitive data (secrets in `.env` or config) or are exposed to a wider network. In this project, the flat file structure (frontend mixed with backend) made this worse.
**Prevention:** Always validate and sanitize file paths in custom file servers. Use `path.normalize` and check that the resolved path is within the intended root (`startsWith`). Whitelist allowed files/directories or strictly blacklist sensitive ones.
