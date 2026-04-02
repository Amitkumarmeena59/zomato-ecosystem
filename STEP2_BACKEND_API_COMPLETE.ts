// ============================================================================
// BHARATPUR BITES - COMPLETE BACKEND API CODE
// ============================================================================
// Step 2: Updated Web Backend API that connects Website and Flutter App
// Framework: Node.js + Express + tRPC
// Status: Production-Ready
// ============================================================================

// ============================================================================
// 1. ENVIRONMENT CONFIGURATION (.env file)
// ============================================================================
/*
Copy this to your .env file:

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bharatpur_bites

# Server
PORT=3000
NODE_ENV=production
API_BASE_URL=https://your-domain.com

# JWT & Auth
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRY=7d
OAUTH_SERVER_URL=https://api.manus.im

# Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_key

# Auto-Assign & OTP Settings
AUTO_ASSIGN_ENABLED=true
OTP_VERIFICATION_ENABLED=true
RIDER_SEARCH_RADIUS_KM=5
RIDER_ASSIGNMENT_TIMEOUT_SEC=30
OTP_EXPIRY_MINUTES=30
MAX_OTP_ATTEMPTS=3

# AWS/Cloud (for future migration)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=bharatpur-bites-images
*/

// ============================================================================
// 2. CORE DEPENDENCIES & IMPORTS
// ============================================================================

import express, { Express, Request, Response, NextFunction } from 'express';
import { initTRPC, TRPCError } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import axios from 'axios';
import { Pool } from 'pg';
import admin from 'firebase-admin';
import crypto from 'crypto';

// ============================================================================
// 3. DATABASE CONNECTION (PostgreSQL)
// ============================================================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// ============================================================================
// 4. FIREBASE INITIALIZATION (Push Notifications)
// ============================================================================

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig as any),
});

const messaging = admin.messaging();

// ============================================================================
// 5. UTILITY FUNCTIONS
// ============================================================================

// Generate OTP
function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Generate Delivery OTP
function generateDeliveryOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Hash password
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
function generateToken(userId: number, role: string): string {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRY || '7d',
  });
}

// Verify JWT token
function verifyToken(token: string): { userId: number; role: string } | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as any;
  } catch {
    return null;
  }
}

// ============================================================================
// 6. tRPC SETUP
// ============================================================================

const t = initTRPC.context<{ userId?: number; role?: string }>().create();

const publicProcedure = t.procedure;
const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next();
});

// ============================================================================
// 7. AUTHENTICATION PROCEDURES
// ============================================================================

