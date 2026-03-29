import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Trash2, Settings, LogOut, Zap, MapPin, Users } from "lucide-react";
import { MapView } from "@/components/Map";

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("restaurants");
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    cuisineType: "",
    address: "",
    phone: "",
  });

  // Fetch all restaurants
  const { data: restaurants = [], refetch: refetchRestaurants } = trpc.admin.getAllRestaurants.useQuery();

  // Fetch pending payouts
  const { data: payouts = [] } = trpc.admin.getPendingPayouts.useQuery();

  // Mutations
  const seedDummyRestaurantsMutation = trpc.admin.seedDummyRestaurants.useMutation();
  const seedDummyMenuMutation = trpc.admin.seedDummyMenuItems.useMutation();
  const updateCommissionMutation = trpc.admin.updateCommission.useMutation();
  const createPayoutMutation = trpc.admin.createPayout.useMutation();

  const handleSeedDummyRestaurants = async () => {
    try {
      const result = await seedDummyRestaurantsMutation.mutateAsync();
      alert(`Added ${result.count} dummy restaurants!`);
      refetchRestaurants();
    } catch (error) {
      alert("Failed to seed dummy restaurants");
    }
  };

  const handleSeedDummyMenu = async (restaurantId: number) => {
    try {
      const result = await seedDummyMenuMutation.mutateAsync({ restaurantId });
      alert(`Added ${result.count} menu items!`);
    } catch (error) {
      alert("Failed to seed menu items");
    }
  };

  const handleUpdateCommission = async (restaurantId: number, percentage: number) => {
    try {
      await updateCommissionMutation.mutateAsync({
        restaurantId,
        commissionPercentage: percentage,
      });
      alert("Commission updated!");
      refetchRestaurants();
    } catch (error) {
      alert("Failed to update commission");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-orange-600">Admin Panel</h1>
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
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab("restaurants")}
            className={`px-4 py-2 font-semibold border-b-2 whitespace-nowrap ${
              activeTab === "restaurants"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-600"
            }`}
          >
            Restaurants
          </button>
          <button
            onClick={() => setActiveTab("riders")}
            className={`px-4 py-2 font-semibold border-b-2 whitespace-nowrap ${
              activeTab === "riders"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-600"
            }`}
          >
            Riders Tracking
          </button>
          <button
            onClick={() => setActiveTab("payouts")}
            className={`px-4 py-2 font-semibold border-b-2 whitespace-nowrap ${
              activeTab === "payouts"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-600"
            }`}
          >
            Payouts
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 font-semibold border-b-2 whitespace-nowrap ${
              activeTab === "settings"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-600"
            }`}
          >
            Settings
          </button>
        </div>

        {/* Restaurants Tab */}
        {activeTab === "restaurants" && (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </h2>
              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={handleSeedDummyRestaurants}
                  className="bg-blue-500 hover:bg-blue-600"
                  disabled={seedDummyRestaurantsMutation.isPending}
                >
                  {seedDummyRestaurantsMutation.isPending ? "Seeding..." : "Seed Dummy Restaurants"}
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">All Restaurants ({restaurants.length})</h2>
                <Button
                  onClick={() => setShowAddRestaurant(!showAddRestaurant)}
                  className="bg-orange-500 hover:bg-orange-600"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Restaurant
                </Button>
              </div>

              {showAddRestaurant && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-3">
                  <Input
                    placeholder="Restaurant name"
                    value={newRestaurant.name}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                  />
                  <Input
                    placeholder="Cuisine type"
                    value={newRestaurant.cuisineType}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, cuisineType: e.target.value })}
                  />
                  <Input
                    placeholder="Address"
                    value={newRestaurant.address}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, address: e.target.value })}
                  />
                  <Input
                    placeholder="Phone"
                    value={newRestaurant.phone}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, phone: e.target.value })}
                  />
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">
                    Add Restaurant
                  </Button>
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {restaurants.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No restaurants yet</p>
                ) : (
                  restaurants.map((restaurant: any) => (
                    <Card key={restaurant.id} className="p-4 border">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold">{restaurant.name}</h3>
                          <p className="text-sm text-gray-600">{restaurant.cuisineType}</p>
                          <p className="text-xs text-gray-500 mt-1">{restaurant.address}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">Commission: {restaurant.commissionPercentage}%</p>
                          <p className="text-sm text-orange-600">Earnings: ₹{restaurant.totalEarnings}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button
                          onClick={() => handleSeedDummyMenu(restaurant.id)}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          Seed Menu
                        </Button>
                        <Button
                          onClick={() => {
                            const newCommission = prompt(
                              "Enter new commission percentage:",
                              restaurant.commissionPercentage.toString()
                            );
                            if (newCommission) {
                              handleUpdateCommission(restaurant.id, parseFloat(newCommission));
                            }
                          }}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Edit Commission
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Riders Tracking Tab */}
        {activeTab === "riders" && (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Live Riders Tracking
              </h2>
              <p className="text-sm text-gray-600">Real-time GPS tracking of all active delivery partners</p>
            </Card>

            <Card className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map */}
                <div className="lg:col-span-2 rounded-lg overflow-hidden h-96 border-2 border-green-200">
                  <MapView className="w-full h-full" />
                </div>

                {/* Riders List */}
                <div className="space-y-3">
                  <h3 className="font-bold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Active Riders (5)
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {[
                      { id: 1, name: "Rajesh Kumar", status: "On Delivery", distance: "1.2 km", rating: 4.8 },
                      { id: 2, name: "Priya Singh", status: "On Delivery", distance: "2.5 km", rating: 4.9 },
                      { id: 3, name: "Amit Patel", status: "Idle", distance: "0.5 km", rating: 4.7 },
                      { id: 4, name: "Neha Sharma", status: "On Delivery", distance: "3.1 km", rating: 4.6 },
                      { id: 5, name: "Vikram Singh", status: "Idle", distance: "1.8 km", rating: 4.8 },
                    ].map((rider) => (
                      <div key={rider.id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-green-500">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-sm">{rider.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded ${
                            rider.status === "On Delivery"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {rider.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">📍 {rider.distance} away</p>
                        <p className="text-xs text-gray-600">⭐ {rider.rating}/5</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Payouts Tab */}
        {activeTab === "payouts" && (
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-6">Pending Payouts</h2>

            <div className="space-y-3">
              {payouts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending payouts</p>
              ) : (
                payouts.map((payout: any) => (
                  <Card key={payout.id} className="p-4 border">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold">
                          {payout.userType === "restaurant" ? "Restaurant" : "Rider"} Payout
                        </h3>
                        <p className="text-sm text-gray-600">Account: {payout.bankAccount}</p>
                        <p className="text-xs text-gray-500">IFSC: {payout.ifscCode}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">₹{payout.amount}</p>
                        <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded font-semibold">
                          {payout.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1 bg-green-500 hover:bg-green-600" size="sm">
                        Process Payout
                      </Button>
                      <Button variant="outline" className="flex-1" size="sm">
                        Reject
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-6">System Settings</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Default Commission %</label>
                <Input type="number" placeholder="15" defaultValue="15" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Delivery Fee</label>
                <Input type="number" placeholder="30" defaultValue="30" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tax Rate %</label>
                <Input type="number" placeholder="5" defaultValue="5" />
              </div>

              <Button className="bg-orange-500 hover:bg-orange-600">
                Save Settings
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
