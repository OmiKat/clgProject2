# WordPress Plugin Setup Guide

This guide will help you set up the AI Blog Generator WordPress plugin to work with your Spring Boot backend.

## Quick Start

### 1. Install the WordPress Plugin

1. Copy the entire `wordpress-plugin/ai-blog-generator` folder to your WordPress installation:
   ```
   wp-content/plugins/ai-blog-generator/
   ```

2. Go to your WordPress admin panel → **Plugins**
3. Find "AI Blog Generator" and click **Activate**

### 2. Configure the Plugin

1. Go to **AI Blog Generator → Settings** in your WordPress admin
2. Enter your Spring Boot backend URL:
   - **Local development**: `http://localhost:8081`
   - **Production**: `https://your-backend-domain.com`
3. Click **Save Changes**
4. Click **Test Backend Connection** to verify the connection works

### 3. Start Using the Plugin

1. Go to **AI Blog Generator** in your WordPress admin menu
2. Enter a subreddit name (e.g., `technology`, `programming`, `science`)
3. Set how many posts you want to fetch (1-50)
4. Optionally check "Auto-publish to WordPress" to automatically publish generated posts
5. Click **Fetch & Generate Posts**

The plugin will:
- Send a request to your Spring Boot backend
- Your backend will fetch posts from Reddit
- Generate AI-powered blog articles
- Display them in the WordPress admin
- Allow you to publish them with one click

## Backend Configuration

### CORS Support

The Spring Boot backend now includes CORS configuration (`CorsConfig.java`) that allows WordPress to make cross-origin requests. This is already configured and should work out of the box.

### Backend Endpoints Used

The plugin communicates with these endpoints:

- `GET /api/blogs` - Retrieves all generated posts
- `POST /api/blogs/fetch?subreddit={name}&limit={n}&publish={bool}` - Fetches and generates posts
- `GET /api/blogs/{id}` - Retrieves a specific post by ID

All endpoints are already implemented in your `Controller.java`.

## Troubleshooting

### Connection Issues

If you get connection errors:

1. **Check if backend is running**: Make sure your Spring Boot application is running on the configured port (default: 8081)
2. **Check the URL**: Ensure the backend URL in WordPress settings matches your actual backend URL
3. **Check CORS**: If WordPress and backend are on different domains, ensure CORS is properly configured (already done in `CorsConfig.java`)
4. **Check firewall**: Ensure the backend port is accessible from your WordPress server

### WordPress Issues

1. **Plugin not showing**: Clear WordPress cache and ensure the plugin folder is in the correct location
2. **AJAX errors**: Check browser console for JavaScript errors
3. **Permission errors**: Ensure you're logged in as an administrator

### Backend Issues

1. **Check logs**: Look at your Spring Boot console for error messages
2. **Database connection**: Ensure PostgreSQL is running and accessible
3. **API keys**: Verify your OpenAI/Groq API key and Reddit credentials are correct

## Production Considerations

### Security

For production environments, consider:

1. **Restrict CORS origins**: Update `CorsConfig.java` to only allow your WordPress domain:
   ```java
   config.addAllowedOrigin("https://your-wordpress-site.com");
   ```

2. **Add authentication**: Consider adding API key authentication to your backend endpoints

3. **Use HTTPS**: Always use HTTPS in production for both WordPress and backend

### Performance

- The AI generation process can take time (30 seconds to 2 minutes per post)
- The plugin has a 5-minute timeout for fetch requests
- Consider implementing a queue system for large batches

## File Structure

```
wordpress-plugin/
└── ai-blog-generator/
    ├── ai-blog-generator.php      # Main plugin file
    ├── README.md                   # Plugin documentation
    ├── includes/
    │   ├── class-admin.php         # Admin page handler
    │   └── class-ajax.php          # AJAX handlers
    └── admin/
        ├── css/
        │   └── admin.css           # Admin styles
        └── js/
            └── admin.js            # Admin JavaScript
```

## Support

If you encounter issues:

1. Check the WordPress debug log
2. Check the Spring Boot console logs
3. Check browser console for JavaScript errors
4. Verify all endpoints are accessible

## Next Steps

- Customize the AI prompt in `AIService.java` to change how articles are generated
- Add more features like scheduled fetching, categories, tags, etc.
- Implement authentication for production use

