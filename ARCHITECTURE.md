# Zomato Ecosystem - Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (React 19)                  │
├─────────────────────────────────────────────────────────────┤
│  Customer App  │ Restaurant Dashboard │ Rider App │ Admin   │
│  (Home, Order) │ (Menu, Orders)       │ (Duty)    │ Panel   │
└────────────────────────────┬────────────────────────────────┘
                             │
                    tRPC Client Bridge
                             │
┌─────────────────────────────────────────────────────────────┐
│                  API LAYER (tRPC + Express)                  │
├─────────────────────────────────────────────────────────────┤
│  Auth Router  │ Restaurant │ Menu │ Orders │ Riders │ Admin │
│  (OTP, OAuth) │ (CRUD)     │(CRUD)│(CRUD) │(CRUD) │(Mgmt) │
└────────────────────────────┬────────────────────────────────┘
                             │
                    Database Query Layer
                             │
┌─────────────────────────────────────────────────────────────┐
│              DATABASE LAYER (MySQL/TiDB)                     │
├─────────────────────────────────────────────────────────────┤
│ Users │ Restaurants │ MenuItems │ Orders │ Riders │ Payments│
│ Payouts │ OTPs │ Ratings │ Commissions │ OrderTracking      │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Order Creation Flow
```
Customer (React)
    ↓
[Place Order] → trpc.orders.create
    ↓
Server (Node.js)
    ↓
[Validate] → [Create Order Record] → [Generate Order ID]
    ↓
Database (MySQL)
    ↓
[Insert into orders table]
    ↓
Return Order ID to Client
    ↓
Customer sees confirmation
```

### Order Tracking Flow
```
Customer (React)
    ↓
[View Order] → trpc.orders.getById
    ↓
Server (Node.js)
    ↓
[Query orders table] → [Get order details]
    ↓
Database (MySQL)
    ↓
[SELECT from orders WHERE orderId = ?]
    ↓
Return order data to Client
    ↓
Display status, tracking, delivery info
```

### Restaurant Order Management Flow
```
Restaurant (React)
    ↓
[View Orders] → trpc.orders.getMyOrders
    ↓
Server (Node.js)
    ↓
[Get restaurant ID from auth context]
    ↓
[Query orders for restaurant]
    ↓
Database (MySQL)
    ↓
[SELECT from orders WHERE restaurantId = ?]
    ↓
Return pending/confirmed/ready orders
    ↓
Restaurant accepts/rejects/marks ready
```

## Database Schema Relationships

```
users (1) ──┬──→ (many) restaurants
            ├──→ (many) riders
            └──→ (many) orders (as customer)

restaurants (1) ──┬──→ (many) menuItems
                  ├──→ (many) orders
                  ├──→ (many) commissions
                  └──→ (many) ratings

menuItems (many) ──→ (1) restaurants

orders (1) ──┬──→ (1) restaurants
             ├──→ (1) riders
             ├──→ (1) users (customer)
             ├──→ (many) payments
             ├──→ (many) orderTracking
             ├──→ (many) ratings
             └──→ (many) commissions

riders (1) ──┬──→ (1) users
             ├──→ (many) orders
             ├──→ (many) orderTracking
             └──→ (many) ratings

payments (many) ──→ (1) orders

payouts (many) ──→ (1) users

otps (many) ──→ (1) users (phone-based)

ratings (many) ──→ (1) orders

commissions (many) ──→ (1) orders

orderTracking (many) ──→ (1) orders
```

## Authentication Flow

### OAuth Flow (Manus)
```
1. User clicks "Login with Manus"
2. Redirected to Manus OAuth portal
3. User authenticates
4. Callback to /api/oauth/callback
5. Session cookie created
6. User redirected to app
7. useAuth() hook retrieves user from trpc.auth.me
```

### OTP Flow (Future)
```
1. User enters phone number
2. trpc.otp.generate({ phone })
3. Server generates 6-digit code
4. SMS sent to phone (Twilio integration)
5. User enters code
6. trpc.otp.verify({ phone, code })
7. Server verifies and creates session
```

## Role-Based Access Control

### User Roles
```
┌─────────────────────────────────────────┐
│ Role         │ Access                    │
├─────────────────────────────────────────┤
│ customer     │ Browse, order, track      │
│ restaurant   │ Dashboard, menu, orders   │
│ rider        │ Dashboard, deliveries     │
│ admin        │ All operations            │
│ user         │ Limited access            │
└─────────────────────────────────────────┘
```

### Protected Procedures
```typescript
// Public - anyone can access
publicProcedure

// Protected - authenticated users only
protectedProcedure

// Admin only - role check
adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') throw FORBIDDEN
  return next({ ctx })
})
```

## API Endpoint Structure

### tRPC Router Organization
```
appRouter
├── system (system notifications)
├── auth (authentication)
│   ├── me (get current user)
│   └── logout (logout)
├── otp (OTP authentication)
│   ├── generate
│   └── verify
├── restaurants (restaurant management)
│   ├── create
│   ├── list
│   ├── getNearby
│   ├── getById
│   └── update
├── menu (menu management)
│   ├── create
│   ├── getByRestaurant
│   ├── update
│   └── delete
├── orders (order management)
│   ├── create
│   ├── getById
│   ├── getMyOrders
│   ├── updateStatus
│   └── assignRider
├── riders (rider management)
│   ├── create
│   ├── toggleDuty
│   ├── updateLocation
│   └── getAvailable
├── payments (payment management)
│   ├── create
│   └── getByOrder
└── admin (admin operations)
    ├── seedDummyRestaurants
    ├── seedDummyMenuItems
    ├── getAllRestaurants
    ├── updateCommission
    ├── getPendingPayouts
    └── createPayout
```

