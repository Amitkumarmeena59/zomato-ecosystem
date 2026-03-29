# Bharatpur Bites - Flutter Restaurant App

**Version:** 1.0.0  
**Platform:** Android (iOS ready)  
**Framework:** Flutter 3.x  
**Language:** Dart  
**Theme:** Red/White brand colors

---

## Project Structure

```
bharatpur_bites_restaurant/
├── android/                    # Android native code
├── ios/                        # iOS native code (ready)
├── lib/
│   ├── main.dart              # App entry point
│   ├── config/
│   │   ├── api_config.dart    # API endpoints and configuration
│   │   ├── theme.dart         # Brand colors and theme
│   │   └── constants.dart     # App constants
│   ├── models/
│   │   ├── restaurant_model.dart  # Restaurant data model
│   │   ├── menu_item_model.dart   # Menu item data model
│   │   ├── order_model.dart       # Order data model
│   │   └── user_model.dart        # User authentication model
│   ├── services/
│   │   ├── api_service.dart   # HTTP API calls
│   │   ├── auth_service.dart  # Authentication logic
│   │   ├── notification_service.dart # Push notifications
│   │   └── storage_service.dart # Local storage
│   ├── providers/             # State management (Provider package)
│   │   ├── auth_provider.dart
│   │   ├── menu_provider.dart
│   │   ├── order_provider.dart
│   │   └── earnings_provider.dart
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── login_screen.dart
│   │   │   ├── otp_verification_screen.dart
│   │   │   ├── document_upload_screen.dart
│   │   │   └── profile_setup_screen.dart
│   │   ├── home/
│   │   │   ├── home_screen.dart
│   │   │   ├── pending_orders_screen.dart
│   │   │   └── order_details_screen.dart
│   │   ├── menu/
│   │   │   ├── menu_screen.dart
│   │   │   ├── add_item_screen.dart
│   │   │   ├── edit_item_screen.dart
│   │   │   └── item_availability_screen.dart
│   │   ├── orders/
│   │   │   ├── orders_screen.dart
│   │   │   ├── order_details_screen.dart
│   │   │   ├── accept_order_screen.dart
│   │   │   └── ready_for_pickup_screen.dart
│   │   ├── earnings/
│   │   │   ├── earnings_screen.dart
│   │   │   ├── daily_earnings_screen.dart
│   │   │   ├── weekly_earnings_screen.dart
│   │   │   └── commission_details_screen.dart
│   │   ├── profile/
│   │   │   ├── profile_screen.dart
│   │   │   ├── edit_profile_screen.dart
│   │   │   ├── documents_screen.dart
│   │   │   └── settings_screen.dart
│   │   └── common/
│   │       ├── splash_screen.dart
│   │       ├── bottom_nav_screen.dart
│   │       └── error_screen.dart
│   ├── widgets/
│   │   ├── custom_app_bar.dart
│   │   ├── order_card.dart
│   │   ├── menu_item_card.dart
│   │   ├── status_badge.dart
│   │   ├── earnings_card.dart
│   │   ├── custom_button.dart
│   │   └── loading_widget.dart
│   └── utils/
│       ├── validators.dart
│       ├── date_formatter.dart
│       └── logger.dart
├── pubspec.yaml               # Dependencies
├── README.md                  # Project documentation
└── .env.example              # Environment variables template
```

---

## pubspec.yaml Dependencies

```yaml
name: bharatpur_bites_restaurant
description: Bharatpur Bites Restaurant Management App
publish_to: 'none'

version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  # State Management
  provider: ^6.0.0
  
  # HTTP & API
  http: ^1.1.0
  dio: ^5.3.0
  
  # Local Storage
  shared_preferences: ^2.2.0
  hive: ^2.2.0
  hive_flutter: ^1.1.0
  
  # Authentication
  firebase_core: ^2.24.0
  firebase_messaging: ^14.6.0
  
  # UI Components
  cupertino_icons: ^1.0.2
  flutter_svg: ^2.0.0
  cached_network_image: ^3.3.0
  
  # Date & Time
  intl: ^0.19.0
  
  # Notifications
  flutter_local_notifications: ^15.1.0
  
  # Image Picker
  image_picker: ^1.0.0
  
  # File Upload
  file_picker: ^6.0.0
  
  # JSON Serialization
  json_serializable: ^6.7.0
  
  # Logging
  logger: ^2.0.0
  
  # Environment Variables
  flutter_dotenv: ^5.1.0

dev_dependencies:
  flutter_test:
    sdk: flutter

  flutter_lints: ^3.0.0
  build_runner: ^2.4.0
  json_serializable: ^6.7.0

flutter:
  uses-material-design: true
  
  assets:
    - assets/images/
    - assets/icons/
    - .env
```

