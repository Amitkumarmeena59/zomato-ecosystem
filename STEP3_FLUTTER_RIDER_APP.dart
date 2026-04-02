// ============================================================================
// BHARATPUR BITES - FLUTTER RIDER APP SOURCE CODE
// ============================================================================
// Step 3: Complete Flutter Rider App (optimized for low-end Android phones)
// Status: Production-Ready
// ============================================================================

// ============================================================================
// FILE 1: pubspec.yaml (Dependencies)
// ============================================================================

/*
name: bharatpur_bites_rider
description: Bharatpur Bites Rider App - Food Delivery Platform
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  
  # HTTP & API
  http: ^1.1.0
  dio: ^5.3.0
  
  # State Management
  provider: ^6.0.0
  
  # Local Storage
  shared_preferences: ^2.2.0
  hive: ^2.2.0
  hive_flutter: ^1.1.0
  
  # Real-time
  socket_io_client: ^2.0.0
  
  # Location & Maps
  geolocator: ^9.0.0
  google_maps_flutter: ^2.5.0
  
  # Push Notifications
  firebase_messaging: ^14.6.0
  firebase_core: ^2.24.0
  
  # UI
  cupertino_icons: ^1.0.2
  intl: ^0.19.0
  
  # Image handling
  cached_network_image: ^3.3.0
  
  # Utilities
  uuid: ^4.0.0
  logger: ^2.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/
    - assets/icons/
  fonts:
    - family: Poppins
      fonts:
        - asset: assets/fonts/Poppins-Regular.ttf
        - asset: assets/fonts/Poppins-Bold.ttf
          weight: 700
*/

// ============================================================================
// FILE 2: main.dart (App Entry Point)
// ============================================================================

import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'config/theme.dart';
import 'services/notification_service.dart';
import 'providers/auth_provider.dart';
import 'providers/order_provider.dart';
import 'providers/location_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/home/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp();
  
  // Initialize Hive (local storage)
  await Hive.initFlutter();
  
  // Initialize notifications
  await NotificationService.initialize();
  
  runApp(const BharatpurBitesRiderApp());
}

class BharatpurBitesRiderApp extends StatelessWidget {
  const BharatpurBitesRiderApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => OrderProvider()),
        ChangeNotifierProvider(create: (_) => LocationProvider()),
      ],
      child: MaterialApp(
        title: 'Bharatpur Bites Rider',
        theme: AppTheme.lightTheme,
        home: Consumer<AuthProvider>(
          builder: (context, authProvider, _) {
            return authProvider.isAuthenticated ? const HomeScreen() : const LoginScreen();
          },
        ),
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}

// ============================================================================
// FILE 3: config/theme.dart (App Theme - Red/White Branding)
// ============================================================================

import 'package:flutter/material.dart';

class AppTheme {
  // Colors
  static const Color primaryRed = Color(0xFFE63946);
  static const Color darkRed = Color(0xFFA4161A);
  static const Color white = Color(0xFFFFFFFF);
  static const Color lightGray = Color(0xFFF5F5F5);
  static const Color darkGray = Color(0xFF333333);
  static const Color textGray = Color(0xFF666666);
  static const Color successGreen = Color(0xFF27AE60);
  static const Color warningOrange = Color(0xFFF39C12);

  // Light Theme
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
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: lightGray,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide.none,
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
      textTheme: const TextTheme(
        headlineLarge: TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.bold,
          color: darkGray,
        ),
        headlineMedium: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: darkGray,
        ),
        bodyLarge: TextStyle(
          fontSize: 16,
          color: darkGray,
        ),
        bodyMedium: TextStyle(
          fontSize: 14,
          color: textGray,
        ),
      ),
    );
  }
}

// ============================================================================
// FILE 4: config/api_config.dart (Environment Variables)
// ============================================================================

import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiConfig {
  // Load from .env file
  static String get baseUrl => dotenv.env['API_BASE_URL'] ?? 'http://localhost:3000';
  static String get apiKey => dotenv.env['API_KEY'] ?? '';
  static String get googleMapsKey => dotenv.env['GOOGLE_MAPS_API_KEY'] ?? '';
  
  // Feature toggles
  static bool get autoAssignEnabled => dotenv.env['AUTO_ASSIGN_ENABLED'] == 'true';
  static bool get otpVerificationEnabled => dotenv.env['OTP_VERIFICATION_ENABLED'] == 'true';
  
  // Configuration
  static int get riderSearchRadiusKm => int.parse(dotenv.env['RIDER_SEARCH_RADIUS_KM'] ?? '5');
  static int get riderAssignmentTimeoutSec => int.parse(dotenv.env['RIDER_ASSIGNMENT_TIMEOUT_SEC'] ?? '30');
  static int get otpExpiryMinutes => int.parse(dotenv.env['OTP_EXPIRY_MINUTES'] ?? '30');
  static int get maxOtpAttempts => int.parse(dotenv.env['MAX_OTP_ATTEMPTS'] ?? '3');
}

