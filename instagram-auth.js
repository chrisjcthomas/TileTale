/**
 * Instagram Authentication Module
 * Handles Instagram OAuth authentication flow and token management
 */

class InstagramAuth {
    constructor() {
        // Get API base URL from meta tag
        const apiBaseUrlMeta = document.querySelector('meta[name="api-base-url"]');
        this.apiBaseUrl = apiBaseUrlMeta ? apiBaseUrlMeta.getAttribute('content') : 'http://localhost:3000';

        // Initialize event listeners
        this.initEventListeners();

        // Check if we're in a redirect callback with token
        this.checkForAuthCallback();
    }

    /**
     * Initialize event listeners for authentication
     */
    initEventListeners() {
        // OAuth button click handler
        const oauthBtn = document.getElementById('instagram-oauth-btn');
        if (oauthBtn) {
            oauthBtn.addEventListener('click', () => {
                // If username and password are filled, use them for login
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;

                if (username && password) {
                    this.simulateSuccessfulLogin();
                } else {
                    // Otherwise initiate OAuth flow
                    this.initiateOAuth();
                }
            });
        }

        // Handle form submission
        const loginForm = document.getElementById('instagram-login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (event) => this.handleFormLogin(event));
        }
    }

    /**
     * Initiate the OAuth flow by redirecting to our backend auth endpoint
     */
    initiateOAuth() {
        // Redirect to our backend auth endpoint
        window.location.href = `${this.apiBaseUrl}/auth/instagram`;
    }

    /**
     * Handle the form-based login (username/password)
     * Note: This is for demonstration only. In a real app, you would never handle
     * username/password directly - always use OAuth flow for security.
     */
    handleFormLogin(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // For demo purposes, we'll simulate a successful login with entered credentials
        // In a real app, this would be handled by the OAuth flow
        if (username && password) {
            this.simulateSuccessfulLogin();
        } else {
            this.showError('Please enter both username and password');
        }
    }

    /**
     * Check if we're in a redirect callback with token from our backend
     */
    checkForAuthCallback() {
        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        // If there's an error in the callback
        if (error) {
            this.showError(`Authentication error: ${errorDescription || error}`);
            return;
        }

        // If we have a token, save it and redirect to feed
        if (token) {
            try {
                // Parse the JWT token to get user data
                const tokenData = this.parseJwt(token);

                // Save the token and user data
                this.saveToken({
                    access_token: token,
                    user_id: tokenData.userId,
                    expires_in: (tokenData.exp - Math.floor(Date.now() / 1000))
                });

                // Remove token from URL (for security)
                window.history.replaceState({}, document.title, '/');

                // Redirect to feed page
                window.location.href = 'feed.html';
            } catch (error) {
                this.showError('Invalid token format. Authentication failed.');
            }
        }
    }

    /**
     * Parse JWT token to get payload
     */
    parseJwt(token) {
        try {
            // Split the token and get the payload part (second part)
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error parsing JWT token', error);
            throw new Error('Invalid token format');
        }
    }

    /**
     * Save the access token to localStorage
     */
    saveToken(tokenData) {
        const tokenInfo = {
            accessToken: tokenData.access_token,
            userId: tokenData.user_id,
            expiresAt: Date.now() + (tokenData.expires_in * 1000)
        };

        localStorage.setItem('instagram_auth', JSON.stringify(tokenInfo));
    }

    /**
     * Check if the user is authenticated
     */
    isAuthenticated() {
        const authData = this.getAuthData();
        if (!authData) return false;

        // Check if token is expired
        if (Date.now() > authData.expiresAt) {
            this.logout();
            return false;
        }

        return true;
    }

    /**
     * Get the stored authentication data
     */
    getAuthData() {
        const authJson = localStorage.getItem('instagram_auth');
        if (!authJson) return null;

        try {
            return JSON.parse(authJson);
        } catch (e) {
            console.error('Error parsing auth data', e);
            return null;
        }
    }

    /**
     * Get the access token
     */
    getAccessToken() {
        const authData = this.getAuthData();
        return authData ? authData.accessToken : null;
    }

    /**
     * Log the user out
     */
    logout() {
        localStorage.removeItem('instagram_auth');
        localStorage.removeItem('instagram_auth_state');
        window.location.href = 'index.html';
    }

    /**
     * Generate a random state parameter for CSRF protection
     */
    generateRandomState() {
        return Math.random().toString(36).substring(2, 15) +
               Math.random().toString(36).substring(2, 15);
    }

    /**
     * Show an error message
     */
    showError(message) {
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';

            // Hide after 5 seconds
            setTimeout(() => {
                errorContainer.style.display = 'none';
            }, 5000);
        } else {
            console.error(message);
        }
    }

    /**
     * Show/hide loading indicator
     */
    showLoading(show) {
        // Create or get loading indicator
        let loadingEl = document.getElementById('loading-indicator');

        if (!loadingEl && show) {
            loadingEl = document.createElement('div');
            loadingEl.id = 'loading-indicator';
            loadingEl.innerHTML = '<div class="spinner"></div><p>Authenticating...</p>';
            document.body.appendChild(loadingEl);
        }

        if (loadingEl) {
            loadingEl.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * Simulate a successful login (for demo purposes only)
     */
    simulateSuccessfulLogin() {
        // Simulate API call delay
        this.showLoading(true);

        // In a real app, this would call the backend API
        // For demo purposes, we'll simulate a successful login
        setTimeout(() => {
            // Create a mock JWT token
            const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
                              btoa(JSON.stringify({
                                  userId: '12345678',
                                  username: 'demo_user',
                                  exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 60) // 60 days
                              })) +
                              '.MOCK_SIGNATURE';

            // Save the token
            this.saveToken({
                access_token: mockToken,
                user_id: '12345678',
                expires_in: 3600 * 24 * 60 // 60 days
            });

            // Hide loading indicator
            this.showLoading(false);

            // Redirect to feed page
            window.location.href = 'feed.html';
        }, 1500);
    }
}

// Initialize the Instagram authentication
const instagramAuth = new InstagramAuth();

// Export for use in other modules
window.instagramAuth = instagramAuth;




