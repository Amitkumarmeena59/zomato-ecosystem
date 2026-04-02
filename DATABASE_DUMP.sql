-- ============================================================================
-- BHARATPUR BITES - COMPLETE DATABASE SCHEMA (PostgreSQL)
-- ============================================================================
-- Copy and execute this SQL on your production database
-- Version: 1.0.0
-- Last Updated: 2026-04-02

-- ============================================================================
-- USERS TABLE (Customers, Riders, Restaurants, Admins)
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(15) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  role ENUM('customer', 'rider', 'restaurant', 'admin') NOT NULL DEFAULT 'customer',
  profile_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- ============================================================================
-- RIDERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS riders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  vehicle_type VARCHAR(50) NOT NULL,
  vehicle_number VARCHAR(50) UNIQUE NOT NULL,
  vehicle_image_url TEXT,
  license_number VARCHAR(100) UNIQUE NOT NULL,
  license_expiry DATE,
  aadhar_number VARCHAR(100) UNIQUE,
  bank_account VARCHAR(50),
  bank_ifsc VARCHAR(20),
  bank_holder_name VARCHAR(255),
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  is_online BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT false,
  total_deliveries INT DEFAULT 0,
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  documents_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_is_online (is_online),
  INDEX idx_is_available (is_available),
  INDEX idx_location (current_latitude, current_longitude)
);

-- ============================================================================
-- RESTAURANTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  restaurant_name VARCHAR(255) NOT NULL,
  cuisine_type VARCHAR(100),
  description TEXT,
  logo_url TEXT,
  banner_image_url TEXT,
  address VARCHAR(500) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone_number VARCHAR(15),
  opening_time TIME,
  closing_time TIME,
  is_open BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_orders INT DEFAULT 0,
  delivery_fee DECIMAL(5, 2) DEFAULT 0,
  min_order_value DECIMAL(7, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_is_open (is_open),
  INDEX idx_location (latitude, longitude)
);

-- ============================================================================
-- MENU ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  restaurant_id INT NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(7, 2) NOT NULL,
  discounted_price DECIMAL(7, 2),
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_vegetarian BOOLEAN DEFAULT false,
  preparation_time INT DEFAULT 30,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_orders INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  INDEX idx_restaurant_id (restaurant_id),
  INDEX idx_is_available (is_available),
  INDEX idx_category (category)
);

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  rider_id INT,
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled') DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(7, 2) DEFAULT 0,
  tax_amount DECIMAL(7, 2) DEFAULT 0,
  discount_amount DECIMAL(7, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2) NOT NULL,
  delivery_address VARCHAR(500) NOT NULL,
  delivery_latitude DECIMAL(10, 8),
  delivery_longitude DECIMAL(11, 8),
  special_instructions TEXT,
  payment_method ENUM('cash', 'card', 'upi', 'wallet') DEFAULT 'cash',
  payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  razorpay_payment_id VARCHAR(100),
  razorpay_order_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP,
  ready_at TIMESTAMP,
  picked_up_at TIMESTAMP,
  delivered_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (rider_id) REFERENCES riders(id),
  INDEX idx_status (status),
  INDEX idx_customer_id (customer_id),
  INDEX idx_restaurant_id (restaurant_id),
  INDEX idx_rider_id (rider_id),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_payment_status (payment_status)
);

-- ============================================================================
-- ORDER ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(7, 2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
  INDEX idx_order_id (order_id)
);

-- ============================================================================
-- PAYMENT RECONCILIATION TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS razorpay_webhooks (
  id SERIAL PRIMARY KEY,
  webhook_id VARCHAR(100) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payment_id VARCHAR(100),
  order_id VARCHAR(100),
  razorpay_order_id VARCHAR(100),
  amount DECIMAL(10, 2),
  currency VARCHAR(5),
  status VARCHAR(50),
  webhook_data JSON,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_payment_id (payment_id),
  INDEX idx_order_id (order_id),
  INDEX idx_processed (processed),
  INDEX idx_event_type (event_type)
);

-- ============================================================================
-- RIDER ASSIGNMENT TABLE (Auto-Assign Logic)
-- ============================================================================

CREATE TABLE IF NOT EXISTS rider_assignments (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  assigned_rider_id INT,
  assignment_status ENUM('pending', 'notified', 'accepted', 'rejected', 'escalated') DEFAULT 'pending',
  distance_km DECIMAL(8, 2),
  estimated_time_minutes INT,
  notification_sent_at TIMESTAMP,
  response_at TIMESTAMP,
  assigned_at TIMESTAMP,
  rejection_reason VARCHAR(255),
  attempt_number INT DEFAULT 1,
  max_attempts INT DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (assigned_rider_id) REFERENCES riders(id),
  INDEX idx_order_id (order_id),
  INDEX idx_assignment_status (assignment_status),
  INDEX idx_assigned_rider_id (assigned_rider_id)
);

-- ============================================================================
-- DELIVERY OTP TABLE (Fraud Prevention)
-- ============================================================================

