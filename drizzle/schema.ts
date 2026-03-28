import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  double,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role-based access for customers, restaurants, riders, and admins.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["customer", "restaurant", "rider", "admin", "user"]).default("customer").notNull(),
  profileImage: text("profileImage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Restaurants table for restaurant partners
 */
export const restaurants = mysqlTable("restaurants", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  cuisineType: varchar("cuisineType", { length: 100 }),
  address: text("address").notNull(),
  latitude: double("latitude").notNull(),
  longitude: double("longitude").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }),
  image: text("image"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("4.5"),
  isActive: boolean("isActive").default(true),
  commissionPercentage: decimal("commissionPercentage", { precision: 5, scale: 2 }).default("15"),
  bankAccount: varchar("bankAccount", { length: 255 }),
  ifscCode: varchar("ifscCode", { length: 20 }),
  totalEarnings: decimal("totalEarnings", { precision: 15, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = typeof restaurants.$inferInsert;

/**
 * Menu items table for restaurants
 */
export const menuItems = mysqlTable("menuItems", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }),
  image: text("image"),
  isVegetarian: boolean("isVegetarian").default(false),
  isAvailable: boolean("isAvailable").default(true),
  preparationTime: int("preparationTime"), // in minutes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = typeof menuItems.$inferInsert;

/**
 * Orders table for tracking all orders
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderId: varchar("orderId", { length: 50 }).notNull().unique(),
  customerId: int("customerId").notNull(),
  restaurantId: int("restaurantId").notNull(),
  riderId: int("riderId"),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).default("0"),
  deliveryFee: decimal("deliveryFee", { precision: 10, scale: 2 }).default("0"),
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).default("0"),
  status: mysqlEnum("status", [
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "picked_up",
    "on_the_way",
    "delivered",
    "cancelled",
  ]).default("pending"),
  paymentMethod: mysqlEnum("paymentMethod", ["upi", "razorpay", "cod"]).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed"]).default("pending"),
  deliveryAddress: text("deliveryAddress").notNull(),
  deliveryLatitude: double("deliveryLatitude"),
  deliveryLongitude: double("deliveryLongitude"),
  specialInstructions: text("specialInstructions"),
  estimatedDeliveryTime: timestamp("estimatedDeliveryTime"),
  actualDeliveryTime: timestamp("actualDeliveryTime"),
  items: json("items"), // Array of {itemId, quantity, price}
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Riders table for delivery partners
 */
export const riders = mysqlTable("riders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }),
  vehicleType: mysqlEnum("vehicleType", ["bike", "scooter", "car"]).default("bike"),
  vehicleNumber: varchar("vehicleNumber", { length: 50 }),
  licenseNumber: varchar("licenseNumber", { length: 50 }),
  isActive: boolean("isActive").default(false), // Duty on/off toggle
  currentLatitude: double("currentLatitude"),
  currentLongitude: double("currentLongitude"),
  totalDeliveries: int("totalDeliveries").default(0),
  totalEarnings: decimal("totalEarnings", { precision: 15, scale: 2 }).default("0"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("4.5"),
  bankAccount: varchar("bankAccount", { length: 255 }),
  ifscCode: varchar("ifscCode", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Rider = typeof riders.$inferSelect;
export type InsertRider = typeof riders.$inferInsert;

/**
 * Order tracking table for real-time GPS updates
 */
export const orderTracking = mysqlTable("orderTracking", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  riderId: int("riderId").notNull(),
  latitude: double("latitude").notNull(),
  longitude: double("longitude").notNull(),
  status: varchar("status", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderTracking = typeof orderTracking.$inferSelect;
export type InsertOrderTracking = typeof orderTracking.$inferInsert;

/**
 * Payments table for payment history
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  customerId: int("customerId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["upi", "razorpay", "cod"]).notNull(),
  transactionId: varchar("transactionId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending"),
  failureReason: text("failureReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Payouts table for restaurant and rider earnings
 */
export const payouts = mysqlTable("payouts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  userType: mysqlEnum("userType", ["restaurant", "rider"]).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending"),
  bankAccount: varchar("bankAccount", { length: 255 }).notNull(),
  ifscCode: varchar("ifscCode", { length: 20 }).notNull(),
  transactionId: varchar("transactionId", { length: 255 }),
  failureReason: text("failureReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = typeof payouts.$inferInsert;

/**
 * OTP table for authentication
 */
export const otps = mysqlTable("otps", {
  id: int("id").autoincrement().primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  isVerified: boolean("isVerified").default(false),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OTP = typeof otps.$inferSelect;
export type InsertOTP = typeof otps.$inferInsert;

/**
 * Ratings and reviews table
 */
export const ratings = mysqlTable("ratings", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  customerId: int("customerId").notNull(),
  restaurantId: int("restaurantId"),
  riderId: int("riderId"),
  rating: int("rating").notNull(), // 1-5
  review: text("review"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = typeof ratings.$inferInsert;

/**
 * Commissions table for tracking commission per order
 */
export const commissions = mysqlTable("commissions", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  restaurantId: int("restaurantId").notNull(),
  commissionPercentage: decimal("commissionPercentage", { precision: 5, scale: 2 }).notNull(),
  commissionAmount: decimal("commissionAmount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = typeof commissions.$inferInsert;
