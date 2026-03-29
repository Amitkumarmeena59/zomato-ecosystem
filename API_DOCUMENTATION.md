# Bharatpur Bites - API Documentation for Flutter Apps

**Version:** 1.0.0  
**Last Updated:** March 29, 2026  
**Base URL:** `https://foodecosys-rslvevea.manus.space/api/trpc`

---

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Rider APIs](#rider-apis)
3. [Restaurant APIs](#restaurant-apis)
4. [Order APIs](#order-apis)
5. [Payment APIs](#payment-apis)
6. [Tracking APIs](#tracking-apis)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## Authentication APIs

### 1. Generate OTP

**Endpoint:** `POST /otp.generate`

**Purpose:** Generate OTP for phone-based authentication

**Request Body:**
```json
{
  "phone": "+919876543210"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent to phone",
  "expiresIn": 600
}
```

**Response (Error):**
```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Failed to generate OTP"
  }
}
```

---

### 2. Verify OTP

**Endpoint:** `POST /otp.verify`

**Purpose:** Verify OTP and authenticate user

**Request Body:**
```json
{
  "phone": "+919876543210",
  "code": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP verified",
  "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Get Current User

**Endpoint:** `GET /auth.me`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Response (Success):**
```json
{
  "id": 1,
  "openId": "rider_001",
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "role": "rider",
  "createdAt": "2026-03-20T10:30:00Z",
  "updatedAt": "2026-03-29T08:45:00Z"
}
```

---

### 4. Logout

**Endpoint:** `POST /auth.logout`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Response:**
```json
{
  "success": true
}
```

---

## Rider APIs

### 1. Create Rider Profile

**Endpoint:** `POST /riders.create`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Request Body:**
```json
{
  "name": "Rajesh Kumar",
  "phone": "+919876543210",
  "email": "rajesh@example.com",
  "vehicleType": "bike",
  "vehicleNumber": "DL01AB1234",
  "licenseNumber": "DL0120230001234",
  "documents": {
    "aadhar": "https://cdn.example.com/aadhar.pdf",
    "licenseImage": "https://cdn.example.com/license.jpg"
  }
}
```

**Response:**
```json
{
  "success": true,
  "riderId": 5,
  "message": "Rider profile created successfully"
}
```

---

### 2. Toggle Duty Status

**Endpoint:** `POST /riders.toggleDuty`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Request Body:**
```json
{
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "status": "online",
  "message": "Duty status updated"
}
```

---

### 3. Update Rider Location

**Endpoint:** `POST /riders.updateLocation`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Request Body:**
```json
{
  "latitude": 28.7041,
  "longitude": 77.1025
}
```

**Response:**
```json
{
  "success": true,
  "message": "Location updated successfully"
}
```

---

### 4. Get Rider Profile

**Endpoint:** `GET /riders.getProfile`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Response:**
```json
{
  "id": 5,
  "userId": 1,
  "name": "Rajesh Kumar",
  "phone": "+919876543210",
  "email": "rajesh@example.com",
  "vehicleType": "bike",
  "vehicleNumber": "DL01AB1234",
  "licenseNumber": "DL0120230001234",
  "isActive": true,
  "currentLatitude": 28.7041,
  "currentLongitude": 77.1025,
  "rating": 4.8,
  "totalEarnings": 15000,
  "completedDeliveries": 125,
  "createdAt": "2026-03-20T10:30:00Z"
}
```

---

### 5. Get Available Orders

**Endpoint:** `GET /riders.getAvailableOrders`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Query Parameters:**
```
latitude=28.7041&longitude=77.1025&radius=5
```

**Response:**
```json
[
  {
    "id": 101,
    "restaurantId": 3,
    "restaurantName": "Taj Express",
    "restaurantLatitude": 28.7050,
    "restaurantLongitude": 77.1030,
    "customerName": "Amit Singh",
    "customerLatitude": 28.7100,
    "customerLongitude": 77.1050,
    "deliveryAddress": "123 Main St, Delhi",
    "orderAmount": 450,
    "deliveryFee": 50,
    "estimatedTime": 25,
    "distance": 2.5,
    "status": "ready",
    "items": [
      {
        "name": "Butter Chicken",
        "quantity": 1,
        "price": 300
      }
    ],
    "createdAt": "2026-03-29T08:30:00Z"
  }
]
```

---

### 6. Accept Order

**Endpoint:** `POST /riders.acceptOrder`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Request Body:**
```json
{
  "orderId": 101
}
```

**Response:**
```json
{
  "success": true,
  "orderId": 101,
  "message": "Order accepted successfully"
}
```

---

### 7. Reject Order

**Endpoint:** `POST /riders.rejectOrder`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Request Body:**
```json
{
  "orderId": 101,
  "reason": "Too far away"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order rejected"
}
```

---

### 8. Get Active Deliveries

**Endpoint:** `GET /riders.getActiveDeliveries`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Response:**
```json
[
  {
    "id": 101,
    "restaurantId": 3,
    "restaurantName": "Taj Express",
    "restaurantLatitude": 28.7050,
    "restaurantLongitude": 77.1030,
    "customerName": "Amit Singh",
    "customerLatitude": 28.7100,
    "customerLongitude": 77.1050,
    "deliveryAddress": "123 Main St, Delhi",
    "orderAmount": 450,
    "deliveryFee": 50,
    "status": "picked_up",
    "items": [
      {
        "name": "Butter Chicken",
        "quantity": 1,
        "price": 300
      }
    ],
    "acceptedAt": "2026-03-29T08:35:00Z"
  }
]
```

---

### 9. Mark Order as Picked Up

**Endpoint:** `POST /riders.markPickedUp`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Request Body:**
```json
{
  "orderId": 101
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order marked as picked up",
  "estimatedDeliveryTime": "2026-03-29T09:00:00Z"
}
```

---

### 10. Mark Order as Delivered

**Endpoint:** `POST /riders.markDelivered`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Request Body:**
```json
{
  "orderId": 101,
  "latitude": 28.7100,
  "longitude": 77.1050,
  "photo": "https://cdn.example.com/delivery_proof.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order delivered successfully",
  "earnings": 50,
  "totalEarningsToday": 450
}
```

---

### 11. Get Rider Earnings

**Endpoint:** `GET /riders.getEarnings`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Query Parameters:**
```
period=daily  // daily, weekly, monthly
```

**Response:**
```json
{
  "period": "daily",
  "date": "2026-03-29",
  "totalEarnings": 450,
  "completedDeliveries": 5,
  "averageRating": 4.8,
  "breakdown": [
    {
      "orderId": 101,
      "amount": 50,
      "deliveryTime": 25,
      "rating": 5,
      "completedAt": "2026-03-29T09:00:00Z"
    }
  ]
}
```

---

### 12. Get Rider Location (for tracking)

**Endpoint:** `GET /riders.getLocationByOrder`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Query Parameters:**
```
orderId=101
```

**Response:**
```json
{
  "riderId": 5,
  "riderName": "Rajesh Kumar",
  "latitude": 28.7070,
  "longitude": 77.1040,
  "isActive": true,
  "rating": 4.8,
  "vehicleType": "bike",
  "vehicleNumber": "DL01AB1234"
}
```

---

## Order APIs

### 1. Get Order Details

**Endpoint:** `GET /orders.getById`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Query Parameters:**
```
orderId=101
```

**Response:**
```json
{
  "id": 101,
  "customerId": 2,
  "restaurantId": 3,
  "riderId": 5,
  "status": "picked_up",
  "totalAmount": 450,
  "deliveryFee": 50,
  "items": [
    {
      "id": 1,
      "name": "Butter Chicken",
      "quantity": 1,
      "price": 300
    }
  ],
  "deliveryAddress": "123 Main St, Delhi",
  "deliveryLatitude": 28.7100,
  "deliveryLongitude": 77.1050,
  "estimatedDeliveryTime": "2026-03-29T09:00:00Z",
  "actualDeliveryTime": null,
  "createdAt": "2026-03-29T08:30:00Z"
}
```

---

### 2. Update Order Status

**Endpoint:** `POST /orders.updateStatus`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Request Body:**
```json
{
  "orderId": 101,
  "status": "delivered"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order status updated"
}
```

---

## Tracking APIs

### 1. Get Real-time Rider Location

**Endpoint:** `GET /riders.getAllActiveRiders`

**Headers:**
```
Authorization: Bearer {adminToken}
```

**Response:**
```json
[
  {
    "riderId": 5,
    "riderName": "Rajesh Kumar",
    "latitude": 28.7070,
    "longitude": 77.1040,
    "isActive": true,
    "rating": 4.8,
    "activeOrders": 2
  }
]
```

---

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `NOT_FOUND` | 404 | Resource not found |
| `FORBIDDEN` | 403 | Access denied |
| `UNAUTHORIZED` | 401 | Authentication required |
| `BAD_REQUEST` | 400 | Invalid request parameters |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |
| `CONFLICT` | 409 | Resource conflict |

---

## Rate Limiting

**Rate Limit:** 1000 requests per hour per user

**Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1648545600
```

---

## WebSocket Events (Real-time Updates)

### Connection

```
ws://foodecosys-rslvevea.manus.space/ws?token={sessionToken}
```

### Events

#### 1. New Order Available
```json
{
  "type": "NEW_ORDER",
  "data": {
    "orderId": 101,
    "restaurantName": "Taj Express",
    "deliveryFee": 50
  }
}
```

#### 2. Order Status Update
```json
{
  "type": "ORDER_STATUS",
  "data": {
    "orderId": 101,
    "status": "picked_up",
    "timestamp": "2026-03-29T08:35:00Z"
  }
}
```

#### 3. Customer Location Update
```json
{
  "type": "CUSTOMER_LOCATION",
  "data": {
    "orderId": 101,
    "latitude": 28.7100,
    "longitude": 77.1050
  }
}
```

---

## Integration Guide for Flutter Apps

### 1. Setup HTTP Client

```dart
import 'package:http/http.dart' as http;

class ApiClient {
  static const String baseUrl = 'https://foodecosys-rslvevea.manus.space/api/trpc';
  static String? authToken;

  static Future<Map<String, dynamic>> post(String endpoint, Map<String, dynamic> body) async {
    final response = await http.post(
      Uri.parse('$baseUrl/$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (authToken != null) 'Authorization': 'Bearer $authToken',
      },
      body: jsonEncode(body),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('API Error: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> get(String endpoint, [Map<String, String>? queryParams]) async {
    final uri = Uri.parse('$baseUrl/$endpoint').replace(queryParameters: queryParams);
    final response = await http.get(
      uri,
      headers: {
        'Content-Type': 'application/json',
        if (authToken != null) 'Authorization': 'Bearer $authToken',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('API Error: ${response.body}');
    }
  }
}
```

### 2. Authentication Flow

```dart
// Generate OTP
await ApiClient.post('otp.generate', {'phone': '+919876543210'});

// Verify OTP
final response = await ApiClient.post('otp.verify', {
  'phone': '+919876543210',
  'code': '123456'
});

ApiClient.authToken = response['sessionToken'];
```

### 3. Accept Order

```dart
await ApiClient.post('riders.acceptOrder', {'orderId': 101});
```

### 4. Update Location

```dart
await ApiClient.post('riders.updateLocation', {
  'latitude': 28.7041,
  'longitude': 77.1025
});
```

---

## Database Schema Reference

### Riders Table
```sql
CREATE TABLE riders (
  id INT PRIMARY KEY,
  userId INT,
  name VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  vehicleType VARCHAR(50),
  vehicleNumber VARCHAR(50),
  licenseNumber VARCHAR(50),
  isActive BOOLEAN,
  currentLatitude DECIMAL(10, 8),
  currentLongitude DECIMAL(11, 8),
  rating DECIMAL(3, 2),
  totalEarnings DECIMAL(10, 2),
  completedDeliveries INT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY,
  customerId INT,
  restaurantId INT,
  riderId INT,
  status VARCHAR(50),
  totalAmount DECIMAL(10, 2),
  deliveryFee DECIMAL(10, 2),
  deliveryAddress TEXT,
  deliveryLatitude DECIMAL(10, 8),
  deliveryLongitude DECIMAL(11, 8),
  estimatedDeliveryTime TIMESTAMP,
  actualDeliveryTime TIMESTAMP,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

---

## Support & Troubleshooting

**Common Issues:**

1. **401 Unauthorized** - Token expired or invalid. Re-authenticate.
2. **403 Forbidden** - User role doesn't have access. Check user permissions.
3. **429 Too Many Requests** - Rate limit exceeded. Wait before retrying.
4. **500 Internal Server Error** - Server issue. Retry after some time.

**Contact:** support@bharatpurbites.com

---

**End of API Documentation**
