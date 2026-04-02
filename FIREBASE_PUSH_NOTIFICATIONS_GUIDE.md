# Firebase Push Notifications - Complete Setup & Verification Guide

**Version:** 1.0.0  
**Status:** ✅ Production-Ready  
**Last Updated:** 2026-04-02

---

## 🔔 Firebase Cloud Messaging (FCM) Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name: "Bharatpur Bites"
4. Enable Google Analytics (optional)
5. Create project

### Step 2: Add Android App

1. In Firebase Console, click "Add App"
2. Select "Android"
3. Enter package name: `com.bharatpurbites.rider`
4. Download `google-services.json`
5. Place in `android/app/` directory

### Step 3: Add iOS App (Optional)

1. Click "Add App" > "iOS"
2. Enter bundle ID: `com.bharatpurbites.rider`
3. Download `GoogleService-Info.plist`
4. Add to Xcode project

---

## 📱 Android Configuration

### Step 1: Update build.gradle

**android/build.gradle:**

```gradle
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

**android/app/build.gradle:**

```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation 'com.google.firebase:firebase-messaging:23.2.1'
    implementation 'com.google.firebase:firebase-core:21.1.1'
}
```

### Step 2: Update AndroidManifest.xml

**android/app/src/main/AndroidManifest.xml:**

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    
    <application>
        <!-- Firebase Messaging Service -->
        <service
            android:name=".services.MyFirebaseMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>
        
        <!-- Default notification channel -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_channel_id"
            android:value="bharatpur_bites" />
    </application>
</manifest>
```

### Step 3: Create Notification Channel

**android/app/src/main/java/com/bharatpurbites/rider/MainActivity.java:**

```java
package com.bharatpurbites.rider;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import io.flutter.embedding.android.FlutterActivity;

public class MainActivity extends FlutterActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Create notification channel
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                "bharatpur_bites",
                "Bharatpur Bites",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Notifications for Bharatpur Bites Rider App");
            
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }
}
```

---

## 🔑 Get FCM Server Key

1. Go to Firebase Console
2. Project Settings > Service Accounts
3. Click "Generate New Private Key"
4. Save `firebase-adminsdk-*.json`
5. Extract `private_key` and `project_id`

---

## 🖥️ Backend Implementation (Node.js)

### Step 1: Install Firebase Admin SDK

```bash
npm install firebase-admin
```

### Step 2: Initialize Firebase Admin

**server/_core/firebase.ts:**

```typescript
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

const serviceAccountPath = path.join(__dirname, '../../firebase-adminsdk.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const messaging = admin.messaging();
```

### Step 3: Create Push Notification Service

**server/services/push-notification.ts:**

```typescript
import { messaging } from '../_core/firebase';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendToUser(
  userId: number,
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    // Get user's FCM token from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user?.fcmToken) {
      console.warn(`No FCM token for user ${userId}`);
      return false;
    }

    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      token: user.fcmToken,
    };

    const response = await messaging.send(message);
    console.log('✅ Push notification sent:', response);
    return true;
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
    return false;
  }
}

export async function sendToMultipleUsers(
  userIds: number[],
  payload: PushNotificationPayload
): Promise<number> {
  let successCount = 0;

  for (const userId of userIds) {
    const success = await sendToUser(userId, payload);
    if (success) successCount++;
  }

  return successCount;
}

export async function sendToTopic(
  topic: string,
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      topic: topic,
    };

    const response = await messaging.send(message);
    console.log('✅ Topic notification sent:', response);
    return true;
  } catch (error) {
    console.error('❌ Error sending topic notification:', error);
    return false;
  }
}

export async function subscribeToTopic(
  fcmTokens: string[],
  topic: string
): Promise<boolean> {
  try {
    await messaging.subscribeToTopic(fcmTokens, topic);
    console.log(`✅ Subscribed ${fcmTokens.length} tokens to topic: ${topic}`);
    return true;
  } catch (error) {
    console.error('❌ Error subscribing to topic:', error);
    return false;
  }
}
```

### Step 4: Add tRPC Procedure for Notifications

**server/routers.ts:**