---

## Core Implementation Files

### 1. main.dart

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'config/theme.dart';
import 'providers/auth_provider.dart';
import 'providers/menu_provider.dart';
import 'providers/order_provider.dart';
import 'providers/earnings_provider.dart';
import 'screens/common/splash_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/common/bottom_nav_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => MenuProvider()),
        ChangeNotifierProvider(create: (_) => OrderProvider()),
        ChangeNotifierProvider(create: (_) => EarningsProvider()),
      ],
      child: MaterialApp(
        title: 'Bharatpur Bites Restaurant',
        theme: AppTheme.lightTheme,
        home: Consumer<AuthProvider>(
          builder: (context, authProvider, _) {
            if (authProvider.isLoading) {
              return const SplashScreen();
            }
            
            if (authProvider.isAuthenticated) {
              return const BottomNavScreen();
            }
            
            return const LoginScreen();
          },
        ),
      ),
    );
  }
}
```

### 2. models/menu_item_model.dart

```dart
class MenuItem {
  final int id;
  final int restaurantId;
  final String name;
  final String description;
  final double price;
  final String category; // veg, non-veg
  final bool isAvailable;
  final String? imageUrl;
  final double? rating;
  final int? reviewCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  MenuItem({
    required this.id,
    required this.restaurantId,
    required this.name,
    required this.description,
    required this.price,
    required this.category,
    required this.isAvailable,
    this.imageUrl,
    this.rating,
    this.reviewCount,
    required this.createdAt,
    required this.updatedAt,
  });

