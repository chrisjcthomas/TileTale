# Instagram Viewer Application

A web application for viewing Instagram content with a secure backend for API authentication.

## Project Overview

This application allows users to:
- Authenticate with Instagram using OAuth
- View their Instagram feed, including posts and stories
- See detailed information about posts and comments

## Architecture

The project consists of two main parts:

1. **Frontend**: HTML, CSS, and vanilla JavaScript
   - Responsive UI for viewing Instagram content
   - Authentication flow integration
   - Media display (images, videos, carousels)

2. **Backend**: Node.js with Express
   - Secure Instagram API authentication
   - Token management and refresh
   - API proxy to avoid CORS issues
   - Caching for improved performance

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- Instagram Developer Account and App
- Modern web browser

### Backend Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update with your Instagram API credentials
   ```
   INSTAGRAM_APP_ID=your_app_id
   INSTAGRAM_APP_SECRET=your_app_secret
   INSTAGRAM_REDIRECT_URI=http://localhost:3000/auth/instagram/callback
   ```
4. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Update the API base URL in the meta tags if needed:
   ```html
   <meta name="api-base-url" content="http://localhost:3000">
   ```
2. Serve the frontend files using a local server:
   - You can use any static file server like `http-server` or `live-server`
   - Or simply open the HTML files directly in a browser for development

## API Endpoints

### Authentication

- `GET /auth/instagram`: Redirects to Instagram authorization page
- `GET /auth/instagram/callback`: Handles OAuth callback from Instagram
- `POST /auth/refresh-token`: Refreshes an Instagram access token

### Instagram Data

- `GET /api/profile`: Get user profile information
- `GET /api/media`: Get user media (posts)
- `GET /api/media/:id`: Get media details by ID
- `GET /api/stories`: Get user stories (mock data for Basic Display API)
- `GET /api/clear-cache`: Clear user cache

## Development Notes

- The application uses mock data when the backend is not available
- Instagram Basic Display API doesn't provide access to stories, so mock data is used
- For production, you should implement proper error handling and logging

## Security Considerations

- Never expose your Instagram App Secret in frontend code
- Always use the backend for token exchange
- Implement proper CSRF protection
- Use HTTPS in production
- Set appropriate CORS headers

## License

This project is licensed under the MIT License - see the LICENSE file for details.