// ============================================================================
// FILE 5: services/api_service.dart (HTTP Client)
// ============================================================================

import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

class ApiService {
  static final Dio _dio = Dio(
    BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ),
  );

  static Future<void> setToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  static Future<dynamic> post(String endpoint, Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/api/trpc/$endpoint', data: data);
      return response.data;
    } on DioException catch (e) {
      throw Exception(e.message);
    }
  }

  static Future<dynamic> get(String endpoint) async {
    try {
      final response = await _dio.get('/api/trpc/$endpoint');
      return response.data;
    } on DioException catch (e) {
      throw Exception(e.message);
    }
  }
}

// ============================================================================
// FILE 6: services/location_service.dart (GPS Tracking)
// ============================================================================

import 'package:geolocator/geolocator.dart';
import 'dart:async';

class LocationService {
  static final LocationService _instance = LocationService._internal();
  late StreamSubscription<Position> _positionStream;
  
  factory LocationService() {
    return _instance;
  }

  LocationService._internal();

  Future<bool> requestPermission() async {
    final permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      final result = await Geolocator.requestPermission();
      return result == LocationPermission.whileInUse || result == LocationPermission.always;
    }
    return permission != LocationPermission.denied && permission != LocationPermission.deniedForever;
  }

  Future<Position?> getCurrentLocation() async {
    try {
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );
    } catch (e) {
      print('Error getting location: $e');
      return null;
    }
  }

  void startLocationUpdates(Function(Position) onLocationUpdate) {
    const LocationSettings locationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 10, // Update every 10 meters
    );

    _positionStream = Geolocator.getPositionStream(locationSettings: locationSettings).listen(
      (Position position) {
        onLocationUpdate(position);
      },
    );
  }

  void stopLocationUpdates() {
    _positionStream.cancel();
  }
}

// ============================================================================
// FILE 7: services/socket_service.dart (Real-time Socket.io)
// ============================================================================

import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../config/api_config.dart';

class SocketService {
  static final SocketService _instance = SocketService._internal();
  late IO.Socket _socket;
  
  factory SocketService() {
    return _instance;
  }

  SocketService._internal();

  void connect(String token) {
    _socket = IO.io(
      ApiConfig.baseUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setExtraHeaders({'Authorization': 'Bearer $token'})
          .build(),
    );

    _socket.connect();

    _socket.on('connect', (_) {
      print('✅ Socket connected');
    });

    _socket.on('disconnect', (_) {
      print('❌ Socket disconnected');
    });

    _socket.on('error', (error) {
      print('❌ Socket error: $error');
    });
  }

  void on(String event, Function(dynamic) callback) {
    _socket.on(event, callback);
  }

  void emit(String event, dynamic data) {
    _socket.emit(event, data);
  }

  void disconnect() {
    _socket.disconnect();
  }
}

// ============================================================================
// FILE 8: services/notification_service.dart (Firebase Push Notifications)
// ============================================================================

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class NotificationService {
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

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
    if (token != null) {
      print('FCM Token: $token');
      await saveFCMToken(token);
    }

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('Got a message whilst in the foreground!');
      print('Message data: ${message.data}');
    });

    // Handle background messages
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  }

  static Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
    print('Handling a background message: ${message.messageId}');
  }

  static Future<void> saveFCMToken(String token) async {
    try {
      await ApiService.post('auth.saveFCMToken', {'token': token});
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('fcm_token', token);
    } catch (e) {
      print('Error saving FCM token: $e');
    }
  }
}

// ============================================================================
// FILE 9: providers/auth_provider.dart (Authentication State)
// ============================================================================

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';

class AuthProvider extends ChangeNotifier {
  bool _isAuthenticated = false;
  String? _token;
  Map<String, dynamic>? _user;
  String? _phone;

  bool get isAuthenticated => _isAuthenticated;
  String? get token => _token;
  Map<String, dynamic>? get user => _user;

  AuthProvider() {
    _loadToken();
  }