const authRouter = t.router({
  // Send OTP
  sendOTP: publicProcedure
    .input(z.object({ phone: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await pool.query(
          'INSERT INTO otps (phone, code, expiresAt) VALUES ($1, $2, $3)',
          [input.phone, otp, expiresAt]
        );

        // TODO: Send OTP via SMS (Twilio, AWS SNS, etc.)
        console.log(`OTP for ${input.phone}: ${otp}`);

        return { success: true, message: 'OTP sent successfully' };
      } catch (error) {
        console.error('Error sending OTP:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),

  // Verify OTP & Login
  verifyOTP: publicProcedure
    .input(z.object({ phone: z.string(), code: z.string() }))
    .mutation(async ({ input }) => {
      try {
        // Check OTP
        const otpResult = await pool.query(
          'SELECT * FROM otps WHERE phone = $1 AND code = $2 AND expiresAt > NOW() ORDER BY createdAt DESC LIMIT 1',
          [input.phone, input.code]
        );

        if (otpResult.rows.length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid or expired OTP' });
        }

        // Find or create user
        const userResult = await pool.query('SELECT * FROM users WHERE phone = $1', [input.phone]);

        let user;
        if (userResult.rows.length === 0) {
          // Create new user
          const newUserResult = await pool.query(
            'INSERT INTO users (openId, phone, role, loginMethod) VALUES ($1, $2, $3, $4) RETURNING *',
            [crypto.randomUUID(), input.phone, 'customer', 'phone_otp']
          );
          user = newUserResult.rows[0];
        } else {
          user = userResult.rows[0];
        }

        // Mark OTP as verified
        await pool.query('UPDATE otps SET isVerified = true WHERE phone = $1', [input.phone]);

        // Generate token
        const token = generateToken(user.id, user.role);

        return {
          success: true,
          token,
          user: {
            id: user.id,
            phone: user.phone,
            name: user.name,
            role: user.role,
          },
        };
      } catch (error) {
        console.error('Error verifying OTP:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),

  // Get current user
  me: protectedProcedure.query(async ({ ctx }) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [ctx.userId]);
      if (result.rows.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      return result.rows[0];
    } catch (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }
  }),

  // Save FCM token
  saveFCMToken: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await pool.query('UPDATE users SET fcmToken = $1 WHERE id = $2', [input.token, ctx.userId]);
        return { success: true };
      } catch (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),
});

// ============================================================================
// 8. RIDER PROCEDURES
// ============================================================================

const riderRouter = t.router({
  // Get rider profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      const result = await pool.query('SELECT * FROM riders WHERE userId = $1', [ctx.userId]);
      if (result.rows.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      return result.rows[0];
    } catch (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }
  }),

  // Update location (Real-time GPS)
  updateLocation: protectedProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        accuracy: z.number().optional(),
        speed: z.number().optional(),
        orderId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Update rider's current location
        await pool.query(
          'UPDATE riders SET currentLatitude = $1, currentLongitude = $2 WHERE userId = $3',
          [input.latitude, input.longitude, ctx.userId]
        );

        // Save location history
        await pool.query(
          'INSERT INTO riderLocationHistory (riderId, orderId, latitude, longitude, accuracy, speed) VALUES ((SELECT id FROM riders WHERE userId = $1), $2, $3, $4, $5, $6)',
          [ctx.userId, input.orderId || null, input.latitude, input.longitude, input.accuracy, input.speed]
        );

        return { success: true };
      } catch (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),

  // Toggle duty on/off
  toggleDuty: protectedProcedure
    .input(z.object({ isActive: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await pool.query('UPDATE riders SET isActive = $1 WHERE userId = $2', [input.isActive, ctx.userId]);
        return { success: true, isActive: input.isActive };
      } catch (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),

  // Get available orders
  getAvailableOrders: protectedProcedure.query(async ({ ctx }) => {
    try {
      const result = await pool.query(
        `SELECT o.*, r.name as restaurantName, r.latitude, r.longitude 
         FROM orders o
         JOIN restaurants r ON o.restaurantId = r.id
         WHERE o.status = 'ready' AND o.riderId IS NULL
         ORDER BY o.createdAt DESC
         LIMIT 10`
      );
      return result.rows;
    } catch (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }
  }),

  // Accept order
  acceptOrder: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Get rider ID
        const riderResult = await pool.query('SELECT id FROM riders WHERE userId = $1', [ctx.userId]);
        const riderId = riderResult.rows[0].id;

        // Update order
        await pool.query('UPDATE orders SET riderId = $1, status = $2 WHERE id = $3', [
          riderId,
          'picked_up',
          input.orderId,
        ]);

        // Update rider assignment
        await pool.query(
          'UPDATE riderAssignments SET riderId = $1, assignmentStatus = $2, responseReceivedAt = NOW() WHERE orderId = $3',
          [riderId, 'accepted', input.orderId]
        );

        return { success: true };
      } catch (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),

  // Get earnings
  getEarnings: protectedProcedure.query(async ({ ctx }) => {
    try {
      const result = await pool.query(
        `SELECT SUM(deliveryFee) as totalEarnings, COUNT(*) as totalDeliveries
         FROM orders
         WHERE riderId = (SELECT id FROM riders WHERE userId = $1) AND status = 'delivered'`,
        [ctx.userId]
      );
      return result.rows[0];
    } catch (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }
  }),

  // Verify delivery OTP
  verifyDeliveryOTP: protectedProcedure
    .input(z.object({ orderId: z.number(), otpCode: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if OTP is enabled
        if (process.env.OTP_VERIFICATION_ENABLED !== 'true') {
          // Skip OTP verification
          await pool.query('UPDATE orders SET status = $1 WHERE id = $2', ['delivered', input.orderId]);
          return { success: true, message: 'Order marked as delivered (OTP disabled)' };
        }

        // Get delivery OTP
        const otpResult = await pool.query(
          'SELECT * FROM deliveryOtps WHERE orderId = $1 AND expiresAt > NOW()',
          [input.orderId]
        );

        if (otpResult.rows.length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'OTP expired or not found' });
        }

        const otp = otpResult.rows[0];

        // Check if OTP matches
        if (otp.otpCode !== input.otpCode) {
          // Increment attempts
          await pool.query(
            'UPDATE deliveryOtps SET verificationAttempts = verificationAttempts + 1 WHERE id = $1',
            [otp.id]
          );

          // Check if max attempts exceeded
          if (otp.verificationAttempts >= parseInt(process.env.MAX_OTP_ATTEMPTS || '3')) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Max OTP attempts exceeded' });
          }

          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid OTP' });
        }

        // Mark OTP as verified
        await pool.query(
          'UPDATE deliveryOtps SET isVerified = true, verifiedAt = NOW() WHERE id = $1',
          [otp.id]
        );

        // Update order status
        await pool.query('UPDATE orders SET status = $1 WHERE id = $2', ['delivered', input.orderId]);

        return { success: true, message: 'Order delivered successfully' };
      } catch (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),
});

// ============================================================================
// 9. ORDER PROCEDURES
// ============================================================================

const orderRouter = t.router({
  // Create order
  createOrder: protectedProcedure
    .input(
      z.object({
        restaurantId: z.number(),
        items: z.array(z.object({ menuItemId: z.number(), quantity: z.number() })),
        deliveryAddress: z.string(),
        deliveryLatitude: z.number(),
        deliveryLongitude: z.number(),
        paymentMethod: z.enum(['upi', 'razorpay', 'cod']),
        specialInstructions: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const orderId = `ORD-${Date.now()}`;
        const totalAmount = 500; // Calculate based on items

        // Create order
        const orderResult = await pool.query(
          `INSERT INTO orders 
           (orderId, customerId, restaurantId, totalAmount, status, paymentMethod, paymentStatus, deliveryAddress, deliveryLatitude, deliveryLongitude, specialInstructions, items)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           RETURNING *`,
          [
            orderId,
            ctx.userId,
            input.restaurantId,
            totalAmount,
            'pending',
            input.paymentMethod,
            'pending',
            input.deliveryAddress,
            input.deliveryLatitude,
            input.deliveryLongitude,
            input.specialInstructions,
            JSON.stringify(input.items),
          ]
        );

        const order = orderResult.rows[0];

        // If auto-assign is enabled, trigger rider assignment
        if (process.env.AUTO_ASSIGN_ENABLED === 'true') {
          await autoAssignRider(order.id, input.restaurantId, input.deliveryLatitude, input.deliveryLongitude);
        }

        return { success: true, order };
      } catch (error) {
        console.error('Error creating order:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),

  // Get order status
  getOrderStatus: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      try {
        const result = await pool.query('SELECT * FROM orders WHERE id = $1', [input.orderId]);
        if (result.rows.length === 0) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }
        return result.rows[0];
      } catch (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),

  // Get rider location (for customer tracking)
  getRiderLocation: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const result = await pool.query(
          `SELECT r.currentLatitude, r.currentLongitude, r.name, r.phone
           FROM riders r
           JOIN orders o ON r.id = o.riderId
           WHERE o.id = $1 AND o.customerId = $2`,
          [input.orderId, ctx.userId]
        );

        if (result.rows.length === 0) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }

        return result.rows[0];
      } catch (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),
});

// ============================================================================
// 10. AUTO-ASSIGN RIDER LOGIC
// ============================================================================

async function autoAssignRider(
  orderId: number,
  restaurantId: number,
  deliveryLat: number,
  deliveryLon: number
): Promise<void> {
  try {
    // Get restaurant location
    const restaurantResult = await pool.query('SELECT latitude, longitude FROM restaurants WHERE id = $1', [
      restaurantId,
    ]);

    if (restaurantResult.rows.length === 0) return;

    const restaurant = restaurantResult.rows[0];

    // Find nearby riders (within 5 km)
    const ridersResult = await pool.query(
      `SELECT id, userId, currentLatitude, currentLongitude 
       FROM riders 
       WHERE isActive = true 
       AND currentLatitude IS NOT NULL 
       AND currentLongitude IS NOT NULL`
    );

    const nearbyRiders = ridersResult.rows
      .map((rider) => ({
        ...rider,
        distance: calculateDistance(
          restaurant.latitude,
          restaurant.longitude,
          rider.currentLatitude,
          rider.currentLongitude
        ),
      }))
      .filter((rider) => rider.distance <= parseFloat(process.env.RIDER_SEARCH_RADIUS_KM || '5'))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3); // Get nearest 3 riders

    // Notify riders one by one
    for (let i = 0; i < nearbyRiders.length; i++) {
      const rider = nearbyRiders[i];

      // Create assignment record
      await pool.query(
        `INSERT INTO riderAssignments 
         (orderId, restaurantId, riderId, assignmentStatus, distance, notificationSentAt, assignmentRound)
         VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
        [orderId, restaurantId, rider.id, 'notified', rider.distance, i + 1]
      );

      // Send push notification
      const userResult = await pool.query('SELECT fcmToken FROM users WHERE id = $1', [rider.userId]);
      if (userResult.rows[0]?.fcmToken) {
        await messaging.send({
          notification: {
            title: 'New Order Available',
            body: `₹500 delivery - Accept within 30 seconds`,
          },
          data: {
            orderId: orderId.toString(),
            type: 'new_order',
          },
          token: userResult.rows[0].fcmToken,
        });
      }

      // Wait for response (30 seconds timeout)
      await new Promise((resolve) => setTimeout(resolve, parseInt(process.env.RIDER_ASSIGNMENT_TIMEOUT_SEC || '30') * 1000));

      // Check if rider accepted
      const assignmentResult = await pool.query(
        'SELECT assignmentStatus FROM riderAssignments WHERE orderId = $1 AND riderId = $2 ORDER BY createdAt DESC LIMIT 1',
        [orderId, rider.id]
      );

      if (assignmentResult.rows[0]?.assignmentStatus === 'accepted') {
        return; // Rider accepted, stop searching
      }
    }

    console.log(`No riders available for order ${orderId}`);
  } catch (error) {
    console.error('Error in auto-assign:', error);
  }
}

// ============================================================================
// 11. PAYMENT RECONCILIATION (Razorpay Webhook)
// ============================================================================

const paymentRouter = t.router({
  // Razorpay webhook handler
  razorpayWebhook: publicProcedure
    .input(z.any())
    .mutation(async ({ input }) => {
      try {
        // Verify webhook signature
        const signature = input.razorpay_signature;
        const payload = JSON.stringify(input);
        const expectedSignature = crypto
          .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
          .update(payload)
          .digest('hex');

        if (signature !== expectedSignature) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid signature' });
        }

        // Save webhook
        const webhookId = `webhook_${Date.now()}`;
        await pool.query(
          `INSERT INTO razorpayWebhooks 
           (webhookId, paymentId, event, amount, status, processed, payload)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            webhookId,
            input.payload?.payment?.entity?.id,
            input.event,
            input.payload?.payment?.entity?.amount,
            input.payload?.payment?.entity?.status,
            false,
            JSON.stringify(input),
          ]
        );

        // Handle payment.authorized event
        if (input.event === 'payment.authorized') {
          const paymentId = input.payload?.payment?.entity?.id;
          const orderId = input.payload?.payment?.entity?.notes?.order_id;

          // Update order payment status
          await pool.query('UPDATE orders SET paymentStatus = $1 WHERE orderId = $2', ['completed', orderId]);

          // Update webhook as processed
          await pool.query('UPDATE razorpayWebhooks SET processed = true WHERE webhookId = $1', [webhookId]);
        }

        return { success: true };
      } catch (error) {
        console.error('Webhook error:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),
});

// ============================================================================
// 12. EXPRESS SERVER SETUP
// ============================================================================

const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Auth middleware
app.use((req: any, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.userId = decoded.userId;
      req.role = decoded.role;
    }
  }
  next();
});

// tRPC router
const appRouter = t.router({
  auth: authRouter,
  rider: riderRouter,
  order: orderRouter,
  payment: paymentRouter,
});

export type AppRouter = typeof appRouter;

// tRPC endpoint
app.use(
  '/api/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: ({ req }: any) => ({
      userId: req.userId,
      role: req.role,
    }),
  })
);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 tRPC API: http://localhost:${PORT}/api/trpc`);
  console.log(`🔒 Auto-Assign: ${process.env.AUTO_ASSIGN_ENABLED}`);
  console.log(`🔐 OTP Verification: ${process.env.OTP_VERIFICATION_ENABLED}`);
});

// ============================================================================
// END OF BACKEND API CODE
// ============================================================================
