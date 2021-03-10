<?php
define('TEMPLATE_DIR', get_template_directory_uri());
define('TEMPLATE_DIR_PATH', get_template_directory());
define('ASSETS', TEMPLATE_DIR . '/assets/');
define('PARTIALS', TEMPLATE_DIR_PATH . '/partials/');

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('style', get_stylesheet_uri(), false, filemtime(TEMPLATE_DIR_PATH . '/style.css'), 'all'); // links to default style.css
    wp_enqueue_script('main', ASSETS . 'js/main.js', ['jquery'], filemtime(TEMPLATE_DIR_PATH . '/assets/js/main.js'), true);
});