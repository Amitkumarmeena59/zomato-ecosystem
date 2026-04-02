-- ============================================================================
-- BHARATPUR BITES - COMPLETE POSTGRESQL DATABASE SCHEMA
-- ============================================================================
-- Step 1: Full SQL Database Schema (ready to import)
-- Database: PostgreSQL 12+
-- Version: 1.0.0
-- Status: Production-Ready
-- ============================================================================

-- ============================================================================
-- 1. USERS TABLE (Customers, Restaurants, Riders, Admins)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  phone VARCHAR(20),
  loginMethod VARCHAR(64),
  role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'restaurant', 'rider', 'admin', 'user')),
  profileImage TEXT,
  fcmToken TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_openId ON users(openId);

-- ============================================================================
-- 2. RESTAURANTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cuisineType VARCHAR(100),
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(320),
  image TEXT,
  rating DECIMAL(3, 2) DEFAULT 4.5,
  isActive BOOLEAN DEFAULT true,
  commissionPercentage DECIMAL(5, 2) DEFAULT 15,
  bankAccount VARCHAR(255),
  ifscCode VARCHAR(20),
  totalEarnings DECIMAL(15, 2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_restaurants_userId ON restaurants(userId);
CREATE INDEX idx_restaurants_isActive ON restaurants(isActive);
CREATE INDEX idx_restaurants_location ON restaurants(latitude, longitude);

-- ============================================================================
-- 3. MENU ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS menuItems (
  id SERIAL PRIMARY KEY,
  restaurantId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  image TEXT,
  isVegetarian BOOLEAN DEFAULT false,
  isAvailable BOOLEAN DEFAULT true,
  preparationTime INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurantId) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE INDEX idx_menuItems_restaurantId ON menuItems(restaurantId);
CREATE INDEX idx_menuItems_isAvailable ON menuItems(isAvailable);
CREATE INDEX idx_menuItems_category ON menuItems(category);

-- ============================================================================
-- 4. ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  orderId VARCHAR(50) UNIQUE NOT NULL,
  customerId INT NOT NULL,
  restaurantId INT NOT NULL,
  riderId INT,
  totalAmount DECIMAL(10, 2) NOT NULL,
  taxAmount DECIMAL(10, 2) DEFAULT 0,
  deliveryFee DECIMAL(10, 2) DEFAULT 0,
  discountAmount DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered', 'cancelled')),
  paymentMethod VARCHAR(50) NOT NULL CHECK (paymentMethod IN ('upi', 'razorpay', 'cod')),
  paymentStatus VARCHAR(50) DEFAULT 'pending' CHECK (paymentStatus IN ('pending', 'completed', 'failed')),
  deliveryAddress TEXT NOT NULL,
  deliveryLatitude DECIMAL(10, 8),
  deliveryLongitude DECIMAL(11, 8),
  specialInstructions TEXT,
  estimatedDeliveryTime TIMESTAMP,
  actualDeliveryTime TIMESTAMP,
  items JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customerId) REFERENCES users(id),
  FOREIGN KEY (restaurantId) REFERENCES restaurants(id),
  FOREIGN KEY (riderId) REFERENCES riders(id)
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customerId ON orders(customerId);
CREATE INDEX idx_orders_restaurantId ON orders(restaurantId);
CREATE INDEX idx_orders_riderId ON orders(riderId);
CREATE INDEX idx_orders_createdAt ON orders(createdAt DESC);
CREATE INDEX idx_orders_paymentStatus ON orders(paymentStatus);

