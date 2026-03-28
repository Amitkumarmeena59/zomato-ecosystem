import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// Helper to check admin role
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // OTP Authentication
  otp: router({
    generate: publicProcedure
      .input(z.object({ phone: z.string().min(10) }))
      .mutation(async ({ input }) => {
        try {
          const code = await db.createOTP(input.phone);
          // In production, send via SMS using Twilio or similar
          console.log(`OTP for ${input.phone}: ${code}`);
          return { success: true, message: "OTP sent to phone" };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate OTP" });
        }
      }),

    verify: publicProcedure
      .input(z.object({ phone: z.string(), code: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const isValid = await db.verifyOTP(input.phone, input.code);
          if (!isValid) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired OTP" });
          }
          return { success: true, message: "OTP verified" };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "OTP verification failed" });
        }
      }),
  }),

  // Restaurant Management
  restaurants: router({
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          cuisineType: z.string().optional(),
          address: z.string(),
          latitude: z.number(),
          longitude: z.number(),
          phone: z.string(),
          email: z.string().email().optional(),
          image: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "restaurant" && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        try {
          await db.createRestaurant({
            userId: ctx.user.id,
            ...input,
          });
          return { success: true };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    list: publicProcedure.query(async () => {
      try {
        return await db.getAllRestaurants();
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

    getNearby: publicProcedure
      .input(
        z.object({
          latitude: z.number(),
          longitude: z.number(),
          radiusKm: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        try {
          return await db.getRestaurantsByLocation(input.latitude, input.longitude, input.radiusKm);
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        try {
          return await db.getRestaurantById(input.id);
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          image: z.string().optional(),
          commissionPercentage: z.number().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        try {
          const { id, ...data } = input;
          const updateData: any = { ...data };
          if (data.commissionPercentage !== undefined) {
            updateData.commissionPercentage = data.commissionPercentage as any;
          }
          await db.updateRestaurant(id, updateData);
          return { success: true };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),
  }),

  // Menu Management
  menu: router({
    create: protectedProcedure
      .input(
        z.object({
          restaurantId: z.number(),
          name: z.string(),
          description: z.string().optional(),
          price: z.number(),
          category: z.string().optional(),
          image: z.string().optional(),
          isVegetarian: z.boolean().optional(),
          preparationTime: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "restaurant" && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        try {
          await db.createMenuItem({
            restaurantId: input.restaurantId,
            name: input.name,
            description: input.description,
            price: input.price as any,
            category: input.category,
            image: input.image,
            isVegetarian: input.isVegetarian,
            preparationTime: input.preparationTime,
          });
          return { success: true };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    getByRestaurant: publicProcedure
      .input(z.object({ restaurantId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await db.getMenuItemsByRestaurant(input.restaurantId);
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          price: z.number().optional(),
          isAvailable: z.boolean().optional(),
          image: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "restaurant" && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        try {
          const { id, ...data } = input;
          const updateData: any = { ...data };
          if (data.price !== undefined) {
            updateData.price = data.price as any;
          }
          await db.updateMenuItem(id, updateData);
          return { success: true };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "restaurant" && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        try {
          await db.deleteMenuItem(input.id);
          return { success: true };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),
  }),

  // Order Management
  orders: router({
    create: protectedProcedure
      .input(
        z.object({
          restaurantId: z.number(),
          deliveryAddress: z.string(),
          deliveryLatitude: z.number(),
          deliveryLongitude: z.number(),
          items: z.array(z.object({ itemId: z.number(), quantity: z.number(), price: z.number() })),
          totalAmount: z.number(),
          paymentMethod: z.enum(["upi", "razorpay", "cod"]),
          specialInstructions: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "customer") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        try {
          const orderId = await db.createOrder({
            customerId: ctx.user.id,
            restaurantId: input.restaurantId,
            deliveryAddress: input.deliveryAddress,
            deliveryLatitude: input.deliveryLatitude,
            deliveryLongitude: input.deliveryLongitude,
            items: input.items,
            totalAmount: input.totalAmount as any,
            paymentMethod: input.paymentMethod,
            specialInstructions: input.specialInstructions,
            status: "pending",
            paymentStatus: "pending",
          });
          return { success: true, orderId };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    getById: protectedProcedure
      .input(z.object({ orderId: z.string() }))
      .query(async ({ input }) => {
        try {
          return await db.getOrderByOrderId(input.orderId);
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    getMyOrders: protectedProcedure.query(async ({ ctx }) => {
      try {
        if (ctx.user.role === "customer") {
          return await db.getOrdersByCustomer(ctx.user.id);
        } else if (ctx.user.role === "restaurant") {
          // Get restaurant ID for this user
          const restaurant = await db.getRestaurantById(ctx.user.id);
          if (!restaurant) throw new TRPCError({ code: "NOT_FOUND" });
          return await db.getOrdersByRestaurant(restaurant.id);
        }
        throw new TRPCError({ code: "FORBIDDEN" });
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

    updateStatus: protectedProcedure
      .input(z.object({ orderId: z.number(), status: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "restaurant" && ctx.user.role !== "rider" && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        try {
          await db.updateOrderStatus(input.orderId, input.status);
          return { success: true };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    assignRider: adminProcedure
      .input(z.object({ orderId: z.number(), riderId: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await db.updateOrder(input.orderId, { riderId: input.riderId });
          return { success: true };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),
  }),

  // Rider Management
  riders: router({
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          phone: z.string(),
          email: z.string().email().optional(),
          vehicleType: z.enum(["bike", "scooter", "car"]),
          vehicleNumber: z.string().optional(),
          licenseNumber: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "rider" && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        try {
          await db.createRider({
            userId: ctx.user.id,
            name: input.name,
            phone: input.phone,
            email: input.email,
            vehicleType: input.vehicleType,
            vehicleNumber: input.vehicleNumber,
            licenseNumber: input.licenseNumber,
          });
          return { success: true };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    toggleDuty: protectedProcedure
      .input(z.object({ isActive: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "rider") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        try {
          const rider = await db.getRiderByUserId(ctx.user.id);
          if (!rider) throw new TRPCError({ code: "NOT_FOUND" });
          await db.updateRider(rider.id, { isActive: input.isActive });
          return { success: true };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    updateLocation: protectedProcedure
      .input(z.object({ latitude: z.number(), longitude: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "rider") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        try {
          const rider = await db.getRiderByUserId(ctx.user.id);
          if (!rider) throw new TRPCError({ code: "NOT_FOUND" });
          await db.updateRider(rider.id, {
            currentLatitude: input.latitude,
            currentLongitude: input.longitude,
          });
          return { success: true };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    getAvailable: adminProcedure.query(async () => {
      try {
        return await db.getAvailableRiders();
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  }),

  // Payment Management
  payments: router({
    create: protectedProcedure
      .input(
        z.object({
          orderId: z.number(),
          amount: z.number(),
          paymentMethod: z.enum(["upi", "razorpay", "cod"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          await db.createPayment({
            orderId: input.orderId,
            customerId: ctx.user.id,
          amount: input.amount as any,
          paymentMethod: input.paymentMethod,
          status: "pending",
          });
          return { success: true };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    getByOrder: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await db.getPaymentByOrderId(input.orderId);
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),
  }),

  // Admin Panel
  admin: router({
    // Dummy Restaurant Seeding
    seedDummyRestaurants: adminProcedure.mutation(async () => {
      try {
        const dummyRestaurants = [
          {
            userId: 1,
            name: "Taj Express",
            description: "Authentic Indian cuisine",
            cuisineType: "Indian",
            address: "123 Main St, Mumbai",
            latitude: 19.0760,
            longitude: 72.8777,
            phone: "+91-9876543210",
            email: "taj@example.com",
            image: "https://via.placeholder.com/300x200?text=Taj+Express",
          },
          {
            userId: 1,
            name: "Dragon Palace",
            description: "Chinese and Asian fusion",
            cuisineType: "Chinese",
            address: "456 Park Ave, Mumbai",
            latitude: 19.0761,
            longitude: 72.8778,
            phone: "+91-9876543211",
            email: "dragon@example.com",
            image: "https://via.placeholder.com/300x200?text=Dragon+Palace",
          },
          {
            userId: 1,
            name: "Burger Barn",
            description: "American fast food",
            cuisineType: "American",
            address: "789 Oak Rd, Mumbai",
            latitude: 19.0762,
            longitude: 72.8779,
            phone: "+91-9876543212",
            email: "burger@example.com",
            image: "https://via.placeholder.com/300x200?text=Burger+Barn",
          },
        ];

        for (const restaurant of dummyRestaurants) {
          await db.createRestaurant(restaurant);
        }

        return { success: true, count: dummyRestaurants.length };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

    // Dummy Menu Items Seeding
    seedDummyMenuItems: adminProcedure
      .input(z.object({ restaurantId: z.number() }))
      .mutation(async ({ input }) => {
        try {
          const dummyItems = [
            {
              restaurantId: input.restaurantId,
              name: "Butter Chicken",
              description: "Creamy tomato-based curry",
              price: "299" as any,
              category: "Main Course",
              isVegetarian: false,
              preparationTime: 20,
            },
            {
              restaurantId: input.restaurantId,
              name: "Paneer Tikka",
              description: "Grilled cottage cheese",
              price: "249" as any,
              category: "Appetizer",
              isVegetarian: true,
              preparationTime: 15,
            },
            {
              restaurantId: input.restaurantId,
              name: "Biryani",
              description: "Fragrant rice with meat",
              price: "349" as any,
              category: "Main Course",
              isVegetarian: false,
              preparationTime: 30,
            },
          ];

          for (const item of dummyItems) {
            await db.createMenuItem(item);
          }

          return { success: true, count: dummyItems.length };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    // Get all restaurants
    getAllRestaurants: adminProcedure.query(async () => {
      try {
        return await db.getAllRestaurants();
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

    // Update commission
    updateCommission: adminProcedure
      .input(z.object({ restaurantId: z.number(), commissionPercentage: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await db.updateRestaurant(input.restaurantId, {
            commissionPercentage: input.commissionPercentage as any,
          });
          return { success: true };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    // Get payouts
    getPendingPayouts: adminProcedure.query(async () => {
      try {
        return await db.getPendingPayouts();
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

    // Create payout
    createPayout: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          userType: z.enum(["restaurant", "rider"]),
          amount: z.number(),
          bankAccount: z.string(),
          ifscCode: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await db.createPayout({
            userId: input.userId,
            userType: input.userType,
            amount: input.amount as any,
            bankAccount: input.bankAccount,
            ifscCode: input.ifscCode,
            status: "pending",
          });
          return { success: true };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
