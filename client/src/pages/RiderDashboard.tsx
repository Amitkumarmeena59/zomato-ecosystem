import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { MapPin, Power, CheckCircle, TrendingUp, LogOut, Navigation, Phone, MessageCircle, Clock, AlertCircle, Menu, HelpCircle, Bell, ShoppingBag, Home, MoreVertical } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("map");
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
    }

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(newLocation);
        map.setCenter(newLocation);
      });
    }
  };

  const handleToggleDuty = async () => {
    try {
      await toggleDutyMutation.mutateAsync({ isActive: !dutyActive });
      setDutyActive(!dutyActive);
    } catch (error) {
      alert("Failed to toggle duty");
    }
  };

  const handleAcceptOrder = async (order: Order) => {
    try {
      // Update order status to accepted
      setActiveDeliveries([...activeDeliveries, order]);
      setAvailableOrders(availableOrders.filter((o) => o.id !== order.id));
    } catch (error) {
      alert("Failed to accept order");
    }
  };

  const handleMarkDelivered = async (order: Order) => {
    try {
      // Update order status to delivered
      setActiveDeliveries(activeDeliveries.filter((o) => o.id !== order.id));
    } catch (error) {
      alert("Failed to mark as delivered");
    }
  };

  // Mock data for demonstration
  useEffect(() => {
    setAvailableOrders([
      {
        id: 1,
        restaurantName: "Taj Express",
        restaurantAddress: "123 Main St",
        customerName: "Rajesh Kumar",
        customerAddress: "456 Oak Ave",
        distance: 2.5,
        estimatedTime: 15,
        amount: 250,
        status: "pending",
      },
      {
        id: 2,
        restaurantName: "Dragon Palace",
        restaurantAddress: "789 Elm St",
        customerName: "Priya Singh",
        customerAddress: "321 Maple Dr",
        distance: 3.2,
        estimatedTime: 20,
        amount: 320,
        status: "pending",
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || "R"}
            </div>
            <div>
              <p className="text-sm font-semibold">{user?.name || "Rider"}</p>
              <p className="text-xs text-gray-500">ID: #RD{user?.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <HelpCircle className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Offline/Online Toggle */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between bg-gradient-to-r from-gray-100 to-gray-50 p-3 rounded-full">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${dutyActive ? "bg-green-500" : "bg-gray-400"}`}></div>
              <span className="font-semibold text-sm">{dutyActive ? "Online" : "Offline"}</span>
            </div>
            <button
              onClick={handleToggleDuty}
              className={`px-6 py-2 rounded-full font-semibold text-sm transition ${
                dutyActive
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
              disabled={toggleDutyMutation.isPending}
            >
              {toggleDutyMutation.isPending ? "..." : dutyActive ? "Go Offline" : "Go Online"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {dutyActive ? (
          <>
            {/* Map Section */}
            <Card className="p-0 overflow-hidden h-64 border-0 shadow-md">
              <MapView className="w-full h-full" />
            </Card>

            {/* Gig Details Section */}
            <Card className="p-4 bg-black text-white rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm">
                  9
                </div>
                <h2 className="text-lg font-bold">Gig details</h2>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm">Book gigs to deliver orders</p>
                <Button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 rounded-full">
                  Book Gigs
                </Button>
              </div>
            </Card>

            {/* Today's Progress Section */}
            <Card className="p-4 bg-black text-white rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6" />
                <h2 className="text-lg font-bold">Today's progress</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-green-400">₹{activeDeliveries.length * 50}</p>
                  <p className="text-xs text-gray-400 mt-1">Earnings →</p>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <p className="text-2xl font-bold">{activeDeliveries.length}</p>
                  <p className="text-xs text-gray-400 mt-1">Trips →</p>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <p className="text-2xl font-bold">00:45 hrs</p>
                  <p className="text-xs text-gray-400 mt-1">Time on orders →</p>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <p className="text-2xl font-bold">{activeDeliveries.length}</p>
                  <p className="text-xs text-gray-400 mt-1">Gigs History →</p>
                </div>
              </div>
            </Card>

            {/* Blue Partner Section */}
            <Card className="p-4 bg-black text-white rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                <h2 className="text-lg font-bold">Blue Partner</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-900 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold">{activeDeliveries.length}</p>
                  <p className="text-xs text-gray-400 mt-1">Perfect Orders</p>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-gray-400 mt-1">Total Issues</p>
                </div>
              </div>
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white border border-gray-700">
                View full report →
              </Button>
            </Card>

            {/* Active Deliveries */}
            {activeDeliveries.length > 0 && (
              <Card className="p-4">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-orange-500" />
                  Active Deliveries ({activeDeliveries.length})
                </h3>
                <div className="space-y-3">
                  {activeDeliveries.map((order) => (
                    <Card key={order.id} className="p-3 border-l-4 border-orange-500">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-sm">{order.restaurantName}</p>
                          <p className="text-xs text-gray-600">→ {order.customerName}</p>
                        </div>
                        <span className="text-sm font-bold text-orange-600">₹{order.amount}</span>
                      </div>
                      <div className="flex gap-2 text-xs text-gray-600 mb-3">
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
                        onClick={() => handleMarkDelivered(order)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white text-xs"
                        size="sm"
                      >
                        Mark as Delivered
                      </Button>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {/* Available Orders */}
            <Card className="p-4">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-500" />
                Available Orders ({availableOrders.length})
              </h3>
              <div className="space-y-3">
                {availableOrders.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No orders available</p>
                ) : (
                  availableOrders.map((order) => (
                    <Card key={order.id} className="p-3 border-l-4 border-blue-500">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-sm">{order.restaurantName}</p>
                          <p className="text-xs text-gray-600">→ {order.customerName}</p>
                        </div>
                        <span className="text-sm font-bold text-blue-600">₹{order.amount}</span>
                      </div>
                      <div className="flex gap-2 text-xs text-gray-600 mb-3">
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
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs"
                        size="sm"
                      >
                        Accept Order
                      </Button>
                    </Card>
                  ))
                )}
              </div>
            </Card>
          </>
        ) : (
          <Card className="p-8 text-center">
            <Power className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">You're Offline</h3>
            <p className="text-gray-600 mb-6">Go online to start accepting orders</p>
            <Button
              onClick={handleToggleDuty}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8"
            >
              Go Online
            </Button>
          </Card>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around">
        <button className="flex-1 py-3 flex flex-col items-center gap-1 text-gray-600 hover:text-orange-600 border-b-2 border-transparent hover:border-orange-600">
          <Home className="w-5 h-5" />
          <span className="text-xs font-semibold">Feed</span>
        </button>
        <button className="flex-1 py-3 flex flex-col items-center gap-1 text-gray-600 hover:text-orange-600 border-b-2 border-transparent hover:border-orange-600">
          <ShoppingBag className="w-5 h-5" />
          <span className="text-xs font-semibold">Pocket</span>
        </button>
        <button className="flex-1 py-3 flex flex-col items-center gap-1 text-orange-600 border-b-2 border-orange-600">
          <Navigation className="w-5 h-5" />
          <span className="text-xs font-semibold">Gigs</span>
        </button>
        <button className="flex-1 py-3 flex flex-col items-center gap-1 text-gray-600 hover:text-orange-600 border-b-2 border-transparent hover:border-orange-600">
          <ShoppingBag className="w-5 h-5" />
          <span className="text-xs font-semibold">Bazaar</span>
        </button>
        <button className="flex-1 py-3 flex flex-col items-center gap-1 text-gray-600 hover:text-orange-600 border-b-2 border-transparent hover:border-orange-600 relative">
          <Bell className="w-5 h-5" />
          <span className="text-xs font-semibold">Updates</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </div>
  );
}
