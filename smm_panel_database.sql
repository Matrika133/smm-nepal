-- ==========================================================
-- SMM PANEL NEPAL - UNIVERSAL MYSQL DATABASE & SEED DUMP
-- 100% Guaranteed Compatible with:
--   - phpMyAdmin 4.x, 5.x, 6.x
--   - MySQL 5.5, 5.6, 5.7, 8.0, 8.4
--   - MariaDB 10.2, 10.3, 10.4, 10.5, 10.11, 11.x
--   - cPanel Shared Hosting & VPS
-- ==========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

-- --------------------------------------------------------
-- 1. Table structure for `system_settings`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `site_name` VARCHAR(191) NOT NULL DEFAULT 'SMM PANEL NEPAL',
  `site_tagline` VARCHAR(191) DEFAULT '#1 Direct SMM Reseller Platform in Nepal',
  `domain_url` VARCHAR(191) DEFAULT 'https://smmpanelnepal.com',
  `currency` VARCHAR(10) DEFAULT 'NPR',
  `admin_route` VARCHAR(64) DEFAULT 'admin',
  `support_phone` VARCHAR(32) DEFAULT '+977-9800000000',
  `support_email` VARCHAR(191) DEFAULT 'smmpanelnepal@gmail.com',
  `installed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `config_json` LONGTEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 2. Table structure for `users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `username` VARCHAR(64) NOT NULL UNIQUE,
  `full_name` VARCHAR(191) DEFAULT '',
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(32) NOT NULL DEFAULT 'user',
  `tier` VARCHAR(32) NOT NULL DEFAULT 'Standard',
  `balance` DECIMAL(14, 4) NOT NULL DEFAULT 0.0000,
  `total_spent` DECIMAL(14, 4) NOT NULL DEFAULT 0.0000,
  `total_orders` INT NOT NULL DEFAULT 0,
  `phone` VARCHAR(32) DEFAULT NULL,
  `api_key` VARCHAR(128) DEFAULT NULL,
  `secret_pin` VARCHAR(32) DEFAULT '7788',
  `status` VARCHAR(32) DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_email` (`email`),
  INDEX `idx_user_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 3. Table structure for `services`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `services` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `rate_per_1k` DECIMAL(12, 4) NOT NULL,
  `min_quantity` INT NOT NULL DEFAULT 10,
  `max_quantity` INT NOT NULL DEFAULT 100000,
  `description` TEXT DEFAULT NULL,
  `speed` VARCHAR(100) DEFAULT 'Instant (0-10m)',
  `guarantee` VARCHAR(100) DEFAULT '30 Days Refill',
  `is_popular` TINYINT(1) DEFAULT 0,
  `status` VARCHAR(32) DEFAULT 'active',
  `wholesaler_id` VARCHAR(64) DEFAULT NULL,
  `wholesaler_service_id` VARCHAR(64) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_service_cat` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 4. Table structure for `orders`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `order_number` BIGINT NOT NULL DEFAULT 10001,
  `user_id` VARCHAR(64) NOT NULL,
  `service_id` VARCHAR(64) NOT NULL,
  `service_name` VARCHAR(191) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `link` TEXT NOT NULL,
  `quantity` INT NOT NULL,
  `charge` DECIMAL(12, 4) NOT NULL,
  `start_count` INT DEFAULT 0,
  `remains` INT DEFAULT 0,
  `status` VARCHAR(32) NOT NULL DEFAULT 'Pending',
  `wholesaler_id` VARCHAR(64) DEFAULT NULL,
  `wholesaler_order_id` VARCHAR(64) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_order_user` (`user_id`),
  INDEX `idx_order_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 5. Table structure for `transactions`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `user_username` VARCHAR(64) NOT NULL,
  `type` VARCHAR(32) NOT NULL,
  `method` VARCHAR(64) NOT NULL,
  `amount` DECIMAL(12, 4) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'NPR',
  `fee` DECIMAL(10, 2) DEFAULT 0.00,
  `status` VARCHAR(32) NOT NULL DEFAULT 'Pending',
  `transaction_ref` VARCHAR(128) DEFAULT NULL,
  `sender_name` VARCHAR(191) DEFAULT NULL,
  `sender_phone` VARCHAR(32) DEFAULT NULL,
  `screenshot_url` LONGTEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `admin_note` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_tx_user` (`user_id`),
  INDEX `idx_tx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 6. Table structure for `support_tickets`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `support_tickets` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `ticket_number` BIGINT NOT NULL DEFAULT 1001,
  `user_id` VARCHAR(64) NOT NULL,
  `subject` VARCHAR(191) NOT NULL,
  `category` VARCHAR(64) NOT NULL,
  `order_id` VARCHAR(64) DEFAULT NULL,
  `priority` VARCHAR(32) DEFAULT 'Medium',
  `status` VARCHAR(32) DEFAULT 'Open',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ticket_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 7. Table structure for `ticket_messages`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ticket_messages` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `ticket_id` VARCHAR(64) NOT NULL,
  `sender_role` VARCHAR(32) NOT NULL,
  `sender_name` VARCHAR(191) NOT NULL,
  `message` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_msg_ticket` (`ticket_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 8. Table structure for `child_panels`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `child_panels` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `domain` VARCHAR(191) NOT NULL UNIQUE,
  `currency` VARCHAR(10) DEFAULT 'NPR',
  `monthly_price` DECIMAL(10, 2) DEFAULT 999.00,
  `status` VARCHAR(32) DEFAULT 'Pending DNS',
  `admin_user` VARCHAR(64) NOT NULL,
  `profit_margin_percent` INT DEFAULT 20,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME DEFAULT NULL,
  INDEX `idx_cp_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 9. Seed Data: Default System Settings
-- --------------------------------------------------------
INSERT IGNORE INTO `system_settings` (`id`, `site_name`, `site_tagline`, `domain_url`, `currency`, `admin_route`, `support_phone`, `support_email`)
VALUES (1, 'SMM PANEL NEPAL', '#1 Direct SMM Reseller Platform in Nepal', 'https://smmpanelnepal.com', 'NPR', 'admin', '+977-9800000000', 'smmpanelnepal@gmail.com');

-- --------------------------------------------------------
-- 10. Seed Data: SuperAdmin Root Account
-- --------------------------------------------------------
INSERT IGNORE INTO `users` (`id`, `username`, `full_name`, `email`, `password`, `role`, `tier`, `balance`, `api_key`, `secret_pin`, `status`)
VALUES ('usr_superadmin_01', 'smmpanelnepal', 'SMM SuperAdmin Nepal', 'smmpanelnepal@gmail.com', 'admin123', 'superadmin', 'VIP', 10000.0000, 'smm_live_nepal_root_key_8899', '7788', 'active');

-- --------------------------------------------------------
-- 11. Seed Data: Core SMM Services in Nepal
-- --------------------------------------------------------
INSERT IGNORE INTO `services` (`id`, `name`, `category`, `rate_per_1k`, `min_quantity`, `max_quantity`, `description`, `speed`, `guarantee`, `is_popular`, `status`) VALUES
('srv_tiktok_01', 'TikTok Video Likes [Instant High Quality]', 'TikTok', 120.0000, 50, 50000, 'Fast high quality TikTok video likes without password.', 'Instant (0-5 min)', 'Lifetime Guaranteed', 1, 'active'),
('srv_tiktok_02', 'TikTok Followers [Nepal & Global HQ]', 'TikTok', 450.0000, 100, 20000, 'Real looking profile followers. Fast delivery, 30 days refill guarantee.', '500-2k/Day', '30 Days Refill', 1, 'active'),
('srv_tiktok_03', 'TikTok Views [Fast Instant Server]', 'TikTok', 15.0000, 100, 500000, 'Ultra-fast TikTok video views. Supports all recent uploads.', 'Instant (0-1 min)', 'Non-Drop', 1, 'active'),
('srv_insta_01', 'Instagram Real Followers [Non-Drop Quality]', 'Instagram', 280.0000, 50, 25000, 'Premium organic looking Instagram followers with posts.', '1k-5k/Day', '30 Days Refill', 1, 'active'),
('srv_insta_02', 'Instagram Likes [High Speed & Organic]', 'Instagram', 85.0000, 50, 50000, 'High speed post & reel likes from active accounts.', 'Instant (0-2 min)', 'Lifetime Refill', 1, 'active'),
('srv_youtube_01', 'YouTube High Retention Views [Monetizable]', 'YouTube', 350.0000, 500, 100000, 'Safe for Google AdSense monetization. High watch duration.', '1k-3k/Day', 'Lifetime Guaranteed', 1, 'active'),
('srv_youtube_02', 'YouTube Subscribers [Stable Non-Drop]', 'YouTube', 1450.0000, 50, 5000, 'Stable channel subscribers for partner program requirement.', '50-100/Day Safe', '60 Days Refill', 1, 'active'),
('srv_fb_01', 'Facebook Page Likes + Followers [Nepal Target]', 'Facebook', 320.0000, 100, 15000, 'Grow your local business Facebook page reputation.', '200-500/Day', '30 Days Refill', 1, 'active'),
('srv_tg_01', 'Telegram Channel / Group Members [0% Drop]', 'Telegram', 210.0000, 50, 20000, 'Non-drop active members for your channel or group.', 'Instant Dispatch', '90 Days Refill', 1, 'active');

SET FOREIGN_KEY_CHECKS = 1;