  factory MenuItem.fromJson(Map<String, dynamic> json) {
    return MenuItem(
      id: json['id'],
      restaurantId: json['restaurantId'],
      name: json['name'],
      description: json['description'],
      price: json['price'],
      category: json['category'],
      isAvailable: json['isAvailable'],
      imageUrl: json['imageUrl'],
      rating: json['rating'],
      reviewCount: json['reviewCount'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'restaurantId': restaurantId,
      'name': name,
      'description': description,
      'price': price,
      'category': category,
      'isAvailable': isAvailable,
      'imageUrl': imageUrl,
      'rating': rating,
      'reviewCount': reviewCount,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
```

### 3. models/order_model.dart

```dart
class RestaurantOrder {
  final int id;
  final int customerId;
  final int restaurantId;
  final int? riderId;
  final String status; // pending, confirmed, ready, picked_up, delivered, cancelled
  final double totalAmount;
  final double deliveryFee;
  final List<OrderItem> items;
  final String deliveryAddress;
  final String customerName;
  final String customerPhone;
  final DateTime createdAt;
  final DateTime? readyTime;
  final DateTime? pickedUpTime;
  final DateTime? deliveredTime;

  RestaurantOrder({
    required this.id,
    required this.customerId,
    required this.restaurantId,
    this.riderId,
    required this.status,
    required this.totalAmount,
    required this.deliveryFee,
    required this.items,
    required this.deliveryAddress,
    required this.customerName,
    required this.customerPhone,
    required this.createdAt,
    this.readyTime,
    this.pickedUpTime,
    this.deliveredTime,
  });

  factory RestaurantOrder.fromJson(Map<String, dynamic> json) {
    return RestaurantOrder(
      id: json['id'],
      customerId: json['customerId'],
      restaurantId: json['restaurantId'],
      riderId: json['riderId'],
      status: json['status'],
      totalAmount: json['totalAmount'],
      deliveryFee: json['deliveryFee'],
      items: (json['items'] as List)
          .map((item) => OrderItem.fromJson(item))
          .toList(),
      deliveryAddress: json['deliveryAddress'],
      customerName: json['customerName'],
      customerPhone: json['customerPhone'],
      createdAt: DateTime.parse(json['createdAt']),
      readyTime: json['readyTime'] != null
          ? DateTime.parse(json['readyTime'])
          : null,
      pickedUpTime: json['pickedUpTime'] != null
          ? DateTime.parse(json['pickedUpTime'])
          : null,
      deliveredTime: json['deliveredTime'] != null
          ? DateTime.parse(json['deliveredTime'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customerId': customerId,
      'restaurantId': restaurantId,
      'riderId': riderId,
      'status': status,
      'totalAmount': totalAmount,
      'deliveryFee': deliveryFee,
      'items': items.map((item) => item.toJson()).toList(),
      'deliveryAddress': deliveryAddress,
      'customerName': customerName,
      'customerPhone': customerPhone,
      'createdAt': createdAt.toIso8601String(),
      'readyTime': readyTime?.toIso8601String(),
      'pickedUpTime': pickedUpTime?.toIso8601String(),
      'deliveredTime': deliveredTime?.toIso8601String(),
    };
  }
}

class OrderItem {
  final int id;
  final String name;
  final int quantity;
  final double price;

  OrderItem({
    required this.id,
    required this.name,
    required this.quantity,
    required this.price,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'],
      name: json['name'],
      quantity: json['quantity'],
      price: json['price'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'quantity': quantity,
      'price': price,
    };
  }
}
```

### 4. providers/menu_provider.dart

```dart
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/menu_item_model.dart';

class MenuProvider extends ChangeNotifier {
  List<MenuItem> _menuItems = [];
  bool _isLoading = false;
  String? _error;

  List<MenuItem> get menuItems => _menuItems;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchMenuItems() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get('restaurants.getMenu');
      _menuItems = (response as List)
          .map((item) => MenuItem.fromJson(item))
          .toList();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> addMenuItem(MenuItem item) async {
    try {
      await ApiService.post('restaurants.addMenuItem', item.toJson());
      await fetchMenuItems();
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }

  Future<bool> updateMenuItem(MenuItem item) async {
    try {
      await ApiService.post('restaurants.updateMenuItem', item.toJson());
      await fetchMenuItems();
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }

  Future<bool> deleteMenuItem(int itemId) async {
    try {
      await ApiService.post(
        'restaurants.deleteMenuItem',
        {'itemId': itemId},
      );
      await fetchMenuItems();
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }

  Future<bool> toggleAvailability(int itemId, bool isAvailable) async {
    try {
      await ApiService.post(
        'restaurants.toggleItemAvailability',
        {'itemId': itemId, 'isAvailable': isAvailable},
      );
      await fetchMenuItems();
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }
}
```

### 5. providers/order_provider.dart

```dart
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/order_model.dart';

class OrderProvider extends ChangeNotifier {
  List<RestaurantOrder> _pendingOrders = [];
  List<RestaurantOrder> _readyOrders = [];
  List<RestaurantOrder> _completedOrders = [];
  RestaurantOrder? _currentOrder;
  bool _isLoading = false;
  String? _error;

  List<RestaurantOrder> get pendingOrders => _pendingOrders;
  List<RestaurantOrder> get readyOrders => _readyOrders;
  List<RestaurantOrder> get completedOrders => _completedOrders;
  RestaurantOrder? get currentOrder => _currentOrder;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchOrders() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get('restaurants.getOrders');
      final orders = (response as List)
          .map((order) => RestaurantOrder.fromJson(order))
          .toList();

      _pendingOrders = orders
          .where((o) => o.status == 'pending' || o.status == 'confirmed')
          .toList();
      _readyOrders = orders
          .where((o) => o.status == 'ready')
          .toList();
      _completedOrders = orders
          .where((o) => o.status == 'picked_up' || o.status == 'delivered')
          .toList();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> acceptOrder(int orderId) async {
    try {
      await ApiService.post(
        'restaurants.acceptOrder',
        {'orderId': orderId},
      );
      await fetchOrders();
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }

  Future<bool> rejectOrder(int orderId, String reason) async {
    try {
      await ApiService.post(
        'restaurants.rejectOrder',
        {'orderId': orderId, 'reason': reason},
      );
      await fetchOrders();
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }

  Future<bool> markReady(int orderId) async {
    try {
      await ApiService.post(
        'restaurants.markOrderReady',
        {'orderId': orderId},
      );
      await fetchOrders();
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }
}
```

### 6. providers/earnings_provider.dart

```dart
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class EarningsProvider extends ChangeNotifier {
  Map<String, dynamic>? _dailyEarnings;
  Map<String, dynamic>? _weeklyEarnings;
  List<dynamic> _payoutHistory = [];
  bool _isLoading = false;
  String? _error;

  Map<String, dynamic>? get dailyEarnings => _dailyEarnings;
  Map<String, dynamic>? get weeklyEarnings => _weeklyEarnings;
  List<dynamic> get payoutHistory => _payoutHistory;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchDailyEarnings() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get(
        'restaurants.getEarnings',
        {'period': 'daily'},
      );
      _dailyEarnings = response;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchWeeklyEarnings() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get(
        'restaurants.getEarnings',
        {'period': 'weekly'},
      );
      _weeklyEarnings = response;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchPayoutHistory() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get('restaurants.getPayoutHistory');
      _payoutHistory = response as List;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
```

---

## Screen Implementation Examples

### Home Screen (home_screen.dart)

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/order_provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    context.read<OrderProvider>().fetchOrders();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bharatpur Bites'),
        actions: [
          Consumer<AuthProvider>(
            builder: (context, authProvider, _) {
              return Padding(
                padding: const EdgeInsets.all(16.0),
                child: Center(
                  child: Text(
                    authProvider.user?.name ?? 'Restaurant',
                    style: const TextStyle(color: AppTheme.white),
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: Consumer<OrderProvider>(
        builder: (context, orderProvider, _) {
          if (orderProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          return RefreshIndicator(
            onRefresh: () => orderProvider.fetchOrders(),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Pending Orders Section
                if (orderProvider.pendingOrders.isNotEmpty) ...[
                  const Text(
                    'Pending Orders',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ...orderProvider.pendingOrders.map((order) {
                    return _buildOrderCard(order, context);
                  }),
                  const SizedBox(height: 24),
                ],

                // Ready Orders Section
                if (orderProvider.readyOrders.isNotEmpty) ...[
                  const Text(
                    'Ready for Pickup',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.successGreen,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ...orderProvider.readyOrders.map((order) {
                    return _buildReadyOrderCard(order, context);
                  }),
                  const SizedBox(height: 24),
                ],

                // No Orders
                if (orderProvider.pendingOrders.isEmpty &&
                    orderProvider.readyOrders.isEmpty)
                  const Center(
                    child: Text('No pending orders'),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildOrderCard(RestaurantOrder order, BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Order #${order.id}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                _buildStatusBadge(order.status),
              ],
            ),
            const SizedBox(height: 8),
            Text('Customer: ${order.customerName}'),
            Text('Items: ${order.items.length}'),
            Text('Amount: ₹${order.totalAmount}'),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      context.read<OrderProvider>().acceptOrder(order.id);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.successGreen,
                    ),
                    child: const Text('Accept'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      // Show reject dialog
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.warningOrange,
                    ),
                    child: const Text('Reject'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReadyOrderCard(RestaurantOrder order, BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      color: const Color(0xFFF0F8F5),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Order #${order.id}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppTheme.successGreen,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'Ready',
                    style: TextStyle(
                      color: AppTheme.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text('Customer: ${order.customerName}'),
            Text('Phone: ${order.customerPhone}'),
            Text('Amount: ₹${order.totalAmount}'),
            const SizedBox(height: 12),
            const Text(
              'Waiting for rider pickup...',
              style: TextStyle(
                color: AppTheme.successGreen,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bgColor;
    String displayText;

    switch (status) {
      case 'pending':
        bgColor = AppTheme.warningOrange;
        displayText = 'Pending';
        break;
      case 'confirmed':
        bgColor = AppTheme.primaryRed;
        displayText = 'Confirmed';
        break;
      case 'ready':
        bgColor = AppTheme.successGreen;
        displayText = 'Ready';
        break;
      default:
        bgColor = AppTheme.borderGray;
        displayText = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        displayText,
        style: const TextStyle(
          color: AppTheme.white,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
```

---

## Setup Instructions

### 1. Create Flutter Project

```bash
flutter create bharatpur_bites_restaurant
cd bharatpur_bites_restaurant
```

### 2. Add Dependencies

```bash
flutter pub add provider http dio shared_preferences hive hive_flutter \
  firebase_core firebase_messaging flutter_local_notifications \
  image_picker file_picker json_serializable logger flutter_dotenv
```

### 3. Create .env File

```
API_BASE_URL=https://foodecosys-rslvevea.manus.space/api/trpc
FIREBASE_PROJECT_ID=your_project_id
```

### 4. Run App

```bash
flutter run
```

---

## Key Features

✅ **Order Management** - Accept, reject, and mark orders as ready  
✅ **Menu Management** - Add, edit, delete menu items  
✅ **Availability Toggle** - Control item availability in real-time  
✅ **Earnings Dashboard** - Daily and weekly earnings summaries  
✅ **Payout History** - Track all payouts  
✅ **Real-time Notifications** - Get instant order alerts  
✅ **Mobile Responsive** - Optimized for all screen sizes  
✅ **Offline Support** - Local caching for offline access  

---

**End of Flutter Restaurant App Documentation**
