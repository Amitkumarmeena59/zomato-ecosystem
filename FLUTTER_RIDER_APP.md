# Bharatpur Bites - Flutter Rider App

**Version:** 1.0.0  
**Platform:** Android (iOS ready)  
**Framework:** Flutter 3.x  
**Language:** Dart  
**Theme:** Red/White brand colors

---

## Project Structure

```
bharatpur_bites_rider/
├── android/                    # Android native code
├── ios/                        # iOS native code (ready)
├── lib/
│   ├── main.dart              # App entry point
│   ├── config/
│   │   ├── api_config.dart    # API endpoints and configuration
│   │   ├── theme.dart         # Brand colors and theme
│   │   └── constants.dart     # App constants
│   ├── models/
│   │   ├── rider_model.dart   # Rider data model
│   │   ├── order_model.dart   # Order data model
│   │   ├── location_model.dart# Location data model
│   │   └── user_model.dart    # User authentication model
│   ├── services/
│   │   ├── api_service.dart   # HTTP API calls
│   │   ├── auth_service.dart  # Authentication logic
│   │   ├── location_service.dart # GPS location tracking
│   │   ├── notification_service.dart # Push notifications
│   │   └── storage_service.dart # Local storage
│   ├── providers/             # State management (Provider package)
│   │   ├── auth_provider.dart
│   │   ├── order_provider.dart
│   │   ├── location_provider.dart
│   │   └── earnings_provider.dart
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── login_screen.dart
│   │   │   ├── otp_verification_screen.dart
│   │   │   ├── document_upload_screen.dart
│   │   │   └── profile_setup_screen.dart
│   │   ├── home/
│   │   │   ├── home_screen.dart
│   │   │   ├── available_orders_screen.dart
│   │   │   └── order_details_screen.dart
│   │   ├── delivery/
│   │   │   ├── active_delivery_screen.dart
│   │   │   ├── map_navigation_screen.dart
│   │   │   ├── pickup_confirmation_screen.dart
│   │   │   └── delivery_confirmation_screen.dart
│   │   ├── earnings/
│   │   │   ├── earnings_screen.dart
│   │   │   ├── daily_earnings_screen.dart
│   │   │   ├── weekly_earnings_screen.dart
│   │   │   └── payout_history_screen.dart
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
name: bharatpur_bites_rider
description: Bharatpur Bites Rider Mobile App
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
  
  # Location & Maps
  google_maps_flutter: ^2.5.0
  geolocator: ^9.0.0
  google_maps_flutter_web: ^0.5.0
  
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
import 'providers/order_provider.dart';
import 'providers/location_provider.dart';
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
        ChangeNotifierProvider(create: (_) => OrderProvider()),
        ChangeNotifierProvider(create: (_) => LocationProvider()),
        ChangeNotifierProvider(create: (_) => EarningsProvider()),
      ],
      child: MaterialApp(
        title: 'Bharatpur Bites Rider',
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

### 2. config/theme.dart

```dart
import 'package:flutter/material.dart';

class AppTheme {
  // Brand Colors
  static const Color primaryRed = Color(0xFFE63946);
  static const Color darkRed = Color(0xFFD62828);
  static const Color white = Color(0xFFFFFFFF);
  static const Color lightGray = Color(0xFFF5F5F5);
  static const Color darkGray = Color(0xFF333333);
  static const Color borderGray = Color(0xFFEEEEEE);
  static const Color successGreen = Color(0xFF06A77D);
  static const Color warningOrange = Color(0xFFFFA500);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      primaryColor: primaryRed,
      scaffoldBackgroundColor: white,
      appBarTheme: const AppBarTheme(
        backgroundColor: primaryRed,
        foregroundColor: white,
        elevation: 0,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryRed,
          foregroundColor: white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      ),
      textTheme: const TextTheme(
        headlineLarge: TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.bold,
          color: darkGray,
        ),
        headlineMedium: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.bold,
          color: darkGray,
        ),
        bodyLarge: TextStyle(
          fontSize: 16,
          color: darkGray,
        ),
        bodyMedium: TextStyle(
          fontSize: 14,
          color: darkGray,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: lightGray,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: borderGray),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: borderGray),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: primaryRed, width: 2),
        ),
      ),
    );
  }
}
```

### 3. models/rider_model.dart

```dart
class Rider {
  final int id;
  final int userId;
  final String name;
  final String phone;
  final String email;
  final String vehicleType; // bike, car, bicycle
  final String vehicleNumber;
  final String licenseNumber;
  final bool isActive;
  final double currentLatitude;
  final double currentLongitude;
  final double rating;
  final double totalEarnings;
  final int completedDeliveries;
  final String aadharUrl;
  final String licenseImageUrl;
  final DateTime createdAt;
  final DateTime updatedAt;

