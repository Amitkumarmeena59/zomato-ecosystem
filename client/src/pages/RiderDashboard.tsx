import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { MapPin, Power, CheckCircle, TrendingUp, LogOut, Navigation, Phone, MessageCircle, Clock, AlertCircle } from "lucide-react";
import { MapView } from "@/components/Map";

interface Order {
  id: number;
  restaurantName: string;
  restaurantAddress: string;
  customerName: string;
  customerAddress: string;
  distance: number;
  estimatedTime: number;
  amount: number;
  status: string;
  pickupLat?: number;
  pickupLng?: number;
  deliveryLat?: number;
  deliveryLng?: number;
}

export default function RiderDashboard() {
  const { user, logout } = useAuth();
  const [dutyActive, setDutyActive] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeDeliveries, setActiveDeliveries] = useState<Order[]>([]);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const mapRef = useRef<any>(null);
  const directionsServiceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);

  // Mutations
  const toggleDutyMutation = trpc.riders.toggleDuty.useMutation();
  const updateLocationMutation = trpc.riders.updateLocation.useMutation();

  // Initialize map
  const handleMapReady = (map: any) => {
    mapRef.current = map;
    directionsServiceRef.current = new (window as any).google.maps.DirectionsService();
    directionsRendererRef.current = new (window as any).google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: false,
    });

    // Add current location marker
    if (location) {
      new (window as any).google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: "Your Location",
        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      });

      map.setCenter({ lat: location.lat, lng: location.lng });
      map.setZoom(15);
    }
  };

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(newLocation);

        // Update location on server
        if (dutyActive) {
          updateLocationMutation.mutate({
            latitude: newLocation.lat,
            longitude: newLocation.lng,
          });
        }

        // Update map center
        if (mapRef.current) {
          mapRef.current.setCenter(newLocation);
        }
      });
    }

    // Simulate available orders
    setAvailableOrders([
      {
        id: 1001,
        restaurantName: "Taj Express",
        restaurantAddress: "123 Main St, Bharatpur",
        customerName: "Rajesh Kumar",
        customerAddress: "456 Park Ave, Bharatpur",
        distance: 2.5,
        estimatedTime: 15,
        amount: 250,
        status: "pending",
        pickupLat: 27.2183,
        pickupLng: 77.4944,
        deliveryLat: 27.2200,
        deliveryLng: 77.5000,
      },
      {
        id: 1002,
        restaurantName: "Dragon Palace",
        restaurantAddress: "789 Oak Rd, Bharatpur",
        customerName: "Priya Singh",
        customerAddress: "321 Elm St, Bharatpur",
        distance: 3.2,
        estimatedTime: 20,
        amount: 320,
        status: "pending",
        pickupLat: 27.2150,
        pickupLng: 77.4900,
        deliveryLat: 27.2250,
        deliveryLng: 77.5050,
      },
      {
        id: 1003,
        restaurantName: "Burger Barn",
        restaurantAddress: "555 Main Rd, Bharatpur",
        customerName: "Amit Patel",
        customerAddress: "999 Central Ave, Bharatpur",
        distance: 1.8,
        estimatedTime: 12,
        amount: 180,
        status: "pending",
        pickupLat: 27.2200,
        pickupLng: 77.4950,
        deliveryLat: 27.2180,
        deliveryLng: 77.5020,
      },
    ]);

    // Simulate active deliveries
    setActiveDeliveries([
      {
        id: 2001,
        restaurantName: "Test Restaurant",
        restaurantAddress: "100 Food St, Bharatpur",
        customerName: "Vikram Sharma",
        customerAddress: "888 Delivery Lane, Bharatpur",
        distance: 1.2,
        estimatedTime: 8,
        amount: 280,
        status: "on_the_way",
        pickupLat: 27.2190,
        pickupLng: 77.4960,
        deliveryLat: 27.2210,
        deliveryLng: 77.5010,
      },
    ]);
  }, [dutyActive]);

  const handleToggleDuty = async () => {
    try {
      await toggleDutyMutation.mutateAsync({
        isActive: !dutyActive,
      });
      setDutyActive(!dutyActive);
    } catch (error) {
      alert("Failed to toggle duty");
    }
  };

  const handleAcceptOrder = (order: Order) => {
    setSelectedOrder(order);
    setActiveDeliveries([...activeDeliveries, { ...order, status: "accepted" }]);
    setAvailableOrders(availableOrders.filter((o) => o.id !== order.id));
    showRoute(order);
  };

  const showRoute = (order: Order) => {
    if (!directionsServiceRef.current || !mapRef.current || !location) return;

    directionsServiceRef.current.route(
      {
        origin: { lat: location.lat, lng: location.lng },
        destination: { lat: order.pickupLat || 0, lng: order.pickupLng || 0 },
        waypoints: [{ location: { lat: order.deliveryLat || 0, lng: order.deliveryLng || 0 } }],
        travelMode: (window as any).google.maps.TravelMode.DRIVING,
      },
      (result: any, status: any) => {
        if (status === (window as any).google.maps.DirectionsStatus.OK) {
          directionsRendererRef.current.setDirections(result);
        }
      }
    );
  };

  const handleMarkDelivered = (orderId: number) => {
    setActiveDeliveries(activeDeliveries.filter((o) => o.id !== orderId));
    setSelectedOrder(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 shadow-lg sticky top-0 z-20">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Navigation className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Rider Dashboard</h1>
              <p className="text-xs text-orange-100">Real-time Delivery Tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${dutyActive ? "bg-green-400 text-green-900" : "bg-red-400 text-red-900"}`}>
              <div className={`w-2 h-2 rounded-full ${dutyActive ? "bg-green-900" : "bg-red-900"}`}></div>
              {dutyActive ? "Online" : "Offline"}
            </div>
            <Button
              onClick={() => logout()}
              variant="ghost"
              className="text-white hover:bg-orange-700"
              size="sm"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Full Screen Map */}
        <div className="flex-1 rounded-lg overflow-hidden shadow-lg border-2 border-orange-500">
          <MapView onMapReady={handleMapReady} className="w-full h-full" />
        </div>

        {/* Right Sidebar - Orders & Info */}
        <div className="w-96 flex flex-col gap-4 overflow-y-auto">
          {/* Duty Toggle Card */}
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600">Duty Status</p>
                <p className={`text-2xl font-bold ${dutyActive ? "text-green-600" : "text-red-600"}`}>
                  {dutyActive ? "🟢 Online" : "🔴 Offline"}
                </p>
              </div>
              <Button
                onClick={handleToggleDuty}
                className={`px-6 py-4 text-base font-bold flex items-center gap-2 ${
                  dutyActive
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
                disabled={toggleDutyMutation.isPending}
              >
                <Power className="w-5 h-5" />
                {dutyActive ? "Go Offline" : "Go Online"}
              </Button>
            </div>
            {location && (
              <div className="text-xs text-gray-600 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </div>
            )}
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 bg-blue-50 border-blue-200">
              <p className="text-xs text-gray-600 mb-1">Total Earnings</p>
              <p className="text-xl font-bold text-blue-600">₹2,450</p>
            </Card>
            <Card className="p-3 bg-purple-50 border-purple-200">
              <p className="text-xs text-gray-600 mb-1">Deliveries</p>
              <p className="text-xl font-bold text-purple-600">12</p>
            </Card>
          </div>

          {/* Active Delivery Details */}
          {selectedOrder && (
            <Card className="p-4 bg-green-50 border-2 border-green-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-green-900">Active Delivery</h3>
                <span className="text-xs bg-green-200 text-green-900 px-2 py-1 rounded-full font-semibold">On the way</span>
              </div>
              <div className="space-y-2 text-sm mb-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Pickup: {selectedOrder.restaurantName}</p>
                    <p className="text-xs text-gray-600">{selectedOrder.restaurantAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Delivery: {selectedOrder.customerName}</p>
                    <p className="text-xs text-gray-600">{selectedOrder.customerAddress}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
                <div className="bg-white p-2 rounded">
                  <p className="text-gray-600">Distance</p>
                  <p className="font-bold text-orange-600">{selectedOrder.distance} km</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-gray-600">ETA</p>
                  <p className="font-bold text-blue-600">{selectedOrder.estimatedTime} min</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-gray-600">Amount</p>
                  <p className="font-bold text-green-600">₹{selectedOrder.amount}</p>
                </div>
              </div>
              <Button
                onClick={() => handleMarkDelivered(selectedOrder.id)}
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Mark as Delivered
              </Button>
            </Card>
          )}

          {/* Available Orders */}
          {dutyActive && availableOrders.length > 0 && (
            <div>
              <h3 className="font-bold text-white mb-2">Available Orders ({availableOrders.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableOrders.map((order) => (
                  <Card key={order.id} className="p-3 bg-white border-l-4 border-orange-500 hover:shadow-md transition cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-sm">Order #{order.id}</p>
                        <p className="text-xs text-gray-600">{order.restaurantName}</p>
                      </div>
                      <p className="font-bold text-orange-600">₹{order.amount}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {order.distance} km
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {order.estimatedTime} min
                      </span>
                    </div>
                    <Button
                      onClick={() => handleAcceptOrder(order)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs py-1 flex items-center justify-center gap-1"
                    >
                      <Navigation className="w-3 h-3" />
                      Accept & Navigate
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Orders Message */}
          {dutyActive && availableOrders.length === 0 && activeDeliveries.length === 0 && (
            <Card className="p-6 text-center bg-blue-50 border-blue-200">
              <AlertCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No orders available right now</p>
              <p className="text-xs text-gray-500 mt-1">Stay online to receive new orders</p>
            </Card>
          )}

          {!dutyActive && (
            <Card className="p-6 text-center bg-red-50 border-red-200">
              <Power className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-red-900">You are offline</p>
              <p className="text-xs text-gray-600 mt-1">Go online to accept orders</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
