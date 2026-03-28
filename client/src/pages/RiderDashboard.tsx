import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { MapPin, Power, CheckCircle, TrendingUp, LogOut, Navigation } from "lucide-react";

export default function RiderDashboard() {
  const { user, logout } = useAuth();
  const [dutyActive, setDutyActive] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Mutations
  const toggleDutyMutation = trpc.riders.toggleDuty.useMutation();
  const updateLocationMutation = trpc.riders.updateLocation.useMutation();

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
      });
    }
  }, [dutyActive]);

  const handleToggleDuty = async () => {
    try {
      await toggleDutyMutation.mutateAsync({
        isActive: !dutyActive,
      });
      setDutyActive(!dutyActive);
      alert(dutyActive ? "Duty turned off" : "Duty turned on");
    } catch (error) {
      alert("Failed to toggle duty");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-orange-600">Rider Dashboard</h1>
          <Button
            onClick={() => logout()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Duty Toggle */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-orange-50 to-yellow-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Duty Status</h2>
              <p className={`text-lg font-semibold ${dutyActive ? "text-green-600" : "text-red-600"}`}>
                {dutyActive ? "🟢 Online" : "🔴 Offline"}
              </p>
              {location && (
                <p className="text-sm text-gray-600 mt-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              )}
            </div>
            <Button
              onClick={handleToggleDuty}
              className={`px-8 py-6 text-lg font-bold flex items-center gap-2 ${
                dutyActive
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
              disabled={toggleDutyMutation.isPending}
            >
              <Power className="w-6 h-6" />
              {dutyActive ? "Go Offline" : "Go Online"}
            </Button>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Earnings</p>
                <p className="text-3xl font-bold text-orange-600">₹2,450</p>
              </div>
              <TrendingUp className="w-10 h-10 text-orange-200" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Deliveries Today</p>
                <p className="text-3xl font-bold text-blue-600">12</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Rating</p>
                <p className="text-3xl font-bold text-yellow-600">4.8/5</p>
              </div>
              <div className="text-4xl">⭐</div>
            </div>
          </Card>
        </div>

        {/* Available Orders */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">Available Orders</h2>

          {!dutyActive ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Go online to see available orders</p>
              <Button
                onClick={handleToggleDuty}
                className="bg-green-500 hover:bg-green-600"
              >
                Go Online
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4 border">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold">Order #{1000 + i}</h3>
                      <p className="text-sm text-gray-600">
                        <MapPin className="inline w-4 h-4 mr-1" />
                        2.5 km away
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">₹{150 + i * 50}</p>
                      <p className="text-sm text-gray-600">15 min delivery</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded mb-3">
                    <p className="text-sm font-medium mb-1">Pickup: Restaurant Name</p>
                    <p className="text-xs text-gray-600">123 Main St, Mumbai</p>
                    <p className="text-sm font-medium mt-2 mb-1">Delivery: Customer Address</p>
                    <p className="text-xs text-gray-600">456 Park Ave, Mumbai</p>
                  </div>

                  <Button className="w-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center gap-2">
                    <Navigation className="w-4 h-4" />
                    Accept & Navigate
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Active Deliveries */}
        <Card className="p-6 mt-8">
          <h2 className="text-lg font-bold mb-4">Active Deliveries</h2>

          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="p-4 border bg-green-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold">Order #{2000 + i}</h3>
                    <p className="text-sm text-gray-600">
                      <MapPin className="inline w-4 h-4 mr-1" />
                      1.2 km away
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">₹{200 + i * 50}</p>
                    <p className="text-sm text-green-600">On the way</p>
                  </div>
                </div>

                <div className="bg-white p-3 rounded mb-3 border">
                  <p className="text-sm font-medium mb-1">Delivery to: Customer</p>
                  <p className="text-xs text-gray-600">789 Oak Rd, Mumbai</p>
                </div>

                <Button className="w-full bg-green-500 hover:bg-green-600 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Mark as Delivered
                </Button>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
