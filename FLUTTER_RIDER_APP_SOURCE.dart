// ============================================================================
// BHARATPUR BITES - FLUTTER RIDER APP - COMPLETE SOURCE CODE
// ============================================================================
// This file contains all the essential files for the Flutter Rider App
// Copy each section to its respective file location in your Flutter project

// ============================================================================
// FILE 1: lib/main.dart
// ============================================================================

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'config/theme.dart';
import 'config/socket_config.dart';
import 'services/notification_service.dart';
import 'providers/auth_provider.dart';
import 'providers/order_provider.dart';
import 'providers/location_provider.dart';
import 'providers/earnings_provider.dart';
import 'screens/common/splash_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/home/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Load environment variables
  await dotenv.load(fileName: ".env");
  
  // Initialize Firebase
  await Firebase.initializeApp();
  
  // Initialize Hive for local storage
  await Hive.initFlutter();
  
  // Initialize notifications
  await NotificationService.initialize();
  
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
        debugShowCheckedModeBanner: false,
        home: Consumer<AuthProvider>(
          builder: (context, authProvider, _) {
            if (authProvider.isLoading) {
              return const SplashScreen();
            }
            
            if (authProvider.isAuthenticated) {
              return const HomeScreen();
            }
            
            return const LoginScreen();
          },
        ),
      ),
    );
  }
}

// ============================================================================
// FILE 2: lib/config/theme.dart
// ============================================================================

import 'package:flutter/material.dart';

class AppTheme {
  // Brand Colors
  static const Color primaryRed = Color(0xFFE63946);
  static const Color darkRed = Color(0xFFA4161A);
  static const Color lightRed = Color(0xFFF77F88);
  
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);
  static const Color darkGray = Color(0xFF333333);
  static const Color lightGray = Color(0xFFF5F5F5);
  static const Color borderGray = Color(0xFFE0E0E0);
  
  // Status Colors
  static const Color successGreen = Color(0xFF10B981);
  static const Color warningOrange = Color(0xFFF59E0B);
  static const Color errorRed = Color(0xFFEF4444);
  static const Color infoBlue = Color(0xFF3B82F6);
  
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryRed,
        brightness: Brightness.light,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: primaryRed,
        foregroundColor: white,
        elevation: 0,
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: primaryRed,
        foregroundColor: white,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryRed,
          foregroundColor: white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
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

// ============================================================================
// FILE 3: lib/config/api_config.dart
// ============================================================================

import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiConfig {
  static String get baseUrl {
    return dotenv.env['API_BASE_URL'] ?? 'http://localhost:3000/api/trpc';
  }

  static String get socketUrl {
    return dotenv.env['SOCKET_URL'] ?? 'http://localhost:3000';
  }

  static String get googleMapsApiKey {
    return dotenv.env['GOOGLE_MAPS_API_KEY'] ?? '';
  }

  static String get firebaseProjectId {
    return dotenv.env['FIREBASE_PROJECT_ID'] ?? '';
  }

  // Endpoints
  static const String loginEndpoint = 'riders.login';
  static const String verifyOtpEndpoint = 'riders.verifyOtp';
  static const String getAvailableOrdersEndpoint = 'riders.getAvailableOrders';
  static const String acceptOrderEndpoint = 'riders.acceptOrder';
  static const String getOrderDetailsEndpoint = 'riders.getOrderDetails';
  static const String markPickedUpEndpoint = 'riders.markPickedUp';
  static const String markDeliveredEndpoint = 'riders.markDelivered';
  static const String verifyDeliveryOtpEndpoint = 'riders.verifyDeliveryOtp';
  static const String getEarningsEndpoint = 'riders.getEarnings';
  static const String getRiderProfileEndpoint = 'riders.getProfile';
  static const String updateRiderProfileEndpoint = 'riders.updateProfile';
}

// ============================================================================
// FILE 4: lib/services/api_service.dart
// ============================================================================

import 'package:http/http.dart' as http;
import 'dart:convert';
import '../config/api_config.dart';
import 'storage_service.dart';

class ApiService {
  static final StorageService _storage = StorageService();