  Rider({
    required this.id,
    required this.userId,
    required this.name,
    required this.phone,
    required this.email,
    required this.vehicleType,
    required this.vehicleNumber,
    required this.licenseNumber,
    required this.isActive,
    required this.currentLatitude,
    required this.currentLongitude,
    required this.rating,
    required this.totalEarnings,
    required this.completedDeliveries,
    required this.aadharUrl,
    required this.licenseImageUrl,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Rider.fromJson(Map<String, dynamic> json) {
    return Rider(
      id: json['id'],
      userId: json['userId'],
      name: json['name'],
      phone: json['phone'],
      email: json['email'],
      vehicleType: json['vehicleType'],
      vehicleNumber: json['vehicleNumber'],
      licenseNumber: json['licenseNumber'],
      isActive: json['isActive'],
      currentLatitude: json['currentLatitude'],
      currentLongitude: json['currentLongitude'],
      rating: json['rating'],
      totalEarnings: json['totalEarnings'],
      completedDeliveries: json['completedDeliveries'],
      aadharUrl: json['aadharUrl'],
      licenseImageUrl: json['licenseImageUrl'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'name': name,
      'phone': phone,
      'email': email,
      'vehicleType': vehicleType,
      'vehicleNumber': vehicleNumber,
      'licenseNumber': licenseNumber,
      'isActive': isActive,
      'currentLatitude': currentLatitude,
      'currentLongitude': currentLongitude,
      'rating': rating,
      'totalEarnings': totalEarnings,
      'completedDeliveries': completedDeliveries,
      'aadharUrl': aadharUrl,
      'licenseImageUrl': licenseImageUrl,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
```

### 4. models/order_model.dart

```dart
class Order {
  final int id;
  final int customerId;
  final int restaurantId;
  final int? riderId;
  final String status; // pending, confirmed, ready, picked_up, delivered, cancelled
  final double totalAmount;
  final double deliveryFee;
  final List<OrderItem> items;
  final String deliveryAddress;
  final double deliveryLatitude;
  final double deliveryLongitude;
  final String restaurantName;
  final double restaurantLatitude;
  final double restaurantLongitude;
  final String customerName;
  final String customerPhone;
  final DateTime createdAt;
  final DateTime? estimatedDeliveryTime;
  final DateTime? actualDeliveryTime;

  Order({
    required this.id,
    required this.customerId,
    required this.restaurantId,
    this.riderId,
    required this.status,
    required this.totalAmount,
    required this.deliveryFee,
    required this.items,
    required this.deliveryAddress,
    required this.deliveryLatitude,
    required this.deliveryLongitude,
    required this.restaurantName,
    required this.restaurantLatitude,
    required this.restaurantLongitude,
    required this.customerName,
    required this.customerPhone,
    required this.createdAt,
    this.estimatedDeliveryTime,
    this.actualDeliveryTime,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
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
      deliveryLatitude: json['deliveryLatitude'],
      deliveryLongitude: json['deliveryLongitude'],
      restaurantName: json['restaurantName'],
      restaurantLatitude: json['restaurantLatitude'],
      restaurantLongitude: json['restaurantLongitude'],
      customerName: json['customerName'],
      customerPhone: json['customerPhone'],
      createdAt: DateTime.parse(json['createdAt']),
      estimatedDeliveryTime: json['estimatedDeliveryTime'] != null
          ? DateTime.parse(json['estimatedDeliveryTime'])
          : null,
      actualDeliveryTime: json['actualDeliveryTime'] != null
          ? DateTime.parse(json['actualDeliveryTime'])
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
      'deliveryLatitude': deliveryLatitude,
      'deliveryLongitude': deliveryLongitude,
      'restaurantName': restaurantName,
      'restaurantLatitude': restaurantLatitude,
      'restaurantLongitude': restaurantLongitude,
      'customerName': customerName,
      'customerPhone': customerPhone,
      'createdAt': createdAt.toIso8601String(),
      'estimatedDeliveryTime': estimatedDeliveryTime?.toIso8601String(),
      'actualDeliveryTime': actualDeliveryTime?.toIso8601String(),
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

### 5. services/api_service.dart

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiService {
  static final String baseUrl = dotenv.env['API_BASE_URL'] ?? 
      'https://foodecosys-rslvevea.manus.space/api/trpc';
  static String? authToken;

  static Future<Map<String, dynamic>> post(
    String endpoint,
    Map<String, dynamic> body,
  ) async {
    try {
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
    } catch (e) {
      throw Exception('Network Error: $e');
    }
  }

  static Future<Map<String, dynamic>> get(
    String endpoint, [
    Map<String, String>? queryParams,
  ]) async {
    try {
      final uri = Uri.parse('$baseUrl/$endpoint')
          .replace(queryParameters: queryParams);
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
    } catch (e) {
      throw Exception('Network Error: $e');
    }
  }
}
```

### 6. services/auth_service.dart

```dart
import 'api_service.dart';

class AuthService {
  static Future<void> generateOtp(String phone) async {
    await ApiService.post('otp.generate', {'phone': phone});
  }

  static Future<String> verifyOtp(String phone, String code) async {
    final response = await ApiService.post(
      'otp.verify',
      {'phone': phone, 'code': code},
    );
    
    if (response['sessionToken'] != null) {
      ApiService.authToken = response['sessionToken'];
      return response['sessionToken'];
    }
    throw Exception('Failed to verify OTP');
  }

  static Future<Map<String, dynamic>> getCurrentUser() async {
    return await ApiService.get('auth.me');
  }

  static Future<void> logout() async {
    await ApiService.post('auth.logout', {});
    ApiService.authToken = null;
  }
}
```

### 7. services/location_service.dart

```dart
import 'package:geolocator/geolocator.dart';
import 'api_service.dart';

class LocationService {
  static Future<bool> requestLocationPermission() async {
    final permission = await Geolocator.requestPermission();
    return permission == LocationPermission.always ||
        permission == LocationPermission.whileInUse;
  }

  static Future<Position> getCurrentLocation() async {
    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
  }

  static Stream<Position> getLocationStream() {
    return Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10, // Update every 10 meters
      ),
    );
  }

  static Future<void> updateRiderLocation(
    double latitude,
    double longitude,
  ) async {
    await ApiService.post(
      'riders.updateLocation',
      {'latitude': latitude, 'longitude': longitude},
    );
  }
}
```

### 8. providers/auth_provider.dart

```dart
import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../models/user_model.dart';

class AuthProvider extends ChangeNotifier {
  User? _user;
  bool _isLoading = false;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  Future<void> generateOtp(String phone) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await AuthService.generateOtp(phone);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> verifyOtp(String phone, String code) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await AuthService.verifyOtp(phone, code);
      await fetchCurrentUser();
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchCurrentUser() async {
    try {
      final userData = await AuthService.getCurrentUser();
      _user = User.fromJson(userData);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
    }
  }

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await AuthService.logout();
      _user = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
```

### 9. providers/order_provider.dart

```dart
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/order_model.dart';

class OrderProvider extends ChangeNotifier {
  List<Order> _availableOrders = [];
  List<Order> _activeDeliveries = [];
  Order? _currentOrder;
  bool _isLoading = false;
  String? _error;

  List<Order> get availableOrders => _availableOrders;
  List<Order> get activeDeliveries => _activeDeliveries;
  Order? get currentOrder => _currentOrder;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchAvailableOrders(double latitude, double longitude) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get(
        'riders.getAvailableOrders',
        {
          'latitude': latitude.toString(),
          'longitude': longitude.toString(),
          'radius': '5',
        },
      );

      _availableOrders = (response as List)
          .map((order) => Order.fromJson(order))
          .toList();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchActiveDeliveries() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get('riders.getActiveDeliveries');
      _activeDeliveries = (response as List)
          .map((order) => Order.fromJson(order))
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
      await ApiService.post('riders.acceptOrder', {'orderId': orderId});
      await fetchAvailableOrders(0, 0); // Refresh list
      await fetchActiveDeliveries();
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }

  Future<bool> rejectOrder(int orderId, String reason) async {
    try {
      await ApiService.post(
        'riders.rejectOrder',
        {'orderId': orderId, 'reason': reason},
      );
      await fetchAvailableOrders(0, 0);
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }

  Future<bool> markPickedUp(int orderId) async {
    try {
      await ApiService.post('riders.markPickedUp', {'orderId': orderId});
      await fetchActiveDeliveries();
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }

  Future<bool> markDelivered(int orderId, double latitude, double longitude) async {
    try {
      await ApiService.post(
        'riders.markDelivered',
        {
          'orderId': orderId,
          'latitude': latitude,
          'longitude': longitude,
        },
      );
      await fetchActiveDeliveries();
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }
}
```

### 10. providers/location_provider.dart

```dart
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../services/location_service.dart';

class LocationProvider extends ChangeNotifier {
  Position? _currentPosition;
  bool _isTracking = false;
  String? _error;

  Position? get currentPosition => _currentPosition;
  bool get isTracking => _isTracking;
  String? get error => _error;

  Future<void> initializeLocation() async {
    try {
      final hasPermission = await LocationService.requestLocationPermission();
      if (!hasPermission) {
        _error = 'Location permission denied';
        notifyListeners();
        return;
      }

      _currentPosition = await LocationService.getCurrentLocation();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  void startLocationTracking() {
    _isTracking = true;
    notifyListeners();

    LocationService.getLocationStream().listen((Position position) {
      _currentPosition = position;
      notifyListeners();
    });
  }

  void stopLocationTracking() {
    _isTracking = false;
    notifyListeners();
  }
}
```

### 11. providers/earnings_provider.dart

```dart
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class EarningsProvider extends ChangeNotifier {
  Map<String, dynamic>? _dailyEarnings;
  Map<String, dynamic>? _weeklyEarnings;
  bool _isLoading = false;
  String? _error;

  Map<String, dynamic>? get dailyEarnings => _dailyEarnings;
  Map<String, dynamic>? get weeklyEarnings => _weeklyEarnings;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchDailyEarnings() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get(
        'riders.getEarnings',
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
        'riders.getEarnings',
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
import '../../providers/location_provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    final locationProvider = context.read<LocationProvider>();
    final orderProvider = context.read<OrderProvider>();
    
    if (locationProvider.currentPosition != null) {
      orderProvider.fetchAvailableOrders(
        locationProvider.currentPosition!.latitude,
        locationProvider.currentPosition!.longitude,
      );
    }
    orderProvider.fetchActiveDeliveries();
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
                    authProvider.user?.name ?? 'Rider',
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
            onRefresh: () => Future.wait([
              orderProvider.fetchAvailableOrders(0, 0),
              orderProvider.fetchActiveDeliveries(),
            ]),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Active Deliveries Section
                if (orderProvider.activeDeliveries.isNotEmpty) ...[
                  const Text(
                    'Active Deliveries',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ...orderProvider.activeDeliveries.map((order) {
                    return _buildOrderCard(order, context);
                  }),
                  const SizedBox(height: 24),
                ],

                // Available Orders Section
                const Text(
                  'Available Orders',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                if (orderProvider.availableOrders.isEmpty)
                  const Center(
                    child: Text('No orders available'),
                  )
                else
                  ...orderProvider.availableOrders.map((order) {
                    return _buildAvailableOrderCard(order, context);
                  }),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildOrderCard(Order order, BuildContext context) {
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
                  order.restaurantName,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                _buildStatusBadge(order.status),
              ],
            ),
            const SizedBox(height: 8),
            Text('To: ${order.customerName}'),
            Text('Amount: ₹${order.totalAmount}'),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () {
                // Navigate to map navigation screen
              },
              child: const Text('Navigate'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvailableOrderCard(Order order, BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              order.restaurantName,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text('Delivery Fee: ₹${order.deliveryFee}'),
            Text('Order Amount: ₹${order.totalAmount}'),
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

  Widget _buildStatusBadge(String status) {
    Color bgColor;
    String displayText;

    switch (status) {
      case 'picked_up':
        bgColor = AppTheme.successGreen;
        displayText = 'Picked Up';
        break;
      case 'on_the_way':
        bgColor = AppTheme.primaryRed;
        displayText = 'On the Way';
        break;
      case 'delivered':
        bgColor = AppTheme.successGreen;
        displayText = 'Delivered';
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
flutter create bharatpur_bites_rider
cd bharatpur_bites_rider
```

### 2. Add Dependencies

```bash
flutter pub add provider http dio shared_preferences hive hive_flutter \
  google_maps_flutter geolocator firebase_core firebase_messaging \
  flutter_local_notifications image_picker file_picker json_serializable \
  logger flutter_dotenv
```

### 3. Configure Google Maps

**Android (android/app/src/main/AndroidManifest.xml):**
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
```

**iOS (ios/Runner/Info.plist):**
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location for delivery navigation</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>We need your location for delivery navigation</string>
```

### 4. Create .env File

```
API_BASE_URL=https://foodecosys-rslvevea.manus.space/api/trpc
GOOGLE_MAPS_API_KEY=YOUR_API_KEY
FIREBASE_PROJECT_ID=your_project_id
```

### 5. Run App

```bash
flutter run
```

---

## Modular Architecture Benefits

✅ **Scalable** - Easy to add new features  
✅ **Maintainable** - Clear separation of concerns  
✅ **Testable** - Each module can be tested independently  
✅ **Reusable** - Services and models can be shared  
✅ **Performance** - Optimized state management with Provider  

---

**End of Flutter Rider App Documentation**