-- ============================================================================
-- 5. RIDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS riders (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(320),
  vehicleType VARCHAR(50) DEFAULT 'bike' CHECK (vehicleType IN ('bike', 'scooter', 'car')),
  vehicleNumber VARCHAR(50),
  licenseNumber VARCHAR(50),
  isActive BOOLEAN DEFAULT false,
  currentLatitude DECIMAL(10, 8),
  currentLongitude DECIMAL(11, 8),
  totalDeliveries INT DEFAULT 0,
  totalEarnings DECIMAL(15, 2) DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 4.5,
  bankAccount VARCHAR(255),
  ifscCode VARCHAR(20),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_riders_userId ON riders(userId);
CREATE INDEX idx_riders_isActive ON riders(isActive);
CREATE INDEX idx_riders_location ON riders(currentLatitude, currentLongitude);

-- ============================================================================
-- 6. ORDER TRACKING TABLE (Real-time GPS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS orderTracking (
  id SERIAL PRIMARY KEY,
  orderId INT NOT NULL,
  riderId INT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  status VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (riderId) REFERENCES riders(id) ON DELETE CASCADE
);

CREATE INDEX idx_orderTracking_orderId ON orderTracking(orderId);
CREATE INDEX idx_orderTracking_riderId ON orderTracking(riderId);
CREATE INDEX idx_orderTracking_createdAt ON orderTracking(createdAt DESC);

-- ============================================================================
-- 7. PAYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  orderId INT NOT NULL,
  customerId INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  paymentMethod VARCHAR(50) NOT NULL CHECK (paymentMethod IN ('upi', 'razorpay', 'cod')),
  transactionId VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  failureReason TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (customerId) REFERENCES users(id)
);

CREATE INDEX idx_payments_orderId ON payments(orderId);
CREATE INDEX idx_payments_customerId ON payments(customerId);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================================
-- 8. PAYOUTS TABLE (Restaurant & Rider Earnings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS payouts (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL,
  userType VARCHAR(50) NOT NULL CHECK (userType IN ('restaurant', 'rider')),
  amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  bankAccount VARCHAR(255) NOT NULL,
  ifscCode VARCHAR(20) NOT NULL,
  transactionId VARCHAR(255),
  failureReason TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_payouts_userId ON payouts(userId);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_userType ON payouts(userType);

-- ============================================================================
-- 9. OTPS TABLE (Authentication)
-- ============================================================================
CREATE TABLE IF NOT EXISTS otps (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(10) NOT NULL,
  isVerified BOOLEAN DEFAULT false,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otps_phone ON otps(phone);
CREATE INDEX idx_otps_expiresAt ON otps(expiresAt);

-- ============================================================================
-- 10. RATINGS TABLE (Reviews & Ratings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ratings (
  id SERIAL PRIMARY KEY,
  orderId INT NOT NULL,
  customerId INT NOT NULL,
  restaurantId INT,
  riderId INT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (customerId) REFERENCES users(id),
  FOREIGN KEY (restaurantId) REFERENCES restaurants(id),
  FOREIGN KEY (riderId) REFERENCES riders(id)
);

CREATE INDEX idx_ratings_orderId ON ratings(orderId);
CREATE INDEX idx_ratings_customerId ON ratings(customerId);
CREATE INDEX idx_ratings_restaurantId ON ratings(restaurantId);
CREATE INDEX idx_ratings_riderId ON ratings(riderId);

-- ============================================================================
-- 11. COMMISSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS commissions (
  id SERIAL PRIMARY KEY,
  orderId INT NOT NULL,
  restaurantId INT NOT NULL,
  commissionPercentage DECIMAL(5, 2) NOT NULL,
  commissionAmount DECIMAL(10, 2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurantId) REFERENCES restaurants(id)
);

CREATE INDEX idx_commissions_orderId ON commissions(orderId);
CREATE INDEX idx_commissions_restaurantId ON commissions(restaurantId);

-- ============================================================================
-- 12. RAZORPAY WEBHOOKS TABLE (Payment Reconciliation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS razorpayWebhooks (
  id SERIAL PRIMARY KEY,
  webhookId VARCHAR(255) UNIQUE NOT NULL,
  orderId VARCHAR(50),
  paymentId VARCHAR(255) NOT NULL,
  event VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2),
  status VARCHAR(50),
  processed BOOLEAN DEFAULT false,
  payload JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_razorpayWebhooks_paymentId ON razorpayWebhooks(paymentId);
CREATE INDEX idx_razorpayWebhooks_orderId ON razorpayWebhooks(orderId);
CREATE INDEX idx_razorpayWebhooks_processed ON razorpayWebhooks(processed);
CREATE INDEX idx_razorpayWebhooks_event ON razorpayWebhooks(event);

-- ============================================================================
-- 13. RIDER ASSIGNMENTS TABLE (Auto-Assign Logic)
-- ============================================================================
CREATE TABLE IF NOT EXISTS riderAssignments (
  id SERIAL PRIMARY KEY,
  orderId INT NOT NULL,
  restaurantId INT NOT NULL,
  riderId INT,
  assignmentStatus VARCHAR(50) DEFAULT 'pending' CHECK (assignmentStatus IN ('pending', 'notified', 'accepted', 'rejected', 'timeout')),
  distance DECIMAL(8, 2),
  notificationSentAt TIMESTAMP,
  responseReceivedAt TIMESTAMP,
  assignmentRound INT DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurantId) REFERENCES restaurants(id),
  FOREIGN KEY (riderId) REFERENCES riders(id)
);

CREATE INDEX idx_riderAssignments_orderId ON riderAssignments(orderId);
CREATE INDEX idx_riderAssignments_status ON riderAssignments(assignmentStatus);
CREATE INDEX idx_riderAssignments_riderId ON riderAssignments(riderId);

-- ============================================================================
-- 14. DELIVERY OTPS TABLE (Fraud Prevention)
-- ============================================================================
CREATE TABLE IF NOT EXISTS deliveryOtps (
  id SERIAL PRIMARY KEY,
  orderId INT NOT NULL,
  riderId INT NOT NULL,
  customerId INT NOT NULL,
  otpCode VARCHAR(10) NOT NULL,
  isVerified BOOLEAN DEFAULT false,
  verificationAttempts INT DEFAULT 0,
  verifiedAt TIMESTAMP,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (riderId) REFERENCES riders(id),
  FOREIGN KEY (customerId) REFERENCES users(id)
);

CREATE INDEX idx_deliveryOtps_orderId ON deliveryOtps(orderId);
CREATE INDEX idx_deliveryOtps_isVerified ON deliveryOtps(isVerified);
CREATE INDEX idx_deliveryOtps_expiresAt ON deliveryOtps(expiresAt);

-- ============================================================================
-- 15. RIDER LOCATION HISTORY TABLE (Real-time Tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS riderLocationHistory (
  id SERIAL PRIMARY KEY,
  riderId INT NOT NULL,
  orderId INT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(6, 2),
  speed DECIMAL(6, 2),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (riderId) REFERENCES riders(id) ON DELETE CASCADE,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE INDEX idx_riderLocationHistory_riderId ON riderLocationHistory(riderId);
CREATE INDEX idx_riderLocationHistory_orderId ON riderLocationHistory(orderId);
CREATE INDEX idx_riderLocationHistory_timestamp ON riderLocationHistory(timestamp DESC);

-- ============================================================================
-- INSERT SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert admin user
INSERT INTO users (openId, name, email, phone, role, loginMethod)
VALUES ('admin_001', 'Admin', 'admin@bharatpurbites.com', '9999999999', 'admin', 'oauth')
ON CONFLICT (openId) DO NOTHING;

-- Insert sample restaurant
INSERT INTO restaurants (userId, name, cuisineType, address, latitude, longitude, phone, email, isActive)
SELECT id, 'Taj Express', 'Indian', 'Agra, Uttar Pradesh', 27.1767, 78.0081, '9876543210', 'taj@example.com', true
FROM users WHERE role = 'restaurant' LIMIT 1
ON CONFLICT (userId) DO NOTHING;

-- ============================================================================
-- BACKUP & RESTORE COMMANDS
-- ============================================================================

/*
-- PostgreSQL Backup
pg_dump -U postgres -h localhost bharatpur_bites > backup_$(date +%Y%m%d_%H%M%S).sql

-- PostgreSQL Restore
psql -U postgres -h localhost bharatpur_bites < backup_file.sql

-- Backup with compression
pg_dump -U postgres -h localhost -F c bharatpur_bites > backup.dump

-- Restore from compressed backup
pg_restore -U postgres -h localhost -d bharatpur_bites backup.dump
*/

-- ============================================================================
-- END OF DATABASE SCHEMA
-- ============================================================================
