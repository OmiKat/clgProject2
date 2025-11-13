<?php
/**
 * Plugin Name: AI Blog Generator
 * Plugin URI: https://github.com/yourusername/ai-blog-generator
 * Description: Connect WordPress to your Spring Boot backend to fetch Reddit posts and generate AI-powered blog articles.
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://yourwebsite.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: ai-blog-generator
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('AIBG_VERSION', '1.0.0');
define('AIBG_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('AIBG_PLUGIN_URL', plugin_dir_url(__FILE__));
define('AIBG_PLUGIN_BASENAME', plugin_basename(__FILE__));

// Include required files
require_once AIBG_PLUGIN_DIR . 'includes/class-admin.php';
require_once AIBG_PLUGIN_DIR . 'includes/class-ajax.php';

/**
 * Main plugin class
 */
class AI_Blog_Generator {
    
    private static $instance = null;
    private $admin;
    private $ajax;
    
    /**
     * Get singleton instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->init_hooks();
    }
    
    /**
     * Initialize hooks
     */
    private function init_hooks() {
        // Activation and deactivation hooks
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        // Initialize admin and AJAX
        add_action('plugins_loaded', array($this, 'init'));
    }
    
    /**
     * Initialize plugin components
     */
    public function init() {
        $this->admin = new AIBG_Admin();
        $this->ajax = new AIBG_Ajax();
    }
    
    /**
     * Plugin activation
     */
    public function activate() {
        // Set default options
        if (!get_option('aibg_backend_url')) {
            update_option('aibg_backend_url', 'http://localhost:8081');
        }
    }
    
    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Clean up if needed
    }
}

// Initialize the plugin
function aibg_init() {
    return AI_Blog_Generator::get_instance();
}

// Start the plugin
aibg_init();