```typescript
import { sendToUser, sendToMultipleUsers } from '../services/push-notification';

export const appRouter = t.router({
  // ... existing procedures ...

  notifications: t.router({
    // Send notification to single user
    sendToUser: protectedProcedure
      .input(
        z.object({
          userId: z.number(),
          title: z.string(),
          body: z.string(),
          data: z.record(z.string()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const success = await sendToUser(input.userId, {
          title: input.title,
          body: input.body,
          data: input.data,
        });

        return { success };
      }),

    // Send notification to multiple users
    sendToMultiple: adminProcedure
      .input(
        z.object({
          userIds: z.array(z.number()),
          title: z.string(),
          body: z.string(),
          data: z.record(z.string()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const count = await sendToMultipleUsers(input.userIds, {
          title: input.title,
          body: input.body,
          data: input.data,
        });

        return { successCount: count };
      }),
  }),
});
```

### Step 5: Send Notifications on Order Events

**server/routers.ts:**

```typescript
// When new order is created
orders: t.router({
  createOrder: protectedProcedure
    .input(orderSchema)
    .mutation(async ({ input, ctx }) => {
      // Create order...
      const order = await db.insert(orders).values({...}).returning();

      // Send notification to nearby riders
      const nearbyRiders = await findNearbyRiders(
        input.deliveryLatitude,
        input.deliveryLongitude,
        5 // 5 km radius
      );

      for (const rider of nearbyRiders) {
        await sendToUser(rider.userId, {
          title: 'New Order Available',
          body: `₹${order.totalAmount} delivery from ${order.restaurantName}`,
          data: {
            orderId: order.id.toString(),
            type: 'new_order',
          },
        });
      }

      return order;
    }),
}),
```

---

## 📱 Flutter Implementation

### Step 1: Update notification_service.dart

```dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  static Future<void> initialize() async {
    // Request permission
    NotificationSettings settings = await _firebaseMessaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carryForward: true,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    print('User granted permission: ${settings.authorizationStatus}');

    // Get FCM token
    final token = await _firebaseMessaging.getToken();
    print('FCM Token: $token');

    // Save FCM token to backend
    await saveFCMTokenToBackend(token!);

    // Initialize local notifications
    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const DarwinInitializationSettings iosSettings =
        DarwinInitializationSettings();

    const InitializationSettings initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(initSettings);

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('Got a message whilst in the foreground!');
      print('Message data: ${message.data}');

      if (message.notification != null) {
        _showLocalNotification(
          message.notification!.title ?? 'Notification',
          message.notification!.body ?? '',
          message.data,
        );
      }
    });

    // Handle background messages
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Handle notification tap
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      print('Message clicked!');
      _handleNotificationTap(message.data);
    });
  }

  static Future<void> _firebaseMessagingBackgroundHandler(
      RemoteMessage message) async {
    print('Handling a background message: ${message.messageId}');
  }

  static Future<void> _showLocalNotification(
    String title,
    String body,
    Map<String, dynamic> data,
  ) async {
    const AndroidNotificationDetails androidDetails =
        AndroidNotificationDetails(
      'bharatpur_bites',
      'Bharatpur Bites',
      channelDescription: 'Notifications for Bharatpur Bites Rider App',
      importance: Importance.max,
      priority: Priority.high,
      sound: RawResourceAndroidNotificationSound('notification'),
    );

    const NotificationDetails platformChannelSpecifics = NotificationDetails(
      android: androidDetails,
    );

    await _localNotifications.show(
      0,
      title,
      body,
      platformChannelSpecifics,
      payload: data.toString(),
    );
  }

  static void _handleNotificationTap(Map<String, dynamic> data) {
    final orderId = data['orderId'];
    if (orderId != null) {
      // Navigate to order details
      // Navigator.pushNamed(context, '/order-details', arguments: orderId);
    }
  }

  static Future<void> saveFCMTokenToBackend(String token) async {
    try {
      await ApiService.post('users.saveFCMToken', {'token': token});
    } catch (e) {
      print('Error saving FCM token: $e');
    }
  }
}
```