  static Future<dynamic> get(String endpoint, [Map<String, dynamic>? params]) async {
    try {
      String url = '${ApiConfig.baseUrl}/$endpoint';
      
      if (params != null) {
        final queryString = Uri(queryParameters: params).query;
        url = '$url?$queryString';
      }

      final token = await _storage.getToken();
      
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['result']['data'];
      } else if (response.statusCode == 401) {
        await _storage.clearToken();
        throw Exception('Unauthorized');
      } else {
        throw Exception('Error: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('API Error: $e');
    }
  }

  static Future<dynamic> post(String endpoint, Map<String, dynamic> body) async {
    try {
      final url = '${ApiConfig.baseUrl}/$endpoint';
      final token = await _storage.getToken();

      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode(body),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['result']['data'];
      } else if (response.statusCode == 401) {
        await _storage.clearToken();
        throw Exception('Unauthorized');
      } else {
        throw Exception('Error: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('API Error: $e');
    }
  }
}

// ============================================================================
// FILE 5: lib/services/location_service.dart
// ============================================================================

import 'package:geolocator/geolocator.dart';

class LocationService {
  static final LocationService _instance = LocationService._internal();
  
  factory LocationService() {
    return _instance;
  }
  
  LocationService._internal();

  Future<bool> requestPermission() async {
    final status = await Geolocator.requestLocationPermission();
    return status == LocationPermission.whileInUse ||
        status == LocationPermission.always;
  }

  Future<Position?> getCurrentLocation() async {
    try {
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );
      return position;
    } catch (e) {
      print('Error getting location: $e');
      return null;
    }
  }

  Stream<Position> getLocationUpdates({
    int intervalInSeconds = 5,
  }) {
    return Geolocator.getPositionStream(
      locationSettings: LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10,
        timeLimit: Duration(seconds: intervalInSeconds),
      ),
    );
  }

  Future<double> calculateDistance(
    double startLat,
    double startLng,
    double endLat,
    double endLng,
  ) async {
    return Geolocator.distanceBetween(
      startLat,
      startLng,
      endLat,
      endLng,
    ) / 1000;
  }
}

// ============================================================================
// FILE 6: lib/services/socket_service.dart
// ============================================================================

import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../config/api_config.dart';

class SocketService {
  static final SocketService _instance = SocketService._internal();
  late IO.Socket socket;
  bool _isConnected = false;
  
  factory SocketService() {
    return _instance;
  }
  
  SocketService._internal();

  bool get isConnected => _isConnected;

  void connect(String riderId) {
    socket = IO.io(
      ApiConfig.socketUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .build(),
    );

    socket.connect();

    socket.on('connect', (_) {
      print('✅ Connected to server');
      _isConnected = true;
      socket.emit('rider-online', {'riderId': riderId});
    });

    socket.on('disconnect', (_) {
      print('❌ Disconnected from server');
      _isConnected = false;
    });

    socket.on('error', (error) {
      print('⚠️ Socket error: $error');
    });
  }

  void sendLocation(String riderId, double latitude, double longitude) {
    if (_isConnected) {
      socket.emit('rider-location', {
        'riderId': riderId,
        'latitude': latitude,
        'longitude': longitude,
        'timestamp': DateTime.now().toIso8601String(),
      });
    }
  }

  void onNewOrder(Function(Map<String, dynamic>) callback) {
    socket.on('new-order', (data) {
      callback(data);
    });
  }

  void onOrderUpdate(Function(Map<String, dynamic>) callback) {
    socket.on('order-update', (data) {
      callback(data);
    });
  }

  void acceptOrder(int orderId) {
    socket.emit('accept-order', {'orderId': orderId});
  }

  void disconnect() {
    socket.disconnect();
    _isConnected = false;
  }
}

// ============================================================================
// FILE 7: lib/services/notification_service.dart
// ============================================================================

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  static Future<void> initialize() async {
    // Request permission
    await _firebaseMessaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carryForward: true,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    // Get FCM token
    final token = await _firebaseMessaging.getToken();
    print('FCM Token: $token');

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
        print('Message also contained a notification: ${message.notification}');
        _showLocalNotification(
          message.notification!.title ?? 'New Order',
          message.notification!.body ?? 'You have a new order',
        );
      }
    });

    // Handle background messages
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  }

  static Future<void> _firebaseMessagingBackgroundHandler(
      RemoteMessage message) async {
    print('Handling a background message: ${message.messageId}');
  }

  static Future<void> _showLocalNotification(String title, String body) async {
    const AndroidNotificationDetails androidDetails =
        AndroidNotificationDetails(
      'bharatpur_bites',
      'Bharatpur Bites',
      channelDescription: 'Notifications for Bharatpur Bites Rider App',
      importance: Importance.max,
      priority: Priority.high,
    );

    const NotificationDetails platformChannelSpecifics = NotificationDetails(
      android: androidDetails,
    );

    await _localNotifications.show(
      0,
      title,
      body,
      platformChannelSpecifics,
    );
  }

  static Future<String?> getFCMToken() async {
    return await _firebaseMessaging.getToken();
  }
}