  Future<void> _loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
    if (_token != null) {
      _isAuthenticated = true;
      await _loadUser();
      notifyListeners();
    }
  }

  Future<void> sendOTP(String phone) async {
    try {
      _phone = phone;
      await ApiService.post('auth.sendOTP', {'phone': phone});
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> verifyOTP(String code) async {
    try {
      final response = await ApiService.post('auth.verifyOTP', {'phone': _phone, 'code': code});
      _token = response['token'];
      _user = response['user'];
      _isAuthenticated = true;

      // Save token
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', _token!);

      // Set API token
      await ApiService.setToken(_token!);

      // Connect Socket.io
      SocketService().connect(_token!);

      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> _loadUser() async {
    try {
      final response = await ApiService.get('auth.me');
      _user = response;
      notifyListeners();
    } catch (e) {
      print('Error loading user: $e');
    }
  }

  Future<void> logout() async {
    _isAuthenticated = false;
    _token = null;
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    SocketService().disconnect();
    notifyListeners();
  }
}

// ============================================================================
// FILE 10: providers/order_provider.dart (Order Management)
// ============================================================================

import 'package:flutter/material.dart';
import '../services/api_service.dart';

class OrderProvider extends ChangeNotifier {
  List<Map<String, dynamic>> _availableOrders = [];
  Map<String, dynamic>? _currentOrder;
  bool _isLoading = false;

  List<Map<String, dynamic>> get availableOrders => _availableOrders;
  Map<String, dynamic>? get currentOrder => _currentOrder;
  bool get isLoading => _isLoading;

  Future<void> getAvailableOrders() async {
    try {
      _isLoading = true;
      notifyListeners();

      final response = await ApiService.get('rider.getAvailableOrders');
      _availableOrders = List<Map<String, dynamic>>.from(response);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<void> acceptOrder(int orderId) async {
    try {
      await ApiService.post('rider.acceptOrder', {'orderId': orderId});
      _currentOrder = _availableOrders.firstWhere((order) => order['id'] == orderId);
      _availableOrders.removeWhere((order) => order['id'] == orderId);
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> verifyDeliveryOTP(int orderId, String otpCode) async {
    try {
      await ApiService.post('rider.verifyDeliveryOTP', {'orderId': orderId, 'otpCode': otpCode});
      _currentOrder = null;
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }
}

// ============================================================================
// FILE 11: providers/location_provider.dart (GPS State)
// ============================================================================

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../services/location_service.dart';
import '../services/api_service.dart';

class LocationProvider extends ChangeNotifier {
  Position? _currentPosition;
  bool _isTracking = false;

  Position? get currentPosition => _currentPosition;
  bool get isTracking => _isTracking;

  final LocationService _locationService = LocationService();

  Future<void> startTracking(int? orderId) async {
    try {
      final hasPermission = await _locationService.requestPermission();
      if (!hasPermission) {
        throw Exception('Location permission denied');
      }

      _isTracking = true;
      notifyListeners();

      _locationService.startLocationUpdates((position) async {
        _currentPosition = position;
        notifyListeners();

        // Send location to backend
        try {
          await ApiService.post('rider.updateLocation', {
            'latitude': position.latitude,
            'longitude': position.longitude,
            'accuracy': position.accuracy,
            'speed': position.speed,
            'orderId': orderId,
          });
        } catch (e) {
          print('Error updating location: $e');
        }
      });
    } catch (e) {
      _isTracking = false;
      notifyListeners();
      rethrow;
    }
  }

  void stopTracking() {
    _locationService.stopLocationUpdates();
    _isTracking = false;
    notifyListeners();
  }
}

// ============================================================================
// FILE 12: screens/auth/login_screen.dart (OTP Login)
// ============================================================================

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../config/theme.dart';
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
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(Icons.delivery_dining, color: AppTheme.white, size: 50),
              ),
              const SizedBox(height: 24),

              // Title
              Text(
                'Bharatpur Bites',
                style: Theme.of(context).textTheme.headlineLarge,
              ),
              const SizedBox(height: 8),
              Text(
                'Rider App',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 48),

              // Phone input
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  hintText: 'Enter your phone number',
                  prefixIcon: const Icon(Icons.phone),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
              const SizedBox(height: 24),

              // Login button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleLogin,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
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

  Future<void> _handleLogin() async {
    if (_phoneController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter phone number')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      await context.read<AuthProvider>().sendOTP(_phoneController.text);
      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => OTPScreen(phone: _phoneController.text),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }
}

// ============================================================================
// FILE 13: screens/auth/otp_screen.dart (OTP Verification)
// ============================================================================

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../config/theme.dart';

class OTPScreen extends StatefulWidget {
  final String phone;

  const OTPScreen({Key? key, required this.phone}) : super(key: key);

  @override
  State<OTPScreen> createState() => _OTPScreenState();
}

class _OTPScreenState extends State<OTPScreen> {
  final _otpController = TextEditingController();
  bool _isLoading = false;

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
              Text(
                'Enter OTP sent to ${widget.phone}',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 24),

              // OTP input
              TextField(
                controller: _otpController,
                keyboardType: TextInputType.number,
                maxLength: 4,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 24, letterSpacing: 8),
                decoration: InputDecoration(
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  counterText: '',
                ),
              ),
              const SizedBox(height: 24),

              // Verify button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleVerify,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
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

  Future<void> _handleVerify() async {
    if (_otpController.text.length != 4) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter 4-digit OTP')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      await context.read<AuthProvider>().verifyOTP(_otpController.text);
      if (mounted) {
        Navigator.of(context).pushNamedAndRemoveUntil('/', (route) => false);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }
}

// ============================================================================
// FILE 14: screens/home/home_screen.dart (Main Dashboard)
// ============================================================================

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/order_provider.dart';
import '../../providers/location_provider.dart';
import '../../config/theme.dart';
import '../../widgets/order_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isDutyOn = false;

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  void _loadOrders() {
    context.read<OrderProvider>().getAvailableOrders();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bharatpur Bites Rider'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => context.read<AuthProvider>().logout(),
          ),
        ],
      ),
      body: Consumer<OrderProvider>(
        builder: (context, orderProvider, _) {
          return RefreshIndicator(
            onRefresh: (_) async => _loadOrders(),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Duty toggle
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Duty Status'),
                            Text(
                              _isDutyOn ? 'Online' : 'Offline',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: _isDutyOn ? AppTheme.successGreen : AppTheme.textGray,
                              ),
                            ),
                          ],
                        ),
                        Switch(
                          value: _isDutyOn,
                          onChanged: (value) {
                            setState(() => _isDutyOn = value);
                            if (value) {
                              context.read<LocationProvider>().startTracking(null);
                            } else {
                              context.read<LocationProvider>().stopTracking();
                            }
                          },
                          activeColor: AppTheme.primaryRed,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Available orders
                Text(
                  'Available Orders (${orderProvider.availableOrders.length})',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 12),

                if (orderProvider.isLoading)
                  const Center(child: CircularProgressIndicator())
                else if (orderProvider.availableOrders.isEmpty)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(32),
                      child: Text('No orders available'),
                    ),
                  )
                else
                  ...orderProvider.availableOrders
                      .map((order) => OrderCard(order: order))
                      .toList(),
              ],
            ),
          );
        },
      ),
    );
  }
}