### Step 2: Add FCM Token Saving to Backend

**server/routers.ts:**

```typescript
users: t.router({
  saveFCMToken: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .update(users)
        .set({ fcmToken: input.token })
        .where(eq(users.id, ctx.user.id));

      return { success: true };
    }),
}),
```

---

## ✅ Verification Checklist

### 1. Firebase Setup

- [ ] Firebase project created
- [ ] Android app added to Firebase
- [ ] `google-services.json` downloaded and placed in `android/app/`
- [ ] Firebase Admin SDK initialized on backend
- [ ] `firebase-adminsdk-*.json` stored securely

### 2. Android Configuration

- [ ] `firebase-messaging` dependency added
- [ ] Notification channel created in MainActivity
- [ ] AndroidManifest.xml updated with permissions
- [ ] `POST_NOTIFICATIONS` permission added

### 3. Backend Implementation

- [ ] Firebase Admin SDK initialized
- [ ] Push notification service created
- [ ] tRPC procedures for notifications added
- [ ] FCM token saving endpoint implemented
- [ ] Notifications sent on order events

### 4. Flutter Implementation

- [ ] `firebase_messaging` package added
- [ ] `NotificationService` initialized in main.dart
- [ ] Foreground message handler implemented
- [ ] Background message handler implemented
- [ ] Notification tap handler implemented
- [ ] FCM token saved to backend on app start

### 5. Testing

- [ ] Send test notification from Firebase Console
- [ ] Verify notification received in app
- [ ] Verify notification received when app is closed
- [ ] Verify notification tap opens correct screen
- [ ] Verify FCM token saved to database

---

## 🧪 Testing Notifications

### Test 1: Send from Firebase Console

1. Go to Firebase Console > Messaging
2. Click "Send your first message"
3. Enter title and body
4. Select "Send to a topic" or specific device
5. Click "Send"
6. Verify notification received on device

### Test 2: Send from Backend

```bash
# Test endpoint
curl -X POST http://localhost:3000/api/trpc/notifications.sendToUser \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": 1,
    "title": "Test Notification",
    "body": "This is a test message",
    "data": {"orderId": "123"}
  }'
```

### Test 3: Verify FCM Token

```bash
# Check if token is saved in database
SELECT id, phone, fcmToken FROM users WHERE id = 1;
```

### Test 4: Monitor Logs

```bash
# Flutter logs
flutter logs

# Backend logs
tail -f .manus-logs/devserver.log
```

---

## 🔍 Troubleshooting

### Issue: "Notification not received"

**Solution:**
- Verify FCM token is saved in database
- Check Firebase Console for errors
- Ensure app has notification permission
- Check notification channel settings

### Issue: "FCM token is null"

**Solution:**
```dart
// Force refresh token
final token = await FirebaseMessaging.instance.getToken(
  vapidKey: 'YOUR_VAPID_KEY', // For web only
);
print('New token: $token');
```

### Issue: "Permission denied"

**Solution:**
- Request notification permission in app
- Check AndroidManifest.xml for permissions
- Verify app has notification permission in device settings

### Issue: "google-services.json not found"

**Solution:**
```bash
# Download from Firebase Console
# Place in android/app/ directory
ls -la android/app/google-services.json
```

---

## 📊 Monitoring

### Firebase Console Metrics

1. Go to Firebase Console > Messaging
2. View:
   - Messages sent
   - Delivery rate
   - Error rate
   - User engagement

### Backend Logs

```bash
# Check notification logs
grep "Push notification" .manus-logs/devserver.log

# Count sent notifications
grep "✅ Push notification sent" .manus-logs/devserver.log | wc -l
```

---

## 🚀 Production Best Practices

1. **Rate Limiting:** Limit notifications to 1 per user per minute
2. **Segmentation:** Send targeted notifications to specific user groups
3. **Scheduling:** Schedule notifications during business hours
4. **A/B Testing:** Test different message content
5. **Analytics:** Track notification engagement
6. **Opt-out:** Allow users to disable notifications

---

**Status:** ✅ Production-Ready  
**Version:** 1.0.0