// ============================================================================
// FILE 8: lib/services/storage_service.dart
// ============================================================================

import 'package:shared_preferences/shared_preferences.dart';
import 'package:hive_flutter/hive_flutter.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  late SharedPreferences _prefs;
  late Box _hiveBox;

  factory StorageService() {
    return _instance;
  }

  StorageService._internal();

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    _hiveBox = await Hive.openBox('app_cache');
  }

  // Token management
  Future<void> saveToken(String token) async {
    await _prefs.setString('auth_token', token);
  }

  Future<String?> getToken() async {
    return _prefs.getString('auth_token');
  }

  Future<void> clearToken() async {
    await _prefs.remove('auth_token');
  }

  // User data
  Future<void> saveRiderId(int riderId) async {
    await _prefs.setInt('rider_id', riderId);
  }

  Future<int?> getRiderId() async {
    return _prefs.getInt('rider_id');
  }

  // Cache data
  Future<void> cacheData(String key, dynamic data) async {
    await _hiveBox.put(key, data);
  }

  Future<dynamic> getCachedData(String key) async {
    return _hiveBox.get(key);
  }

  Future<void> clearCache() async {
    await _hiveBox.clear();
  }
}

// ============================================================================
// FILE 9: lib/models/order_model.dart
// ============================================================================

class RiderOrder {
  final int id;
  final String orderNumber;
  final int customerId;
  final int restaurantId;
  final String status;
  final double totalAmount;
  final double deliveryFee;
  final String deliveryAddress;
  final double deliveryLatitude;
  final double deliveryLongitude;
  final String restaurantName;
  final double restaurantLatitude;
  final double restaurantLongitude;
  final String customerName;
  final String customerPhone;
  final List<OrderItem> items;
  final DateTime createdAt;
  final DateTime? pickedUpAt;
  final DateTime? deliveredAt;

  RiderOrder({
    required this.id,
    required this.orderNumber,
    required this.customerId,
    required this.restaurantId,
    required this.status,
    required this.totalAmount,
    required this.deliveryFee,
    required this.deliveryAddress,
    required this.deliveryLatitude,
    required this.deliveryLongitude,
    required this.restaurantName,
    required this.restaurantLatitude,
    required this.restaurantLongitude,
    required this.customerName,
    required this.customerPhone,
    required this.items,
    required this.createdAt,
    this.pickedUpAt,
    this.deliveredAt,
  });

  factory RiderOrder.fromJson(Map<String, dynamic> json) {
    return RiderOrder(
      id: json['id'],
      orderNumber: json['orderNumber'],
      customerId: json['customerId'],
      restaurantId: json['restaurantId'],
      status: json['status'],
      totalAmount: (json['totalAmount'] as num).toDouble(),
      deliveryFee: (json['deliveryFee'] as num).toDouble(),
      deliveryAddress: json['deliveryAddress'],
      deliveryLatitude: (json['deliveryLatitude'] as num).toDouble(),
      deliveryLongitude: (json['deliveryLongitude'] as num).toDouble(),
      restaurantName: json['restaurantName'],
      restaurantLatitude: (json['restaurantLatitude'] as num).toDouble(),
      restaurantLongitude: (json['restaurantLongitude'] as num).toDouble(),
      customerName: json['customerName'],
      customerPhone: json['customerPhone'],
      items: (json['items'] as List)
          .map((item) => OrderItem.fromJson(item))
          .toList(),
      createdAt: DateTime.parse(json['createdAt']),
      pickedUpAt: json['pickedUpAt'] != null
          ? DateTime.parse(json['pickedUpAt'])
          : null,
      deliveredAt: json['deliveredAt'] != null
          ? DateTime.parse(json['deliveredAt'])
          : null,
    );
  }

