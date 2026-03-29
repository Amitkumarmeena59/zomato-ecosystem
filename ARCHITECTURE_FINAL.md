# Bharatpur Bites - Production-Grade Architecture

**Version:** 2.0.0 (Scalable & Budget-Friendly)  
**Status:** Ready for 1 Lakh+ Users  
**Technology Stack:** Flutter + Node.js + MongoDB/PostgreSQL + Socket.io

---

## 📁 Complete Project Folder Structure

```
bharatpur-bites/
│
├── backend/                          # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # MongoDB/PostgreSQL connection
│   │   │   ├── socket.js            # Socket.io configuration
│   │   │   ├── env.js               # Environment variables
│   │   │   └── constants.js         # App constants
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT authentication
│   │   │   ├── errorHandler.js      # Global error handling
│   │   │   ├── validation.js        # Input validation with Joi
│   │   │   ├── rateLimit.js         # Rate limiting
│   │   │   └── cors.js              # CORS configuration
│   │   │
│   │   ├── models/
│   │   │   ├── User.js              # User schema
│   │   │   ├── Rider.js             # Rider schema
│   │   │   ├── Restaurant.js        # Restaurant schema
│   │   │   ├── Order.js             # Order schema
│   │   │   ├── MenuItem.js          # Menu item schema
│   │   │   ├── Delivery.js          # Delivery tracking schema
│   │   │   ├── Payment.js           # Payment schema
│   │   │   └── RiderLocation.js     # Real-time location schema
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.js              # Authentication routes
│   │   │   ├── riders.js            # Rider routes
│   │   │   ├── restaurants.js       # Restaurant routes
│   │   │   ├── orders.js            # Order routes
│   │   │   ├── customers.js         # Customer routes
│   │   │   ├── admin.js             # Admin routes
│   │   │   ├── payments.js          # Payment routes
│   │   │   └── tracking.js          # Real-time tracking routes
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── riderController.js
│   │   │   ├── restaurantController.js
│   │   │   ├── orderController.js
│   │   │   ├── customerController.js
│   │   │   ├── adminController.js
│   │   │   ├── paymentController.js
│   │   │   └── trackingController.js
│   │   │
│   │   ├── services/
│   │   │   ├── authService.js       # Auth logic
│   │   │   ├── riderService.js      # Rider business logic
│   │   │   ├── orderService.js      # Order processing
│   │   │   ├── paymentService.js    # Payment processing
│   │   │   ├── notificationService.js # Push notifications
│   │   │   ├── imageService.js      # Image compression
│   │   │   ├── geoService.js        # Geolocation services
│   │   │   └── emailService.js      # Email notifications
│   │   │
│   │   ├── utils/
│   │   │   ├── jwt.js               # JWT utilities
│   │   │   ├── hash.js              # Password hashing
│   │   │   ├── validators.js        # Validation schemas
│   │   │   ├── logger.js            # Logging utility
│   │   │   ├── errorCodes.js        # Standard error codes
│   │   │   └── helpers.js           # Helper functions
│   │   │
│   │   ├── sockets/
│   │   │   ├── riderTracking.js     # Real-time rider tracking
│   │   │   ├── orderUpdates.js      # Order status updates
│   │   │   ├── notifications.js     # Push notifications
│   │   │   └── events.js            # Socket events
│   │   │
│   │   ├── jobs/
│   │   │   ├── payoutJob.js         # Scheduled payout processing
│   │   │   ├── cleanupJob.js        # Database cleanup
│   │   │   └── reportJob.js         # Generate reports
│   │   │
│   │   ├── app.js                   # Express app setup
│   │   └── server.js                # Server entry point
│   │
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── .env.example
│   ├── .env.production
│   ├── package.json
│   ├── docker-compose.yml           # For local development
│   ├── Dockerfile                   # For production deployment
│   └── README.md
│
├── website/                          # React website (Customer + Admin)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── customer/
│   │   │   │   ├── Home.tsx
│   │   │   │   ├── RestaurantDetail.tsx
│   │   │   │   ├── OrderTracking.tsx
│   │   │   │   └── Profile.tsx
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── Dashboard.tsx
│   │   │       ├── RestaurantManagement.tsx
│   │   │       ├── RiderManagement.tsx
│   │   │       ├── OrderManagement.tsx
│   │   │       ├── Analytics.tsx
│   │   │       └── Settings.tsx
│   │   │
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.tsx
│   │
│   ├── public/
│   ├── package.json
│   └── .env.example
│
├── rider-app/                        # Flutter Rider App
│   ├── lib/
│   │   ├── main.dart
│   │   ├── config/
│   │   ├── models/
│   │   ├── services/
│   │   ├── providers/
│   │   ├── screens/
│   │   ├── widgets/
│   │   └── utils/
│   │
│   ├── android/
│   ├── ios/
│   ├── pubspec.yaml
│   └── .env.example
│
├── restaurant-app/                   # Flutter Restaurant App
│   ├── lib/
│   ├── android/
│   ├── ios/
│   ├── pubspec.yaml
│   └── .env.example
│
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── SECURITY.md
│   ├── PERFORMANCE.md
│   └── ARCHITECTURE.md
│
├── scripts/
│   ├── setup.sh                     # Initial setup
│   ├── migrate.sh                   # Database migration
│   ├── deploy.sh                    # Deployment script
│   └── backup.sh                    # Backup script
│
├── docker-compose.yml               # Local development
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🗄️ Database Schema

### Option 1: MongoDB (Recommended for flexibility)

```javascript
// Users Collection
{
  _id: ObjectId,
  phone: String,
  email: String,
  name: String,
  role: String, // 'customer', 'rider', 'restaurant', 'admin'
  passwordHash: String,
  profileImage: String,
  documentVerified: Boolean,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
}

