<?php

// Load development environment configurations
if (file_exists(ABSPATH . 'wp-config-local.php')) include ABSPATH . 'wp-config-local.php';

// Load production environement configurations
if ( !defined('WP_ENVIRONMENT_TYPE') ) define( 'WP_ENVIRONMENT_TYPE', 'production' );

if ( !defined('DB_NAME') ) define( 'DB_NAME', 'db_name' );
if ( !defined('DB_USER') ) define( 'DB_USER', 'root' );
if ( !defined('DB_PASSWORD') ) define( 'DB_PASSWORD', 'root' );
if ( !defined('DB_HOST') ) define( 'DB_HOST', 'localhost' );


if ( isset( $_COOKIE['wp_debug'] ) && 'on' === $_COOKIE['wp_debug'] ) {
    if ( !defined('WP_CACHE') ) define( 'WP_CACHE', false );
	if ( !defined('WP_DEBUG') ) define( 'WP_DEBUG', true );
	if ( !defined('WP_DEBUG_DISPLAY') ) define( 'WP_DEBUG_DISPLAY', true );
	if ( !defined('WP_DEBUG_LOG') ) define( 'WP_DEBUG_LOG', true );
} else {
    if ( !defined('WP_CACHE') ) define( 'WP_CACHE', true );
	if ( !defined('WP_DEBUG') ) define( 'WP_DEBUG', false );
	if ( !defined('WP_DEBUG_DISPLAY') ) define( 'WP_DEBUG_DISPLAY', false );
	if ( !defined('WP_DEBUG_LOG') ) define( 'WP_DEBUG_LOG', false );
}