  RiderOrder copyWith({
    String? status,
    DateTime? pickedUpAt,
    DateTime? deliveredAt,
  }) {
    return RiderOrder(
      id: id,
      orderNumber: orderNumber,
      customerId: customerId,
      restaurantId: restaurantId,
      status: status ?? this.status,
      totalAmount: totalAmount,
      deliveryFee: deliveryFee,
      deliveryAddress: deliveryAddress,
      deliveryLatitude: deliveryLatitude,
      deliveryLongitude: deliveryLongitude,
      restaurantName: restaurantName,
      restaurantLatitude: restaurantLatitude,
      restaurantLongitude: restaurantLongitude,
      customerName: customerName,
      customerPhone: customerPhone,
      items: items,
      createdAt: createdAt,
      pickedUpAt: pickedUpAt ?? this.pickedUpAt,
      deliveredAt: deliveredAt ?? this.deliveredAt,
    );
  }
}

class OrderItem {
  final String name;
  final int quantity;
  final double price;

  OrderItem({
    required this.name,
    required this.quantity,
    required this.price,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      name: json['name'],
      quantity: json['quantity'],
      price: (json['price'] as num).toDouble(),
    );
  }
}

// ============================================================================
// FILE 10: lib/providers/auth_provider.dart
// ============================================================================

import 'package:flutter/material.dart';
import '../models/order_model.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

class AuthProvider extends ChangeNotifier {
  bool _isLoading = false;
  bool _isAuthenticated = false;
  String? _error;
  RiderUser? _user;
  final StorageService _storage = StorageService();

  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  String? get error => _error;
  RiderUser? get user => _user;

  Future<void> checkAuthStatus() async {
    _isLoading = true;
    notifyListeners();

    try {
      final token = await _storage.getToken();
      if (token != null) {
        _isAuthenticated = true;
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> loginWithPhone(String phone) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await ApiService.post('riders.sendOtp', {'phone': phone});
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> verifyOtp(String phone, String otp) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.post(
        'riders.verifyOtp',
        {'phone': phone, 'otp': otp},
      );

      final token = response['token'];
      await _storage.saveToken(token);
      await _storage.saveRiderId(response['riderId']);

      _isAuthenticated = true;
      _user = RiderUser.fromJson(response);

      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _storage.clearToken();
    _isAuthenticated = false;
    _user = null;
    notifyListeners();
  }
}

class RiderUser {
  final int id;
  final String name;
  final String phone;
  final String email;
  final String vehicleType;
  final String vehicleNumber;
  final double rating;

  RiderUser({
    required this.id,
    required this.name,
    required this.phone,
    required this.email,
    required this.vehicleType,
    required this.vehicleNumber,
    required this.rating,
  });

  factory RiderUser.fromJson(Map<String, dynamic> json) {
    return RiderUser(
      id: json['id'],
      name: json['name'],
      phone: json['phone'],
      email: json['email'],
      vehicleType: json['vehicleType'],
      vehicleNumber: json['vehicleNumber'],
      rating: (json['rating'] as num).toDouble(),
    );
  }
}

// ============================================================================
// FILE 11: lib/providers/order_provider.dart
// ============================================================================

import 'package:flutter/material.dart';
import '../models/order_model.dart';
import '../services/api_service.dart';

class OrderProvider extends ChangeNotifier {
  List<RiderOrder> _availableOrders = [];
  RiderOrder? _currentOrder;
  bool _isLoading = false;
  String? _error;

  List<RiderOrder> get availableOrders => _availableOrders;
  RiderOrder? get currentOrder => _currentOrder;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchAvailableOrders() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get('riders.getAvailableOrders');
      _availableOrders = (response as List)
          .map((order) => RiderOrder.fromJson(order))
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
        'riders.acceptOrder',
        {'orderId': orderId},
      );

      final response = await ApiService.get(
        'riders.getOrderDetails',
        {'orderId': orderId},
      );
      _currentOrder = RiderOrder.fromJson(response);

      _availableOrders.removeWhere((order) => order.id == orderId);

      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }

  Future<bool> markPickedUp(int orderId) async {
    try {
      await ApiService.post(
        'riders.markPickedUp',
        {'orderId': orderId},
      );

      if (_currentOrder?.id == orderId) {
        _currentOrder = _currentOrder?.copyWith(status: 'picked_up');
      }

      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }

  Future<bool> markDelivered(int orderId, String deliveryOtp) async {
    try {
      await ApiService.post(
        'riders.markDelivered',
        {'orderId': orderId, 'deliveryOtp': deliveryOtp},
      );

      if (_currentOrder?.id == orderId) {
        _currentOrder = null;
        await fetchAvailableOrders();
      }

      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    }
  }
}

// ============================================================================
// FILE 12: lib/providers/location_provider.dart
// ============================================================================

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../services/location_service.dart';
import '../services/socket_service.dart';

class LocationProvider extends ChangeNotifier {
  Position? _currentPosition;
  bool _isTracking = false;
  final LocationService _locationService = LocationService();
  final SocketService _socketService = SocketService();

