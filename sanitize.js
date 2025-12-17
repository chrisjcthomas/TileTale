/**
 * Sanitization utilities for Instagram Viewer
 * Prevents XSS attacks by escaping HTML and sanitizing URLs
 */

(function(window) {
    /**
     * Escapes HTML special characters to prevent XSS
     * @param {string} str - The string to escape
     * @return {string} - The escaped string
     */
    function escapeHTML(str) {
        if (!str) return '';
        // Convert to string if not already
        const stringValue = String(str);

        return stringValue.replace(/[&<>"']/g, function(m) {
            switch (m) {
                case '&': return '&amp;';
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '"': return '&quot;';
                case "'": return '&#039;';
                default: return m;
            }
        });
    }

    /**
     * Sanitizes URLs to prevent javascript: protocol
     * @param {string} url - The URL to sanitize
     * @return {string} - The sanitized and escaped URL
     */
    function sanitizeUrl(url) {
        if (!url) return '';
        const stringUrl = String(url);

        // Block javascript: protocol
        if (stringUrl.trim().toLowerCase().startsWith('javascript:')) {
            return 'about:blank';
        }

        // Escape the URL to be safe for HTML attributes
        return escapeHTML(stringUrl);
    }

    // Expose functions globally
    window.escapeHTML = escapeHTML;
    window.sanitizeUrl = sanitizeUrl;

})(window);