// Riders Collection
{
  _id: ObjectId,
  userId: ObjectId,
  licenseNumber: String,
  licenseExpiry: Date,
  aadharNumber: String,
  vehicleType: String, // 'bike', 'scooter', 'car'
  vehicleNumber: String,
  isOnline: Boolean,
  currentLocation: {
    type: 'Point',
    coordinates: [longitude, latitude] // GeoJSON format
  },
  rating: Number,
  totalDeliveries: Number,
  earnings: {
    today: Number,
    week: Number,
    month: Number,
    total: Number
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolder: String
  },
  createdAt: Date,
  updatedAt: Date
}

// Restaurants Collection
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  description: String,
  logo: String,
  banner: String,
  address: String,
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  phone: String,
  email: String,
  openingTime: String,
  closingTime: String,
  isOpen: Boolean,
  cuisineType: [String],
  rating: Number,
  commissionPercentage: Number,
  isVerified: Boolean,
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolder: String
  },
  createdAt: Date,
  updatedAt: Date
}

// Orders Collection
{
  _id: ObjectId,
  orderNumber: String,
  customerId: ObjectId,
  restaurantId: ObjectId,
  riderId: ObjectId,
  items: [
    {
      menuItemId: ObjectId,
      name: String,
      quantity: Number,
      price: Number,
      specialInstructions: String
    }
  ],
  deliveryAddress: String,
  deliveryLocation: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  status: String, // 'pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'
  totalAmount: Number,
  deliveryFee: Number,
  commission: Number,
  paymentMethod: String, // 'upi', 'card', 'cash'
  paymentStatus: String, // 'pending', 'completed', 'failed'
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  rating: Number,
  review: String,
  createdAt: Date,
  updatedAt: Date
}

// Menu Items Collection
{
  _id: ObjectId,
  restaurantId: ObjectId,
  name: String,
  description: String,
  image: String,
  price: Number,
  category: String,
  isVeg: Boolean,
  isAvailable: Boolean,
  preparationTime: Number, // in minutes
  rating: Number,
  createdAt: Date,
  updatedAt: Date
}

// Deliveries Collection
{
  _id: ObjectId,
  orderId: ObjectId,
  riderId: ObjectId,
  pickupLocation: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  dropLocation: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  status: String, // 'assigned', 'picked_up', 'in_transit', 'delivered'
  riderLocations: [
    {
      coordinates: [longitude, latitude],
      timestamp: Date
    }
  ],
  distance: Number, // in km
  estimatedTime: Number, // in minutes
  actualTime: Number,
  createdAt: Date,
  updatedAt: Date
}

// Payments Collection
{
  _id: ObjectId,
  orderId: ObjectId,
  userId: ObjectId,
  amount: Number,
  method: String,
  status: String, // 'pending', 'completed', 'failed'
  transactionId: String,
  createdAt: Date,
  updatedAt: Date
}

