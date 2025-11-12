# AI Blog Generator WordPress Plugin

A WordPress plugin that connects to your Spring Boot backend to fetch Reddit posts and generate AI-powered blog articles.

## Features

- **Fetch Reddit Posts**: Fetch posts from any subreddit and generate blog articles using AI
- **View Generated Posts**: Browse all generated posts from your backend
- **Publish to WordPress**: One-click publishing of generated articles to WordPress
- **Auto-Publish Option**: Automatically publish posts when fetching
- **Connection Testing**: Test your backend connection from the settings page

## Installation

1. Copy the entire `ai-blog-generator` folder to your WordPress `wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to **AI Blog Generator > Settings** and configure your backend API URL
4. Test the connection to ensure your backend is reachable

## Configuration

### Backend API URL

In the plugin settings, enter the full URL of your Spring Boot backend:
- Local development: `http://localhost:8081`
- Production: `https://your-domain.com`

### Backend Requirements

Your Spring Boot backend must be running and accessible. The plugin expects the following endpoints:

- `GET /api/blogs` - Get all generated posts
- `POST /api/blogs/fetch?subreddit={name}&limit={n}&publish={bool}` - Fetch and generate posts
- `GET /api/blogs/{id}` - Get a specific post by ID

## Usage

### Fetching Posts

1. Go to **AI Blog Generator** in your WordPress admin menu
2. Enter a subreddit name (without r/)
3. Set the number of posts to fetch (1-50)
4. Optionally check "Auto-publish to WordPress"
5. Click "Fetch & Generate Posts"

The plugin will communicate with your backend, which will:
- Fetch posts from Reddit
- Generate blog articles using AI
- Store them in the database

### Viewing Posts

All generated posts are displayed in a table showing:
- Title
- Creation date
- Publication status
- Actions (View, Publish)

### Publishing Posts

Click the "Publish" button next to any unpublished post to create a WordPress post. The post will be published immediately with the generated title and content.

## CORS Configuration

If your WordPress site and Spring Boot backend are on different domains, you'll need to configure CORS on your backend. See the backend configuration file for CORS settings.

## Requirements

- WordPress 5.0 or higher
- PHP 7.4 or higher
- Active Spring Boot backend with the AI Blog Generator API
- Backend must be accessible from your WordPress server

## Support

For issues or questions, please check:
- Backend logs for API errors
- WordPress debug logs
- Browser console for JavaScript errors

## License

GPL v2 or later