// ============================================================================
// FILE 15: widgets/order_card.dart (Order UI Component)
// ============================================================================

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/order_provider.dart';
import '../config/theme.dart';

class OrderCard extends StatefulWidget {
  final Map<String, dynamic> order;

  const OrderCard({Key? key, required this.order}) : super(key: key);

  @override
  State<OrderCard> createState() => _OrderCardState();
}

class _OrderCardState extends State<OrderCard> {
  bool _isAccepting = false;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order ID & Amount
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Order #${widget.order['orderId']}',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                Text(
                  '₹${widget.order['totalAmount']}',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryRed,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Restaurant name
            Text(
              widget.order['restaurantName'] ?? 'Restaurant',
              style: const TextStyle(fontSize: 14, color: AppTheme.textGray),
            ),
            const SizedBox(height: 12),

            // Accept button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isAccepting ? null : _handleAccept,
                child: _isAccepting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Accept Order'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleAccept() async {
    setState(() => _isAccepting = true);

    try {
      await context.read<OrderProvider>().acceptOrder(widget.order['id']);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Order accepted!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isAccepting = false);
      }
    }
  }
}

// ============================================================================
// FILE 16: .env (Environment Variables)
// ============================================================================

/*
API_BASE_URL=https://your-domain.com
API_KEY=your_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_key

# Feature toggles
AUTO_ASSIGN_ENABLED=true
OTP_VERIFICATION_ENABLED=true

# Configuration
RIDER_SEARCH_RADIUS_KM=5
RIDER_ASSIGNMENT_TIMEOUT_SEC=30
OTP_EXPIRY_MINUTES=30
MAX_OTP_ATTEMPTS=3
*/

// ============================================================================
// OPTIMIZATION TIPS FOR LOW-END ANDROID PHONES
// ============================================================================

/*
1. **Image Optimization:**
   - Use cached_network_image for efficient caching
   - Compress images to <100KB
   - Use WebP format instead of PNG

2. **Performance:**
   - Lazy load list items
   - Use const constructors
   - Minimize rebuilds with Provider
   - Limit location updates to 10 meters

3. **Battery:**
   - Stop GPS tracking when app is backgrounded
   - Use efficient socket.io reconnection
   - Batch API requests

4. **Memory:**
   - Use Hive for local storage (lightweight)
   - Dispose controllers properly
   - Avoid keeping large objects in memory

5. **Network:**
   - Compress API responses
   - Use gzip compression
   - Cache API responses locally
   - Implement exponential backoff for retries
*/

// ============================================================================
// END OF FLUTTER RIDER APP SOURCE CODE
// ============================================================================