// Payouts Collection
{
  _id: ObjectId,
  riderId: ObjectId,
  restaurantId: ObjectId,
  amount: Number,
  period: String, // 'daily', 'weekly', 'monthly'
  status: String, // 'pending', 'processed', 'failed'
  bankDetails: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### Option 2: PostgreSQL (For strict schema)

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'customer', 'rider', 'restaurant', 'admin'
  password_hash VARCHAR(255) NOT NULL,
  profile_image VARCHAR(500),
  document_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Riders table
CREATE TABLE riders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  license_number VARCHAR(50) UNIQUE NOT NULL,
  license_expiry DATE NOT NULL,
  aadhar_number VARCHAR(50) UNIQUE NOT NULL,
  vehicle_type VARCHAR(50), -- 'bike', 'scooter', 'car'
  vehicle_number VARCHAR(50),
  is_online BOOLEAN DEFAULT FALSE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(3, 2),
  total_deliveries INTEGER DEFAULT 0,
  earnings_today DECIMAL(10, 2) DEFAULT 0,
  earnings_week DECIMAL(10, 2) DEFAULT 0,
  earnings_month DECIMAL(10, 2) DEFAULT 0,
  earnings_total DECIMAL(10, 2) DEFAULT 0,
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  account_holder VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Restaurants table
CREATE TABLE restaurants (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo VARCHAR(500),
  banner VARCHAR(500),
  address VARCHAR(500),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(20),
  email VARCHAR(255),
  opening_time TIME,
  closing_time TIME,
  is_open BOOLEAN DEFAULT TRUE,
  cuisine_type VARCHAR(255), -- JSON array as string
  rating DECIMAL(3, 2),
  commission_percentage DECIMAL(5, 2),
  is_verified BOOLEAN DEFAULT FALSE,
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  account_holder VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INTEGER NOT NULL REFERENCES users(id),
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  rider_id INTEGER REFERENCES riders(id),
  status VARCHAR(50) NOT NULL, -- 'pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2),
  commission DECIMAL(10, 2),
  payment_method VARCHAR(50), -- 'upi', 'card', 'cash'
  payment_status VARCHAR(50), -- 'pending', 'completed', 'failed'
  delivery_address VARCHAR(500),
  delivery_latitude DECIMAL(10, 8),
  delivery_longitude DECIMAL(11, 8),
  estimated_delivery_time TIMESTAMP,
  actual_delivery_time TIMESTAMP,
  rating INTEGER,
  review TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (rider_id) REFERENCES riders(id)
);

-- Menu Items table
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(500),
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  is_veg BOOLEAN,
  is_available BOOLEAN DEFAULT TRUE,
  preparation_time INTEGER, -- in minutes
  rating DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Order Items table (junction table)
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deliveries table
CREATE TABLE deliveries (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  rider_id INTEGER NOT NULL REFERENCES riders(id),
  pickup_latitude DECIMAL(10, 8),
  pickup_longitude DECIMAL(11, 8),
  drop_latitude DECIMAL(10, 8),
  drop_longitude DECIMAL(11, 8),
  status VARCHAR(50), -- 'assigned', 'picked_up', 'in_transit', 'delivered'
  distance DECIMAL(10, 2), -- in km
  estimated_time INTEGER, -- in minutes
  actual_time INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (rider_id) REFERENCES riders(id)
);

-- Rider Locations table (for real-time tracking)
CREATE TABLE rider_locations (
  id SERIAL PRIMARY KEY,
  rider_id INTEGER NOT NULL REFERENCES riders(id),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  accuracy DECIMAL(10, 2),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rider_id) REFERENCES riders(id),
  INDEX idx_rider_timestamp (rider_id, timestamp)
);

-- Payments table
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  method VARCHAR(50),
  status VARCHAR(50), -- 'pending', 'completed', 'failed'
  transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Payouts table