CREATE TABLE IF NOT EXISTS delivery_otps (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL,
  rider_id INT NOT NULL,
  customer_id INT NOT NULL,
  otp_code VARCHAR(4) NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verification_attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  verified_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (rider_id) REFERENCES riders(id),
  FOREIGN KEY (customer_id) REFERENCES users(id),
  INDEX idx_order_id (order_id),
  INDEX idx_is_verified (is_verified),
  INDEX idx_expires_at (expires_at)
);

-- ============================================================================
-- RIDER LOCATION HISTORY TABLE (Real-time Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS rider_location_history (
  id SERIAL PRIMARY KEY,
  rider_id INT NOT NULL,
  order_id INT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(6, 2),
  speed DECIMAL(6, 2),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rider_id) REFERENCES riders(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_rider_id (rider_id),
  INDEX idx_order_id (order_id),
  INDEX idx_timestamp (timestamp DESC)
);

-- ============================================================================
-- RATINGS & REVIEWS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS ratings_reviews (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL,
  customer_id INT NOT NULL,
  rider_id INT,
  restaurant_id INT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (rider_id) REFERENCES riders(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  INDEX idx_order_id (order_id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_rider_id (rider_id),
  INDEX idx_restaurant_id (restaurant_id)
);

-- ============================================================================
-- EARNINGS TABLE (Rider Payouts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS earnings (
  id SERIAL PRIMARY KEY,
  rider_id INT NOT NULL,
  order_id INT NOT NULL,
  delivery_fee DECIMAL(7, 2) NOT NULL,
  bonus DECIMAL(7, 2) DEFAULT 0,
  deduction DECIMAL(7, 2) DEFAULT 0,
  net_earning DECIMAL(7, 2) NOT NULL,
  earning_date DATE NOT NULL,
  payout_status ENUM('pending', 'processed', 'failed') DEFAULT 'pending',
  payout_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rider_id) REFERENCES riders(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  INDEX idx_rider_id (rider_id),
  INDEX idx_earning_date (earning_date),
  INDEX idx_payout_status (payout_status)
);

-- ============================================================================
-- ADMIN LOGS TABLE (Audit Trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  old_value JSON,
  new_value JSON,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id),
  INDEX idx_admin_id (admin_id),
  INDEX idx_created_at (created_at DESC)
);

-- ============================================================================
-- PROMOTIONAL CODES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS promo_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type ENUM('percentage', 'fixed') DEFAULT 'percentage',
  discount_value DECIMAL(7, 2) NOT NULL,
  max_discount_amount DECIMAL(7, 2),
  min_order_value DECIMAL(7, 2),
  max_uses INT,
  current_uses INT DEFAULT 0,
  valid_from DATE,
  valid_till DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_is_active (is_active),
  INDEX idx_valid_till (valid_till)
);

-- ============================================================================
-- CUSTOMER ADDRESSES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS customer_addresses (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL,
  address_type ENUM('home', 'work', 'other') DEFAULT 'home',
  address VARCHAR(500) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_customer_id (customer_id)
);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50),
  related_order_id INT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at DESC)
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX idx_orders_rider_status ON orders(rider_id, status);
CREATE INDEX idx_menu_items_restaurant_available ON menu_items(restaurant_id, is_available);
CREATE INDEX idx_riders_location_online ON riders(current_latitude, current_longitude, is_online);
CREATE INDEX idx_earnings_rider_date ON earnings(rider_id, earning_date DESC);

-- ============================================================================
-- INSERT SAMPLE DATA (Optional)
-- ============================================================================

-- Insert admin user
INSERT INTO users (email, phone, name, role, is_verified) 
VALUES ('admin@bharatpurbites.com', '9999999999', 'Admin', 'admin', true)
ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);

-- Insert sample restaurant
INSERT INTO restaurants (user_id, restaurant_name, cuisine_type, address, latitude, longitude, is_open, is_verified)
SELECT id, 'Taj Express', 'Indian', 'Agra, India', 27.1767, 78.0081, true, true
FROM users WHERE role = 'restaurant' LIMIT 1
ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);

-- ============================================================================
-- GRANT PERMISSIONS (For app user)
-- ============================================================================

-- CREATE USER 'app_user'@'%' IDENTIFIED BY 'strong_password_here';
-- GRANT ALL PRIVILEGES ON bharatpur_bites.* TO 'app_user'@'%';
-- FLUSH PRIVILEGES;

-- ============================================================================
-- BACKUP COMMANDS
-- ============================================================================

/*
# Backup database
mysqldump -u root -p bharatpur_bites > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
mysql -u root -p bharatpur_bites < backup_file.sql

# PostgreSQL Backup
pg_dump -U postgres bharatpur_bites > backup_$(date +%Y%m%d_%H%M%S).sql

# PostgreSQL Restore
psql -U postgres bharatpur_bites < backup_file.sql
*/

-- ============================================================================
-- END OF DATABASE SCHEMA
-- ============================================================================