## Frontend Component Hierarchy

```
App
├── Router
│   ├── Home (Customer Discovery)
│   │   ├── Header (Search, Filters)
│   │   └── RestaurantGrid
│   ├── RestaurantDetail
│   │   ├── MenuList
│   │   └── CartSidebar
│   ├── OrderTracking
│   │   ├── StatusTimeline
│   │   ├── OrderDetails
│   │   └── WhatsAppSupport
│   ├── RestaurantDashboard
│   │   ├── StatsCards
│   │   ├── MenuManager
│   │   └── OrdersList
│   ├── RiderDashboard
│   │   ├── DutyToggle
│   │   ├── AvailableOrders
│   │   └── ActiveDeliveries
│   └── AdminPanel
│       ├── RestaurantTab
│       ├── PayoutsTab
│       └── SettingsTab
└── ErrorBoundary
```

## State Management

### Global State (React Context)
- `ThemeProvider`: Light/Dark theme
- `useAuth()`: Current user and auth state

### Local State (useState)
- Component-level form inputs
- UI toggles (modals, filters)
- Loading states

### Server State (tRPC)
- Restaurant data
- Order data
- User data
- All business logic

## Performance Considerations

### Database Optimization
1. **Indexing**: Create indexes on frequently queried fields
   ```sql
   CREATE INDEX idx_orders_customer ON orders(customerId);
   CREATE INDEX idx_orders_restaurant ON orders(restaurantId);
   CREATE INDEX idx_orders_status ON orders(status);
   ```

2. **Query Optimization**: Use Drizzle ORM efficiently
   ```typescript
   // Good: Single query with select
   const orders = await db.select().from(orders)
     .where(eq(orders.customerId, userId))
     .orderBy(desc(orders.createdAt))
     .limit(10)
   ```

3. **Pagination**: Implement for large datasets
   ```typescript
   const page = input.page || 1
   const limit = 20
   const offset = (page - 1) * limit
   ```

### Frontend Optimization
1. **Code Splitting**: Route-based splitting via Vite
2. **Image Optimization**: Use CDN for restaurant images
3. **Lazy Loading**: Load components on demand
4. **Caching**: tRPC query caching via React Query

### Real-time Optimization (Future)
1. **WebSocket**: For live order updates
2. **Redis**: For caching hot data
3. **Message Queue**: For async operations

## Security Architecture

### Authentication
- Manus OAuth for primary auth
- OTP for phone-based auth
- JWT for session management

### Authorization
- Role-based access control
- Procedure-level checks
- Data ownership validation

### Data Protection
- Environment variables for secrets
- SQL parameterization (Drizzle ORM)
- Input validation (Zod schemas)
- HTTPS for all communications

## Deployment Architecture

### Local Development
```
Client (Vite Dev Server) → Backend (tsx watch) → Database (Local MySQL)
```

### Production (AWS)
```
CloudFront (CDN)
    ↓
ALB (Application Load Balancer)
    ↓
Auto Scaling Group (EC2 Instances)
    ↓
RDS (MySQL Database)
    ↓
S3 (Static Assets)
```

### Environment Configuration
```
Development: NODE_ENV=development
Production: NODE_ENV=production
Database: DATABASE_URL=mysql://...
Auth: VITE_APP_ID, OAUTH_SERVER_URL
```

## Scalability Strategy

### Horizontal Scaling
- Load balancer distributes traffic
- Multiple server instances
- Stateless backend design

### Vertical Scaling
- Increase instance size
- Upgrade database tier
- Increase memory/CPU

### Database Scaling
- Read replicas for queries
- Write master for mutations
- Sharding by restaurant ID (future)

### Caching Strategy
- Redis for restaurant lists
- Redis for menu items
- Redis for order status
- CDN for static assets

## Monitoring & Logging

### Logs Location
- `.manus-logs/devserver.log`: Server startup, errors
- `.manus-logs/browserConsole.log`: Client-side errors
- `.manus-logs/networkRequests.log`: API calls
- `.manus-logs/sessionReplay.log`: User interactions

### Metrics to Monitor
- Request latency (p50, p95, p99)
- Error rate
- Database query time
- Active concurrent users
- Order throughput (orders/minute)

## Future Architecture Enhancements

1. **Microservices**: Split into separate services
   - Auth Service
   - Order Service
   - Restaurant Service
   - Rider Service
   - Payment Service

2. **Message Queue**: For async operations
   - RabbitMQ or AWS SQS
   - Order notifications
   - Payment processing
   - Payout scheduling

3. **Search Engine**: For advanced search
   - Elasticsearch
   - Restaurant search
   - Menu item search
   - Order history search

4. **Real-time**: For live features
   - WebSocket server
   - Order updates
   - Rider location
   - Chat support

5. **Analytics**: For business insights
   - Data warehouse
   - BI tools
   - Custom dashboards
   - Revenue reports

---

**Architecture Version**: 1.0
**Last Updated**: March 28, 2026
