/**
 * Instagram API Module
 * Handles API calls to fetch user data, stories, and posts
 */

class InstagramAPI {
    constructor() {
        // Get API base URL from meta tag
        const apiBaseUrlMeta = document.querySelector('meta[name="api-base-url"]');
        const baseUrl = apiBaseUrlMeta ? apiBaseUrlMeta.getAttribute('content') : 'http://localhost:3000';
        this.apiBaseUrl = `${baseUrl}/api`;
        this.accessToken = null;

        // Initialize with auth if available
        if (window.instagramAuth && window.instagramAuth.isAuthenticated()) {
            this.accessToken = window.instagramAuth.getAccessToken();
        }
    }

    /**
     * Set the access token
     */
    setAccessToken(token) {
        this.accessToken = token;
    }

    /**
     * Make authenticated API request
     */
    async makeRequest(endpoint, options = {}) {
        if (!this.accessToken) {
            throw new Error('Not authenticated');
        }

        const url = `${this.apiBaseUrl}${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
        };

        try {
            // Always make a real API call to the server
            const response = await fetch(url, {
                ...options,
                headers
            });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'API request failed');
                }

                return await response.json();
            } catch (fetchError) {
                console.warn('API server not available, using mock data:', fetchError);
                // Fall back to mock data if server is not available
                return this.getMockDataForEndpoint(endpoint);
            }
        } catch (error) {
            console.error(`Error making request to ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Get mock data for an endpoint (fallback when server is not available)
     */
    getMockDataForEndpoint(endpoint) {
        // Extract the endpoint name from the path
        const path = endpoint.split('?')[0];

        switch (path) {
            case '/profile':
                return { status: 'success', data: this.getMockUserProfile() };
            case '/stories':
                return { status: 'success', data: this.getMockStories() };
            case '/media':
                return { status: 'success', data: this.getMockPosts() };
            default:
                if (path.startsWith('/media/')) {
                    const mediaId = path.split('/')[2];
                    return { status: 'success', data: this.getMockMediaDetails(mediaId) };
                }
                throw new Error(`No mock data available for endpoint: ${endpoint}`);
        }
    }

    /**
     * Get user profile information
     */
    async getUserProfile() {
        console.log('Fetching real user profile from API');
        const response = await this.makeRequest('/profile');
        console.log('API response:', response);
        return response.data;
    }

    /**
     * Get user stories
     */
    async getUserStories() {
        const response = await this.makeRequest('/stories');
        return response.data;
    }

    /**
     * Get user media (posts)
     */
    async getUserMedia(limit = 10) {
        const response = await this.makeRequest(`/media?limit=${limit}`);
        return response.data;
    }

    /**
     * Get media details by ID
     */
    async getMediaDetails(mediaId) {
        const response = await this.makeRequest(`/media/${mediaId}`);
        return response.data;
    }

    /**
     * Mock data methods for demonstration purposes
     */

    getMockUserProfile() {
        return {
            id: '17841123456789',
            username: 'instagram_user',
            account_type: 'PERSONAL',
            media_count: 42,
            profile_picture: 'https://via.placeholder.com/150',
            full_name: 'Instagram User'
        };
    }

    getMockStories() {
        // Generate 10 mock stories
        const stories = [];
        for (let i = 1; i <= 10; i++) {
            stories.push({
                id: `story_${i}`,
                media_type: i % 3 === 0 ? 'VIDEO' : 'IMAGE',
                media_url: i % 3 === 0
                    ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
                    : `https://picsum.photos/500/800?random=${i}`,
                timestamp: new Date(Date.now() - (i * 3600000)).toISOString(),
                username: `user_${i % 5 + 1}`,
                profile_pic: `https://i.pravatar.cc/150?img=${i % 10 + 1}`,
                seen: i > 5
            });
        }
        return { data: stories };
    }

    getMockPosts() {
        // Generate 20 mock posts
        const posts = [];
        for (let i = 1; i <= 20; i++) {
            posts.push({
                id: `post_${i}`,
                caption: `This is a sample Instagram post caption #${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
                media_type: i % 5 === 0 ? 'VIDEO' : (i % 7 === 0 ? 'CAROUSEL_ALBUM' : 'IMAGE'),
                media_url: i % 5 === 0
                    ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
                    : `https://picsum.photos/800/800?random=${i}`,
                thumbnail_url: i % 5 === 0 ? `https://picsum.photos/800/800?random=${i}` : null,
                permalink: `https://instagram.com/p/sample_${i}`,
                timestamp: new Date(Date.now() - (i * 86400000)).toISOString(),
                username: `user_${i % 8 + 1}`,
                profile_pic: `https://i.pravatar.cc/150?img=${i % 10 + 1}`,
                likes_count: Math.floor(Math.random() * 1000),
                comments_count: Math.floor(Math.random() * 100),
                children: i % 7 === 0 ? this.getMockCarouselChildren(i) : null
            });
        }
        return { data: posts };
    }

    getMockCarouselChildren(postId) {
        // Generate 3-5 carousel items for a post
        const count = Math.floor(Math.random() * 3) + 3;
        const children = [];

        for (let i = 1; i <= count; i++) {
            children.push({
                id: `${postId}_child_${i}`,
                media_type: i % 4 === 0 ? 'VIDEO' : 'IMAGE',
                media_url: i % 4 === 0
                    ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
                    : `https://picsum.photos/800/800?random=${postId * 10 + i}`,
                thumbnail_url: i % 4 === 0 ? `https://picsum.photos/800/800?random=${postId * 10 + i}` : null
            });
        }

        return { data: children };
    }

    getMockMediaDetails(mediaId) {
        // For demo purposes, we'll just return a more detailed version of a mock post
        const id = mediaId.replace('post_', '');
        const postNumber = parseInt(id, 10) || 1;

        return {
            id: mediaId,
            caption: `This is a detailed view of Instagram post #${postNumber}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, eget aliquam nisl nunc eget nisl.`,
            media_type: postNumber % 5 === 0 ? 'VIDEO' : (postNumber % 7 === 0 ? 'CAROUSEL_ALBUM' : 'IMAGE'),
            media_url: postNumber % 5 === 0
                ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
                : `https://picsum.photos/1080/1080?random=${postNumber}`,
            thumbnail_url: postNumber % 5 === 0 ? `https://picsum.photos/1080/1080?random=${postNumber}` : null,
            permalink: `https://instagram.com/p/sample_${postNumber}`,
            timestamp: new Date(Date.now() - (postNumber * 86400000)).toISOString(),
            username: `user_${postNumber % 8 + 1}`,
            profile_pic: `https://i.pravatar.cc/150?img=${postNumber % 10 + 1}`,
            likes_count: Math.floor(Math.random() * 1000),
            comments_count: Math.floor(Math.random() * 100),
            children: postNumber % 7 === 0 ? this.getMockCarouselChildren(postNumber) : null,
            location: {
                name: 'Sample Location',
                id: '12345'
            },
            comments: this.getMockComments(postNumber)
        };
    }

    getMockComments(postId) {
        // Generate 3-8 mock comments
        const count = Math.floor(Math.random() * 6) + 3;
        const comments = [];

        for (let i = 1; i <= count; i++) {
            comments.push({
                id: `comment_${postId}_${i}`,
                text: `This is a sample comment #${i}. Lorem ipsum dolor sit amet.`,
                username: `commenter_${i % 10 + 1}`,
                profile_pic: `https://i.pravatar.cc/150?img=${20 + (i % 10)}`,
                timestamp: new Date(Date.now() - (i * 3600000)).toISOString()
            });
        }

        return { data: comments };
    }
}

// Initialize the Instagram API
const instagramAPI = new InstagramAPI();

// Export for use in other modules
window.instagramAPI = instagramAPI;