  Position? get currentPosition => _currentPosition;
  bool get isTracking => _isTracking;

  Future<void> startTracking(String riderId) async {
    final hasPermission = await _locationService.requestPermission();
    if (!hasPermission) return;

    _isTracking = true;
    notifyListeners();

    _locationService.getLocationUpdates().listen((position) {
      _currentPosition = position;
      _socketService.sendLocation(
        riderId,
        position.latitude,
        position.longitude,
      );
      notifyListeners();
    });
  }

  void stopTracking() {
    _isTracking = false;
    notifyListeners();
  }
}

// ============================================================================
// FILE 13: lib/providers/earnings_provider.dart
// ============================================================================

import 'package:flutter/material.dart';
import '../services/api_service.dart';

class EarningsProvider extends ChangeNotifier {
  double _todayEarnings = 0;
  double _weeklyEarnings = 0;
  double _monthlyEarnings = 0;
  double _totalEarnings = 0;
  int _totalDeliveries = 0;
  bool _isLoading = false;

  double get todayEarnings => _todayEarnings;
  double get weeklyEarnings => _weeklyEarnings;
  double get monthlyEarnings => _monthlyEarnings;
  double get totalEarnings => _totalEarnings;
  int get totalDeliveries => _totalDeliveries;
  bool get isLoading => _isLoading;

  double get averagePerDelivery =>
      _totalDeliveries > 0 ? _totalEarnings / _totalDeliveries : 0;

