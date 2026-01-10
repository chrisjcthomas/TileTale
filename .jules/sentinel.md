## 2026-01-10 - Development Server Information Disclosure
**Vulnerability:** The development server script (`start.js`) was serving all files in the root directory via a simple HTTP server, allowing access to sensitive files like `.env`, `config.js`, and source code.
**Learning:** Development tools and scripts often lack the rigorous security controls of production servers but can still expose sensitive data if misconfigured or exposed. Simple `fs.readFile` implementations based on user input are dangerous even in local tools.
**Prevention:** Always implement path sanitization (normalization) and whitelist/blacklist checks when serving files, even in development scripts. Ensure sensitive files are explicitly blocked or, better yet, serve only a dedicated public directory.
