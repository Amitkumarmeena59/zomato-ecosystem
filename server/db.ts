import { eq, and, desc, gte, lte, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  restaurants,
  menuItems,
  orders,
  riders,
  payments,
  payouts,
  otps,
  ratings,
  commissions,
  orderTracking,
  razorpayWebhooks,
  riderAssignments,
  deliveryOtps,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { nanoid } from "nanoid";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone", "profileImage"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// OTP Management
export async function createOTP(phone: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await db.insert(otps).values({
    phone,
    code,
    expiresAt,
  });

  return code;
}

export async function verifyOTP(phone: string, code: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(otps)
    .where(and(eq(otps.phone, phone), eq(otps.code, code)))
    .limit(1);

  if (result.length === 0) return false;

  const otp = result[0];
  if (otp.expiresAt < new Date()) return false;

  await db.update(otps).set({ isVerified: true }).where(eq(otps.id, otp.id));

  return true;
}

// Restaurant Management
export async function createRestaurant(data: {
  userId: number;
  name: string;
  description?: string;
  cuisineType?: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string;
  image?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(restaurants).values(data);
  return result;
}

export async function getRestaurantsByLocation(
  latitude: number,
  longitude: number,
  radiusKm: number = 5
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Simple distance calculation (rough approximation)
  // For production, use proper geospatial queries
  const result = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.isActive, true));

  return result.filter((r) => {
    const distance = Math.sqrt(
      Math.pow(r.latitude - latitude, 2) + Math.pow(r.longitude - longitude, 2)
    );
    return distance < radiusKm * 0.01; // Rough approximation
  });
}

export async function getRestaurantById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllRestaurants() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(restaurants);
}

export async function updateRestaurant(id: number, data: Partial<typeof restaurants.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(restaurants).set(data).where(eq(restaurants.id, id));
}

// Menu Management
export async function createMenuItem(data: typeof menuItems.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(menuItems).values(data);
  return result;
}

export async function getMenuItemsByRestaurant(restaurantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId));
}

export async function updateMenuItem(id: number, data: Partial<typeof menuItems.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(menuItems).set(data).where(eq(menuItems.id, id));
}

export async function deleteMenuItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(menuItems).where(eq(menuItems.id, id));
}

// Order Management
export async function createOrder(data: Omit<typeof orders.$inferInsert, "orderId">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const orderId = `ORD-${Date.now()}-${nanoid(6)}`;
  const result = await db.insert(orders).values({
    ...data,
    orderId,
  });

  return orderId;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderByOrderId(orderId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(orders).where(eq(orders.orderId, orderId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getOrdersByCustomer(customerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrdersByRestaurant(restaurantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(orders)
    .where(eq(orders.restaurantId, restaurantId))
    .orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(orders).set({ status: status as any }).where(eq(orders.id, id));
}

export async function updateOrder(id: number, data: Partial<typeof orders.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(orders).set(data).where(eq(orders.id, id));
}

// Rider Management
export async function createRider(data: typeof riders.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(riders).values(data);
  return result;
}

export async function getRiderById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(riders).where(eq(riders.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getRiderByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(riders).where(eq(riders.userId, userId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAvailableRiders() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(riders).where(eq(riders.isActive, true));
}

export async function updateRider(id: number, data: Partial<typeof riders.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(riders).set(data).where(eq(riders.id, id));
}

// Payment Management
export async function createPayment(data: typeof payments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(payments).values(data);
  return result;
}

export async function getPaymentByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(payments).where(eq(payments.orderId, orderId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updatePaymentStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(payments).set({ status: status as any }).where(eq(payments.id, id));
}

// Payout Management
export async function createPayout(data: typeof payouts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(payouts).values(data);
  return result;
}

export async function getPayoutsByUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(payouts)
    .where(eq(payouts.userId, userId))
    .orderBy(desc(payouts.createdAt));
}

export async function getPendingPayouts() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(payouts).where(eq(payouts.status, "pending"));
}

// Order Tracking
export async function createOrderTracking(data: typeof orderTracking.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(orderTracking).values(data);
  return result;
}

export async function getOrderTrackingByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(orderTracking)
    .where(eq(orderTracking.orderId, orderId))
    .orderBy(desc(orderTracking.createdAt));
}

// Ratings Management
export async function createRating(data: typeof ratings.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(ratings).values(data);
  return result;
}

export async function getRatingsByRestaurant(restaurantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(ratings).where(eq(ratings.restaurantId, restaurantId));
}

// Commission Management
export async function createCommission(data: typeof commissions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(commissions).values(data);
  return result;
}

export async function getCommissionsByRestaurant(restaurantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(commissions).where(eq(commissions.restaurantId, restaurantId));
}