CREATE TABLE payouts (
  id SERIAL PRIMARY KEY,
  rider_id INTEGER REFERENCES riders(id),
  restaurant_id INTEGER REFERENCES restaurants(id),
  amount DECIMAL(10, 2) NOT NULL,
  period VARCHAR(50), -- 'daily', 'weekly', 'monthly'
  status VARCHAR(50), -- 'pending', 'processed', 'failed'
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rider_id) REFERENCES riders(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Create indexes for performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_riders_user_id ON riders(user_id);
CREATE INDEX idx_restaurants_user_id ON restaurants(user_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_rider_id ON orders(rider_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_rider_id ON deliveries(rider_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
```

---

## 🔐 Security Implementation

### JWT Authentication

```javascript
// jwt.js
const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = { generateToken, verifyToken };
```

### Input Validation

```javascript
// validators.js
const Joi = require('joi');

const riderSignupSchema = Joi.object({
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().required(),
  licenseNumber: Joi.string().required(),
  aadharNumber: Joi.string().pattern(/^\d{12}$/).required(),
  vehicleType: Joi.string().valid('bike', 'scooter', 'car').required(),
  vehicleNumber: Joi.string().required()
});

const orderSchema = Joi.object({
  restaurantId: Joi.number().required(),
  items: Joi.array().items(
    Joi.object({
      menuItemId: Joi.number().required(),
      quantity: Joi.number().min(1).required()
    })
  ).required(),
  deliveryAddress: Joi.string().required(),
  deliveryLatitude: Joi.number().required(),
  deliveryLongitude: Joi.number().required()
});

module.exports = { riderSignupSchema, orderSchema };
```

### Password Hashing

```javascript
// hash.js
const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

module.exports = { hashPassword, comparePassword };
```

---

## 🚀 Real-time Socket.io Implementation

### Socket.io Configuration

```javascript
// socket.js
const socketIO = require('socket.io');

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST']
    }
  });

  // Rider tracking namespace
  io.of('/tracking').on('connection', (socket) => {
    console.log('Rider connected:', socket.id);

    // Rider sends location update
    socket.on('rider-location', (data) => {
      const { riderId, latitude, longitude } = data;
      
      // Broadcast to customers and admin
      io.of('/tracking').emit('rider-location-update', {
        riderId,
        latitude,
        longitude,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      console.log('Rider disconnected:', socket.id);
    });
  });

  // Order updates namespace
  io.of('/orders').on('connection', (socket) => {
    socket.on('order-status-change', (data) => {
      const { orderId, status } = data;
      
      // Notify customer, restaurant, and rider
      io.of('/orders').emit('order-updated', {
        orderId,
        status,
        timestamp: new Date()
      });
    });
  });

  return io;
};

module.exports = { initializeSocket };
```

---

## 📊 Performance Optimization

### Image Compression

```javascript
// imageService.js
const sharp = require('sharp');
const fs = require('fs').promises;

const compressImage = async (imagePath, quality = 80) => {
  const compressedPath = imagePath.replace('.jpg', '_compressed.jpg');
  
  await sharp(imagePath)
    .resize(800, 600, { fit: 'inside' })
    .jpeg({ quality })
    .toFile(compressedPath);
  
  return compressedPath;
};

module.exports = { compressImage };
```

### Caching Strategy

```javascript
// Use Redis for caching
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

const getFromCache = async (key) => {
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
};

const setCache = async (key, value, ttl = 3600) => {
  await client.setex(key, ttl, JSON.stringify(value));
};

module.exports = { getFromCache, setCache };
```

---

## 💰 Cost Optimization

### Budget-Friendly Hosting Options

| Provider | Cost | Best For |
|----------|------|----------|
| **DigitalOcean** | $5-20/month | Starter, small scale |
| **Hostinger** | $2-10/month | Budget VPS |
| **Firebase** | Pay-as-you-go | Serverless, auto-scaling |
| **AWS** | Variable | Large scale (1L+ users) |

### Bandwidth Optimization

```
- Image compression: Save 70% bandwidth
- CDN caching: Reduce server load
- Gzip compression: Reduce payload by 60%
- Database indexing: Faster queries
```

---

## 🔄 Scalability Path

```
Phase 1: Single VPS ($10/month)
├── 1 Node.js server
├── 1 PostgreSQL database
└── Handles 10K-50K users

Phase 2: Load Balancing ($30/month)
├── 2-3 Node.js servers
├── PostgreSQL with replication
└── Handles 50K-200K users

Phase 3: AWS Migration ($100+/month)
├── Auto-scaling groups
├── RDS for database
├── CloudFront CDN
└── Handles 1L+ users
```

---

**This architecture is production-ready and scales from 10K to 1 Lakh+ users!** 🚀
