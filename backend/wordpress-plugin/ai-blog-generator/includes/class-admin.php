<?php
/**
 * Admin page handler
 */

if (!defined('ABSPATH')) {
    exit;
}

class AIBG_Admin {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_scripts'));
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            __('AI Blog Generator', 'ai-blog-generator'),
            __('AI Blog Generator', 'ai-blog-generator'),
            'manage_options',
            'ai-blog-generator',
            array($this, 'render_dashboard_page'),
            'dashicons-admin-post',
            30
        );
        
        add_submenu_page(
            'ai-blog-generator',
            __('Settings', 'ai-blog-generator'),
            __('Settings', 'ai-blog-generator'),
            'manage_options',
            'ai-blog-generator-settings',
            array($this, 'render_settings_page')
        );
    }
    
    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('aibg_settings', 'aibg_backend_url', array(
            'type' => 'string',
            'sanitize_callback' => 'esc_url_raw',
            'default' => 'http://localhost:8081'
        ));
    }
    
    /**
     * Enqueue admin scripts and styles
     */
    public function enqueue_scripts($hook) {
        if (strpos($hook, 'ai-blog-generator') === false) {
            return;
        }
        
        wp_enqueue_style(
            'aibg-admin-css',
            AIBG_PLUGIN_URL . 'admin/css/admin.css',
            array(),
            AIBG_VERSION
        );
        
        wp_enqueue_script(
            'aibg-admin-js',
            AIBG_PLUGIN_URL . 'admin/js/admin.js',
            array('jquery'),
            AIBG_VERSION,
            true
        );
        
        // Localize script with AJAX URL and nonce
        wp_localize_script('aibg-admin-js', 'aibgData', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('aibg_nonce'),
            'backendUrl' => get_option('aibg_backend_url', 'http://localhost:8081')
        ));
    }
    
    /**
     * Render dashboard page
     */
    public function render_dashboard_page() {
        $backend_url = get_option('aibg_backend_url', 'http://localhost:8081');
        ?>
        <div class="wrap aibg-dashboard">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <div class="aibg-container">
                <!-- Fetch Posts Section -->
                <div class="aibg-card">
                    <h2><?php _e('Fetch & Generate Posts', 'ai-blog-generator'); ?></h2>
                    <div class="aibg-form-group">
                        <label for="subreddit"><?php _e('Subreddit:', 'ai-blog-generator'); ?></label>
                        <input type="text" id="subreddit" class="regular-text" placeholder="e.g., technology, programming" value="">
                        <p class="description"><?php _e('Enter the subreddit name (without r/)', 'ai-blog-generator'); ?></p>
                    </div>
                    
                    <div class="aibg-form-group">
                        <label for="limit"><?php _e('Number of Posts:', 'ai-blog-generator'); ?></label>
                        <input type="number" id="limit" class="small-text" min="1" max="50" value="5">
                        <p class="description"><?php _e('How many posts to fetch and generate (1-50)', 'ai-blog-generator'); ?></p>
                    </div>
                    
                    <div class="aibg-form-group">
                        <label>
                            <input type="checkbox" id="publish" value="1">
                            <?php _e('Auto-publish to WordPress', 'ai-blog-generator'); ?>
                        </label>
                    </div>
                    
                    <button type="button" id="fetch-posts" class="button button-primary button-large">
                        <?php _e('Fetch & Generate Posts', 'ai-blog-generator'); ?>
                    </button>
                    
                    <div id="fetch-status" class="aibg-status" style="display: none;"></div>
                </div>
                
                <!-- Generated Posts List -->
                <div class="aibg-card">
                    <h2><?php _e('Generated Posts', 'ai-blog-generator'); ?></h2>
                    <button type="button" id="refresh-posts" class="button">
                        <?php _e('Refresh List', 'ai-blog-generator'); ?>
                    </button>
                    <div id="posts-list" class="aibg-posts-list">
                        <p class="aibg-loading"><?php _e('Loading posts...', 'ai-blog-generator'); ?></p>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
    
    /**
     * Render settings page
     */
    public function render_settings_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <form method="post" action="options.php">
                <?php
                settings_fields('aibg_settings');
                do_settings_sections('aibg_settings');
                ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="aibg_backend_url"><?php _e('Backend API URL', 'ai-blog-generator'); ?></label>
                        </th>
                        <td>
                            <input type="url" 
                                   id="aibg_backend_url" 
                                   name="aibg_backend_url" 
                                   value="<?php echo esc_attr(get_option('aibg_backend_url', 'http://localhost:8081')); ?>" 
                                   class="regular-text" 
                                   placeholder="http://localhost:8081">
                            <p class="description">
                                <?php _e('Enter the full URL of your Spring Boot backend API (e.g., http://localhost:8081 or https://your-domain.com)', 'ai-blog-generator'); ?>
                            </p>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(); ?>
            </form>
            
            <div class="aibg-test-connection">
                <h2><?php _e('Test Connection', 'ai-blog-generator'); ?></h2>
                <button type="button" id="test-connection" class="button">
                    <?php _e('Test Backend Connection', 'ai-blog-generator'); ?>
                </button>
                <div id="connection-status" class="aibg-status" style="display: none;"></div>
            </div>
        </div>
        <?php
    }
}

