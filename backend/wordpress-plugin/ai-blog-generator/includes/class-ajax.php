<?php
/**
 * AJAX handlers
 */

if (!defined('ABSPATH')) {
    exit;
}

class AIBG_Ajax {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('wp_ajax_aibg_fetch_posts', array($this, 'fetch_posts'));
        add_action('wp_ajax_aibg_get_posts', array($this, 'get_posts'));
        add_action('wp_ajax_aibg_get_post', array($this, 'get_post'));
        add_action('wp_ajax_aibg_publish_post', array($this, 'publish_post'));
        add_action('wp_ajax_aibg_test_connection', array($this, 'test_connection'));
    }
    
    /**
     * Verify nonce
     */
    private function verify_nonce() {
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'aibg_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed', 'ai-blog-generator')));
            exit;
        }
    }
    
    /**
     * Get backend URL
     */
    private function get_backend_url() {
        return trailingslashit(get_option('aibg_backend_url', 'http://localhost:8081'));
    }
    
    /**
     * Make API request to backend
     */
    private function make_request($endpoint, $method = 'GET', $body = null) {
        $url = $this->get_backend_url() . $endpoint;
        
        $args = array(
            'method' => $method,
            'timeout' => 120, // 2 minutes for AI generation
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
        );
        
        if ($body !== null) {
            $args['body'] = json_encode($body);
        }
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            return array(
                'success' => false,
                'error' => $response->get_error_message()
            );
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        
        return array(
            'success' => $status_code >= 200 && $status_code < 300,
            'status_code' => $status_code,
            'data' => json_decode($body, true),
            'raw_body' => $body
        );
    }
    
    /**
     * Fetch posts from Reddit and generate articles
     */
    public function fetch_posts() {
        $this->verify_nonce();
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Insufficient permissions', 'ai-blog-generator')));
            return;
        }
        
        $subreddit = sanitize_text_field($_POST['subreddit'] ?? '');
        $limit = intval($_POST['limit'] ?? 5);
        $publish = isset($_POST['publish']) && $_POST['publish'] === '1';
        
        if (empty($subreddit)) {
            wp_send_json_error(array('message' => __('Subreddit is required', 'ai-blog-generator')));
            return;
        }
        
        if ($limit < 1 || $limit > 50) {
            $limit = 5;
        }
        
        // Build query string
        $endpoint = 'api/blogs/fetch?subreddit=' . urlencode($subreddit) . 
                   '&limit=' . $limit . 
                   '&publish=' . ($publish ? 'true' : 'false');
        
        $result = $this->make_request($endpoint, 'POST');
        
        if (!$result['success']) {
            wp_send_json_error(array(
                'message' => $result['error'] ?? __('Failed to fetch posts', 'ai-blog-generator'),
                'status_code' => $result['status_code'] ?? 0
            ));
            return;
        }
        
        $post_ids = $result['data'] ?? array();
        
        // If auto-publish is enabled, publish each post
        if ($publish && !empty($post_ids)) {
            foreach ($post_ids as $post_id) {
                $this->publish_single_post($post_id);
            }
        }
        
        wp_send_json_success(array(
            'message' => sprintf(__('Successfully generated %d post(s)', 'ai-blog-generator'), count($post_ids)),
            'post_ids' => $post_ids
        ));
    }
    
    /**
     * Get all generated posts
     */
    public function get_posts() {
        $this->verify_nonce();
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Insufficient permissions', 'ai-blog-generator')));
            return;
        }
        
        $result = $this->make_request('api/blogs', 'GET');
        
        if (!$result['success']) {
            wp_send_json_error(array(
                'message' => $result['error'] ?? __('Failed to fetch posts', 'ai-blog-generator')
            ));
            return;
        }
        
        $posts = $result['data'] ?? array();
        
        // Check which posts are already published in WordPress
        foreach ($posts as &$post) {
            $post['is_published'] = $this->is_post_published($post['id']);
        }
        
        wp_send_json_success(array('posts' => $posts));
    }
    
    /**
     * Get single post by ID
     */
    public function get_post() {
        $this->verify_nonce();
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Insufficient permissions', 'ai-blog-generator')));
            return;
        }
        
        $post_id = sanitize_text_field($_POST['post_id'] ?? '');
        
        if (empty($post_id)) {
            wp_send_json_error(array('message' => __('Post ID is required', 'ai-blog-generator')));
            return;
        }
        
        $result = $this->make_request('api/blogs/' . urlencode($post_id), 'GET');
        
        if (!$result['success']) {
            wp_send_json_error(array(
                'message' => $result['error'] ?? __('Failed to fetch post', 'ai-blog-generator')
            ));
            return;
        }
        
        wp_send_json_success(array('post' => $result['data']));
    }
    
    /**
     * Publish post to WordPress
     */
    public function publish_post() {
        $this->verify_nonce();
        
        if (!current_user_can('publish_posts')) {
            wp_send_json_error(array('message' => __('Insufficient permissions', 'ai-blog-generator')));
            return;
        }
        
        $post_id = sanitize_text_field($_POST['post_id'] ?? '');
        
        if (empty($post_id)) {
            wp_send_json_error(array('message' => __('Post ID is required', 'ai-blog-generator')));
            return;
        }
        
        $this->publish_single_post($post_id);
    }
    
    /**
     * Publish a single post to WordPress
     */
    private function publish_single_post($post_id) {
        // Get post from backend
        $result = $this->make_request('api/blogs/' . urlencode($post_id), 'GET');
        
        if (!$result['success'] || empty($result['data'])) {
            return false;
        }
        
        $post_data = $result['data'];
        
        // Check if already published
        if ($this->is_post_published($post_id)) {
            return true;
        }
        
        // Create WordPress post
        $wp_post = array(
            'post_title' => sanitize_text_field($post_data['title'] ?? 'Untitled'),
            'post_content' => wp_kses_post($post_data['content'] ?? ''),
            'post_status' => 'publish',
            'post_type' => 'post',
            'post_author' => get_current_user_id(),
        );
        
        $wp_post_id = wp_insert_post($wp_post);
        
        if (is_wp_error($wp_post_id)) {
            return false;
        }
        
        // Store the backend post ID as meta
        update_post_meta($wp_post_id, '_aibg_backend_post_id', $post_id);
        
        return true;
    }
    
    /**
     * Check if post is already published in WordPress
     */
    private function is_post_published($backend_post_id) {
        $args = array(
            'post_type' => 'post',
            'meta_query' => array(
                array(
                    'key' => '_aibg_backend_post_id',
                    'value' => $backend_post_id,
                    'compare' => '='
                )
            ),
            'posts_per_page' => 1
        );
        
        $query = new WP_Query($args);
        return $query->have_posts();
    }
    
    /**
     * Test backend connection
     */
    public function test_connection() {
        $this->verify_nonce();
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Insufficient permissions', 'ai-blog-generator')));
            return;
        }
        
        $result = $this->make_request('api/blogs', 'GET');
        
        if ($result['success']) {
            wp_send_json_success(array(
                'message' => __('Connection successful! Backend is reachable.', 'ai-blog-generator')
            ));
        } else {
            wp_send_json_error(array(
                'message' => __('Connection failed: ', 'ai-blog-generator') . ($result['error'] ?? __('Unknown error', 'ai-blog-generator')),
                'status_code' => $result['status_code'] ?? 0
            ));
        }
    }
}

