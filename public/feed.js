/**
 * Feed Page JavaScript
 * Handles loading and displaying Instagram stories and posts
 */

class InstagramFeed {
    constructor() {
        // Check authentication
        if (!window.instagramAuth || !window.instagramAuth.isAuthenticated()) {
            window.location.href = 'index.html';
            return;
        }
        
        // Initialize API
        this.api = window.instagramAPI;
        
        // Initialize UI elements
        this.storiesContainer = document.getElementById('stories-scroll');
        this.postsContainer = document.getElementById('posts-container');
        this.profilePicture = document.getElementById('profile-picture');
        this.profileUsername = document.getElementById('profile-username');
        this.profileStats = document.getElementById('profile-stats');
        
        // Story viewer elements
        this.storyModal = document.getElementById('story-modal');
        this.storyContent = this.storyModal.querySelector('.story-content');
        this.storyUserPic = this.storyModal.querySelector('.story-user-pic');
        this.storyUsername = this.storyModal.querySelector('.story-username');
        this.storyTime = this.storyModal.querySelector('.story-time');
        this.storyProgress = this.storyModal.querySelector('.story-progress');
        this.prevStoryBtn = this.storyModal.querySelector('.prev-story');
        this.nextStoryBtn = this.storyModal.querySelector('.next-story');
        
        // Post detail elements
        this.postModal = document.getElementById('post-modal');
        this.postDetailMedia = this.postModal.querySelector('.post-detail-media');
        this.postUserPic = this.postModal.querySelector('.post-user-pic');
        this.postUsername = this.postModal.querySelector('.post-username');
        this.postLocation = this.postModal.querySelector('.post-location');
        this.postDetailCaption = this.postModal.querySelector('.post-detail-caption');
        this.postLikesCount = this.postModal.querySelector('.likes-count');
        this.postCommentsCount = this.postModal.querySelector('.comments-count');
        this.postTime = this.postModal.querySelector('.post-time');
        this.postDetailComments = this.postModal.querySelector('.post-detail-comments');
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Load data
        this.loadUserProfile();
        this.loadStories();
        this.loadPosts();
    }
    
    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-feed');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshFeed());
        }
        
        // Logout link
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.instagramAuth.logout();
            });
        }
        
        // Close modals
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.storyModal.style.display = 'none';
                this.postModal.style.display = 'none';
                
                // Pause any videos
                const videos = document.querySelectorAll('video');
                videos.forEach(video => video.pause());
            });
        });
        
        // Story navigation
        this.prevStoryBtn.addEventListener('click', () => this.navigateStory(-1));
        this.nextStoryBtn.addEventListener('click', () => this.navigateStory(1));
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.storyModal) {
                this.storyModal.style.display = 'none';
            }
            if (e.target === this.postModal) {
                this.postModal.style.display = 'none';
                
                // Pause any videos
                const videos = document.querySelectorAll('video');
                videos.forEach(video => video.pause());
            }
        });
    }
    
    /**
     * Load user profile information
     */
    async loadUserProfile() {
        try {
            const profile = await this.api.getUserProfile();
            
            // Update UI
            this.profilePicture.src = profile.profile_picture;
            this.profileUsername.textContent = profile.username;
            this.profileStats.textContent = `${profile.media_count} posts`;
        } catch (error) {
            this.showError('Error loading profile: ' + error.message);
        }
    }
    
    /**
     * Load stories
     */
    async loadStories() {
        try {
            const response = await this.api.getUserStories();
            const stories = response.data;
            
            // Clear loading indicator
            this.storiesContainer.innerHTML = '';
            
            if (stories.length === 0) {
                this.storiesContainer.innerHTML = '<p class="no-content">No stories available</p>';
                return;
            }
            
            // Render stories
            stories.forEach(story => {
                const storyEl = document.createElement('div');
                storyEl.className = `story-item ${story.seen ? 'seen' : ''}`;
                
                storyEl.innerHTML = `
                    <div class="story-avatar">
                        <img src="${story.profile_pic}" alt="${story.username}">
                    </div>
                    <span class="story-username">${story.username}</span>
                `;
                
                // Add click event to view story
                storyEl.addEventListener('click', () => this.viewStory(story, stories));
                
                this.storiesContainer.appendChild(storyEl);
            });
        } catch (error) {
            this.showError('Error loading stories: ' + error.message);
            this.storiesContainer.innerHTML = '<p class="error">Failed to load stories</p>';
        }
    }
    
    /**
     * Load posts
     */
    async loadPosts() {
        try {
            const response = await this.api.getUserMedia();
            const posts = response.data;
            
            // Clear loading indicator
            this.postsContainer.innerHTML = '';
            
            if (posts.length === 0) {
                this.postsContainer.innerHTML = '<p class="no-content">No posts available</p>';
                return;
            }
            
            // Render posts
            posts.forEach(post => {
                const postEl = document.createElement('div');
                postEl.className = 'post-item';
                
                // Format date
                const postDate = new Date(post.timestamp);
                const formattedDate = postDate.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
                // Create post HTML
                postEl.innerHTML = `
                    <div class="post-header">
                        <img src="${post.profile_pic}" alt="${post.username}" class="post-user-pic">
                        <span class="post-username">${post.username}</span>
                    </div>
                    <div class="post-media">
                        ${this.renderPostMedia(post)}
                    </div>
                    <div class="post-actions">
                        <button class="post-action-btn like-btn"><i class="far fa-heart"></i></button>
                        <button class="post-action-btn comment-btn"><i class="far fa-comment"></i></button>
                        <button class="post-action-btn share-btn"><i class="far fa-paper-plane"></i></button>
                    </div>
                    <div class="post-info">
                        <div class="post-likes">${post.likes_count} likes</div>
                        <div class="post-caption">
                            <span class="post-username">${post.username}</span>
                            ${post.caption}
                        </div>
                        <div class="post-comments-preview">
                            ${post.comments_count > 0 ? `View all ${post.comments_count} comments` : 'No comments yet'}
                        </div>
                        <div class="post-time">${formattedDate}</div>
                    </div>
                `;
                
                // Add click event to view post details
                postEl.querySelector('.post-media').addEventListener('click', () => this.viewPostDetails(post.id));
                postEl.querySelector('.post-comments-preview').addEventListener('click', () => this.viewPostDetails(post.id));
                
                this.postsContainer.appendChild(postEl);
            });
        } catch (error) {
            this.showError('Error loading posts: ' + error.message);
            this.postsContainer.innerHTML = '<p class="error">Failed to load posts</p>';
        }
    }
    
    /**
     * Render post media based on type
     */
    renderPostMedia(post) {
        switch (post.media_type) {
            case 'VIDEO':
                return `
                    <video controls poster="${post.thumbnail_url || ''}">
                        <source src="${post.media_url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `;
            case 'CAROUSEL_ALBUM':
                return `
                    <div class="carousel-indicator">
                        <i class="fas fa-clone"></i>
                    </div>
                    <img src="${post.media_url}" alt="Post">
                `;
            default: // IMAGE
                return `<img src="${post.media_url}" alt="Post">`;
        }
    }
    
    /**
     * View a story
     */
    viewStory(story, allStories) {
        this.currentStories = allStories;
        this.currentStoryIndex = allStories.findIndex(s => s.id === story.id);
        
        // Display the story
        this.displayCurrentStory();
        
        // Show the modal
        this.storyModal.style.display = 'flex';
    }
    
    /**
     * Display the current story
     */
    displayCurrentStory() {
        const story = this.currentStories[this.currentStoryIndex];
        
        // Update story header
        this.storyUserPic.src = story.profile_pic;
        this.storyUsername.textContent = story.username;
        
        // Format time
        const storyTime = new Date(story.timestamp);
        const timeAgo = this.getTimeAgo(storyTime);
        this.storyTime.textContent = timeAgo;
        
        // Update story content
        this.storyContent.innerHTML = '';
        
        if (story.media_type === 'VIDEO') {
            const video = document.createElement('video');
            video.src = story.media_url;
            video.controls = true;
            video.autoplay = true;
            this.storyContent.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = story.media_url;
            img.alt = 'Story';
            this.storyContent.appendChild(img);
        }
        
        // Update progress bars
        this.storyProgress.innerHTML = '';
        this.currentStories.forEach((s, index) => {
            const progressBar = document.createElement('div');
            progressBar.className = 'story-progress-bar';
            
            if (index < this.currentStoryIndex) {
                progressBar.classList.add('completed');
            } else if (index === this.currentStoryIndex) {
                progressBar.classList.add('active');
            }
            
            this.storyProgress.appendChild(progressBar);
        });
        
        // Update navigation buttons
        this.prevStoryBtn.style.visibility = this.currentStoryIndex > 0 ? 'visible' : 'hidden';
        this.nextStoryBtn.style.visibility = this.currentStoryIndex < this.currentStories.length - 1 ? 'visible' : 'hidden';
    }
    
    /**
     * Navigate between stories
     */
    navigateStory(direction) {
        const newIndex = this.currentStoryIndex + direction;
        
        if (newIndex >= 0 && newIndex < this.currentStories.length) {
            this.currentStoryIndex = newIndex;
            this.displayCurrentStory();
        }
    }
    
    /**
     * View post details
     */
    async viewPostDetails(postId) {
        try {
            const post = await this.api.getMediaDetails(postId);
            
            // Update post details in modal
            this.postUserPic.src = post.profile_pic;
            this.postUsername.textContent = post.username;
            this.postLocation.textContent = post.location ? post.location.name : '';
            this.postDetailCaption.innerHTML = `<span class="post-username">${post.username}</span> ${post.caption}`;
            this.postLikesCount.textContent = post.likes_count;
            this.postCommentsCount.textContent = post.comments_count;
            
            // Format time
            const postTime = new Date(post.timestamp);
            const formattedDate = postTime.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            this.postTime.textContent = formattedDate;
            
            // Render media
            this.renderPostDetailMedia(post);
            
            // Render comments
            this.renderPostComments(post.comments);
            
            // Show the modal
            this.postModal.style.display = 'flex';
        } catch (error) {
            this.showError('Error loading post details: ' + error.message);
        }
    }
    
    /**
     * Render post detail media
     */
    renderPostDetailMedia(post) {
        this.postDetailMedia.innerHTML = '';
        
        if (post.media_type === 'CAROUSEL_ALBUM' && post.children && post.children.data) {
            // Create carousel
            const carousel = document.createElement('div');
            carousel.className = 'carousel';
            
            post.children.data.forEach((item, index) => {
                const slide = document.createElement('div');
                slide.className = 'carousel-slide';
                slide.style.display = index === 0 ? 'block' : 'none';
                
                if (item.media_type === 'VIDEO') {
                    slide.innerHTML = `
                        <video controls autoplay poster="${item.thumbnail_url || ''}">
                            <source src="${item.media_url}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    `;
                } else {
                    slide.innerHTML = `<img src="${item.media_url}" alt="Post">`;
                }
                
                carousel.appendChild(slide);
            });
            
            // Add navigation if more than one item
            if (post.children.data.length > 1) {
                const prevBtn = document.createElement('button');
                prevBtn.className = 'carousel-nav prev';
                prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
                
                const nextBtn = document.createElement('button');
                nextBtn.className = 'carousel-nav next';
                nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
                
                let currentSlide = 0;
                
                prevBtn.addEventListener('click', () => {
                    const slides = carousel.querySelectorAll('.carousel-slide');
                    slides[currentSlide].style.display = 'none';
                    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                    slides[currentSlide].style.display = 'block';
                });
                
                nextBtn.addEventListener('click', () => {
                    const slides = carousel.querySelectorAll('.carousel-slide');
                    slides[currentSlide].style.display = 'none';
                    currentSlide = (currentSlide + 1) % slides.length;
                    slides[currentSlide].style.display = 'block';
                });
                
                carousel.appendChild(prevBtn);
                carousel.appendChild(nextBtn);
            }
            
            this.postDetailMedia.appendChild(carousel);
        } else if (post.media_type === 'VIDEO') {
            this.postDetailMedia.innerHTML = `
                <video controls autoplay poster="${post.thumbnail_url || ''}">
                    <source src="${post.media_url}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            `;
        } else {
            this.postDetailMedia.innerHTML = `<img src="${post.media_url}" alt="Post">`;
        }
    }
    
    /**
     * Render post comments
     */
    renderPostComments(comments) {
        this.postDetailComments.innerHTML = '';
        
        if (!comments || !comments.data || comments.data.length === 0) {
            this.postDetailComments.innerHTML = '<p class="no-comments">No comments yet</p>';
            return;
        }
        
        comments.data.forEach(comment => {
            const commentEl = document.createElement('div');
            commentEl.className = 'comment';
            
            // Format time
            const commentTime = new Date(comment.timestamp);
            const timeAgo = this.getTimeAgo(commentTime);
            
            commentEl.innerHTML = `
                <img src="${comment.profile_pic}" alt="${comment.username}" class="comment-user-pic">
                <div class="comment-content">
                    <div class="comment-text">
                        <span class="comment-username">${comment.username}</span>
                        ${comment.text}
                    </div>
                    <div class="comment-meta">
                        <span class="comment-time">${timeAgo}</span>
                        <button class="comment-like-btn">Like</button>
                    </div>
                </div>
            `;
            
            this.postDetailComments.appendChild(commentEl);
        });
    }
    
    /**
     * Refresh the feed
     */
    refreshFeed() {
        // Clear containers
        this.storiesContainer.innerHTML = '<div class="loading-indicator"><div class="spinner"></div></div>';
        this.postsContainer.innerHTML = '<div class="loading-indicator"><div class="spinner"></div></div>';
        
        // Reload data
        this.loadUserProfile();
        this.loadStories();
        this.loadPosts();
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
     * Get time ago string
     */
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        let interval = Math.floor(seconds / 31536000);
        if (interval > 1) return interval + ' years ago';
        if (interval === 1) return '1 year ago';
        
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) return interval + ' months ago';
        if (interval === 1) return '1 month ago';
        
        interval = Math.floor(seconds / 86400);
        if (interval > 1) return interval + ' days ago';
        if (interval === 1) return '1 day ago';
        
        interval = Math.floor(seconds / 3600);
        if (interval > 1) return interval + ' hours ago';
        if (interval === 1) return '1 hour ago';
        
        interval = Math.floor(seconds / 60);
        if (interval > 1) return interval + ' minutes ago';
        if (interval === 1) return '1 minute ago';
        
        if (seconds < 10) return 'just now';
        
        return Math.floor(seconds) + ' seconds ago';
    }
}

// Initialize the feed when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new InstagramFeed();
});