  Future<void> fetchEarnings() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiService.get('riders.getEarnings');
      _todayEarnings = (response['todayEarnings'] as num).toDouble();
      _weeklyEarnings = (response['weeklyEarnings'] as num).toDouble();
      _monthlyEarnings = (response['monthlyEarnings'] as num).toDouble();
      _totalEarnings = (response['totalEarnings'] as num).toDouble();
      _totalDeliveries = response['totalDeliveries'];
    } catch (e) {
      print('Error fetching earnings: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}

// ============================================================================
// FILE 14: lib/screens/auth/login_screen.dart
// ============================================================================

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import 'otp_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  void _handleLogin() async {
    final phone = _phoneController.text.trim();
    if (phone.isEmpty || phone.length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid phone number')),
      );
      return;
    }

    setState(() => _isLoading = true);

    final success = await context.read<AuthProvider>().loginWithPhone(phone);

    setState(() => _isLoading = false);

    if (success) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => OtpScreen(phone: phone),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            context.read<AuthProvider>().error ?? 'Login failed',
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: AppTheme.primaryRed,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Center(
                  child: Text(
                    'BB',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 40,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 32),

              // Title
              const Text(
                'Bharatpur Bites',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Rider App',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 48),

              // Phone Input
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  hintText: 'Enter your phone number',
                  prefixIcon: const Icon(Icons.phone),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Login Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleLogin,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor:
                                AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text('Send OTP'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ============================================================================
// FILE 15: lib/screens/auth/otp_screen.dart
// ============================================================================

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../home/home_screen.dart';

class OtpScreen extends StatefulWidget {
  final String phone;

  const OtpScreen({Key? key, required this.phone}) : super(key: key);

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _otpController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  void _handleVerifyOtp() async {
    final otp = _otpController.text.trim();
    if (otp.isEmpty || otp.length != 4) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid 4-digit OTP')),
      );
      return;
    }

    setState(() => _isLoading = true);

    final success =
        await context.read<AuthProvider>().verifyOtp(widget.phone, otp);

    setState(() => _isLoading = false);

    if (success) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const HomeScreen()),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            context.read<AuthProvider>().error ?? 'OTP verification failed',
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verify OTP')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                'Enter the OTP sent to',
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 8),
              Text(
                widget.phone,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 48),

              // OTP Input
              TextField(
                controller: _otpController,
                keyboardType: TextInputType.number,
                maxLength: 4,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 32, letterSpacing: 8),
                decoration: InputDecoration(
                  hintText: '0000',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Verify Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleVerifyOtp,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor:
                                AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text('Verify OTP'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ============================================================================
// FILE 16: lib/screens/home/home_screen.dart
// ============================================================================

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/order_provider.dart';
import '../../providers/location_provider.dart';
import '../../services/socket_service.dart';
import '../../widgets/order_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  late SocketService _socketService;

  @override
  void initState() {
    super.initState();
    _initializeServices();
  }

  void _initializeServices() {
    _socketService = SocketService();
    final riderId = context.read<AuthProvider>().user?.id.toString() ?? '';

    // Connect socket
    _socketService.connect(riderId);

    // Start location tracking
    context.read<LocationProvider>().startTracking(riderId);

    // Fetch orders
    context.read<OrderProvider>().fetchAvailableOrders();

    // Listen for new orders
    _socketService.onNewOrder((data) {
      context.read<OrderProvider>().fetchAvailableOrders();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('New order available!')),
      );
    });
  }

  @override
  void dispose() {
    _socketService.disconnect();
    context.read<LocationProvider>().stopTracking();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bharatpur Bites Rider'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              context.read<AuthProvider>().logout();
              Navigator.pushReplacementNamed(context, '/login');
            },
          ),
        ],
      ),
      body: _buildBody(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.location_on),
            label: 'Tracking',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.money),
            label: 'Earnings',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  Widget _buildBody() {
    switch (_selectedIndex) {
      case 0:
        return _buildOrdersTab();
      case 1:
        return _buildTrackingTab();
      case 2:
        return _buildEarningsTab();
      case 3:
        return _buildProfileTab();
      default:
        return _buildOrdersTab();
    }
  }

  Widget _buildOrdersTab() {
    return Consumer<OrderProvider>(
      builder: (context, orderProvider, _) {
        if (orderProvider.isLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        if (orderProvider.availableOrders.isEmpty) {
          return const Center(
            child: Text('No available orders'),
          );
        }

        return RefreshIndicator(
          onRefresh: () => orderProvider.fetchAvailableOrders(),
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: orderProvider.availableOrders.length,
            itemBuilder: (context, index) {
              final order = orderProvider.availableOrders[index];
              return OrderCard(
                order: order,
                onAccept: () {
                  orderProvider.acceptOrder(order.id);
                },
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildTrackingTab() {
    return const Center(
      child: Text('Tracking Tab'),
    );
  }

  Widget _buildEarningsTab() {
    return const Center(
      child: Text('Earnings Tab'),
    );
  }

  Widget _buildProfileTab() {
    return const Center(
      child: Text('Profile Tab'),
    );
  }
}

// ============================================================================
// FILE 17: lib/widgets/order_card.dart
// ============================================================================

import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../models/order_model.dart';

class OrderCard extends StatelessWidget {
  final RiderOrder order;
  final VoidCallback onAccept;

  const OrderCard({
    Key? key,
    required this.order,
    required this.onAccept,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order Number and Amount
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Order #${order.orderNumber}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '₹${order.totalAmount}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryRed,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Restaurant and Customer
            Text(
              'From: ${order.restaurantName}',
              style: const TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 4),
            Text(
              'To: ${order.customerName}',
              style: const TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 12),

            // Items
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppTheme.lightGray,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: order.items
                    .map((item) => Text(
                          '${item.quantity}x ${item.name}',
                          style: const TextStyle(fontSize: 12),
                        ))
                    .toList(),
              ),
            ),
            const SizedBox(height: 12),

            // Accept Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onAccept,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.successGreen,
                ),
                child: const Text('Accept Order'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ============================================================================
// FILE 18: .env (Environment Variables)
// ============================================================================

/*
API_BASE_URL=https://your-backend-url.com/api/trpc
SOCKET_URL=https://your-backend-url.com
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
*/

// ============================================================================
// FILE 19: pubspec.yaml (Dependencies)
// ============================================================================

/*
name: bharatpur_bites_rider
description: Bharatpur Bites Rider Delivery App
publish_to: 'none'

version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  provider: ^6.0.0
  http: ^1.1.0
  socket_io_client: ^2.0.0
  google_maps_flutter: ^2.5.0
  location: ^5.0.0
  geolocator: ^9.0.0
  shared_preferences: ^2.2.0
  hive: ^2.2.0
  hive_flutter: ^1.1.0
  firebase_core: ^2.24.0
  firebase_messaging: ^14.6.0
  flutter_local_notifications: ^15.1.0
  image_picker: ^1.0.0
  intl: ^0.19.0
  logger: ^2.0.0
  flutter_dotenv: ^5.1.0
  cupertino_icons: ^1.0.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
*/

// ============================================================================
// END OF FLUTTER RIDER APP SOURCE CODE
// ============================================================================
