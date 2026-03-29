import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, TrendingUp, LogOut, MapPin, Navigation, Clock } from "lucide-react";
import { MapView } from "@/components/Map";

export default function RestaurantDashboard() {
  const { user, logout } = useAuth();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showRiderTracking, setShowRiderTracking] = useState(false);
  const mapRef = useRef<any>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "Main Course",
    isVegetarian: false,
  });

  // Fetch restaurant orders
  const { data: orders = [], refetch: refetchOrders } = trpc.orders.getMyOrders.useQuery();

  // Fetch menu items (placeholder - would need restaurant ID)
  const { data: menuItems = [] } = trpc.menu.getByRestaurant.useQuery({ restaurantId: 1 });

  // Mutations
  const createMenuMutation = trpc.menu.create.useMutation();
  const updateOrderMutation = trpc.orders.updateStatus.useMutation();

  const handleMapReady = (map: any) => {
    mapRef.current = map;
    // Add rider marker
    if (selectedOrder) {
      new (window as any).google.maps.Marker({
        position: { lat: 27.2183, lng: 77.4944 },
        map: map,
        title: "Rider Location",
        icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
      });
      map.setCenter({ lat: 27.2183, lng: 77.4944 });
      map.setZoom(14);
    }
  };

  const handleAddMenuItem = async () => {
    if (!newItem.name || !newItem.price) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await createMenuMutation.mutateAsync({
        restaurantId: 1,
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price) as any,
        category: newItem.category,
        isVegetarian: newItem.isVegetarian,
      });

      setNewItem({
        name: "",
        description: "",
        price: "",
        category: "Main Course",
        isVegetarian: false,
      });
      setShowAddMenu(false);
      alert("Menu item added successfully!");
    } catch (error) {
      alert("Failed to add menu item");
    }
  };

  const handleAcceptOrder = async (orderId: number) => {
    try {
      await updateOrderMutation.mutateAsync({
        orderId,
        status: "confirmed",
      });
      refetchOrders();
      alert("Order accepted!");
    } catch (error) {
      alert("Failed to accept order");
    }
  };

  const handleRejectOrder = async (orderId: number) => {
    try {
      await updateOrderMutation.mutateAsync({
        orderId,
        status: "cancelled",
      });
      refetchOrders();
      alert("Order rejected!");
    } catch (error) {
      alert("Failed to reject order");
    }
  };

  const handleMarkReady = async (orderId: number) => {
    try {
      await updateOrderMutation.mutateAsync({
        orderId,
        status: "ready",
      });
      refetchOrders();
      alert("Order marked as ready!");
    } catch (error) {
      alert("Failed to mark order as ready");
    }
  };

  const totalEarnings = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount as any), 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const readyOrders = orders.filter((o) => o.status === "ready").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-orange-600">Restaurant Dashboard</h1>
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Earnings</p>
                <p className="text-3xl font-bold text-orange-600">₹{totalEarnings.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-orange-200" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Orders</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingOrders}</p>
              </div>
              <div className="text-4xl text-yellow-200">⏳</div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Ready for Pickup</p>
                <p className="text-3xl font-bold text-green-600">{readyOrders}</p>
              </div>
              <div className="text-4xl text-green-200">✓</div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Management */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Menu Items</h2>
                <Button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              {showAddMenu && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                  <Input
                    placeholder="Item name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                  <Input
                    placeholder="Description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  />
                  <Input
                    placeholder="Price"
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  />
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option>Main Course</option>
                    <option>Appetizer</option>
                    <option>Dessert</option>
                    <option>Beverage</option>
                  </select>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newItem.isVegetarian}
                      onChange={(e) => setNewItem({ ...newItem, isVegetarian: e.target.checked })}
                    />
                    <span className="text-sm">Vegetarian</span>
                  </label>
                  <Button
                    onClick={handleAddMenuItem}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={createMenuMutation.isPending}
                  >
                    {createMenuMutation.isPending ? "Adding..." : "Add Item"}
                  </Button>
                </div>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {menuItems.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No menu items yet</p>
                ) : (
                  menuItems.map((item: any) => (
                    <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-sm">{item.name}</h4>
                        <span className="text-orange-600 font-bold">₹{item.price}</span>
                      </div>
                      <p className="text-xs text-gray-600">{item.category}</p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" className="flex-1 h-7">
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 h-7">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Orders */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Recent Orders</h2>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {orders.map((order) => (
                    <Card key={order.id} className="p-4 border">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold">Order #{order.orderId}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">₹{order.totalAmount}</p>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            order.status?.toString() === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status?.toString() === "confirmed"
                              ? "bg-blue-100 text-blue-800"
                              : order.status?.toString() === "ready"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {order.status?.toString().replace(/_/g, " ").toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        Delivery: {order.deliveryAddress}
                      </p>

                      {order.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAcceptOrder(order.id)}
                            className="flex-1 bg-green-500 hover:bg-green-600 flex items-center justify-center gap-2"
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleRejectOrder(order.id)}
                            variant="outline"
                            className="flex-1 flex items-center justify-center gap-2"
                            size="sm"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {order.status === "confirmed" && (
                        <div className="space-y-2">
                          <Button
                            onClick={() => handleMarkReady(order.id)}
                            className="w-full bg-orange-500 hover:bg-orange-600"
                            size="sm"
                          >
                            Mark as Ready
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowRiderTracking(true);
                            }}
                            className="w-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center gap-2"
                            size="sm"
                          >
                            <MapPin className="w-4 h-4" />
                            Track Rider
                          </Button>
                        </div>
                      )}

                      {order.status === "ready" && (
                        <Button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowRiderTracking(true);
                          }}
                          className="w-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center gap-2"
                          size="sm"
                        >
                          <MapPin className="w-4 h-4" />
                          Track Rider
                        </Button>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Rider Tracking Modal */}
        {showRiderTracking && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-96 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Rider Tracking</h3>
                  <p className="text-sm text-orange-100">Order #{selectedOrder.orderId}</p>
                </div>
                <Button
                  onClick={() => setShowRiderTracking(false)}
                  variant="ghost"
                  className="text-white hover:bg-orange-700"
                >
                  ✕
                </Button>
              </div>
              <div className="flex gap-4 p-4">
                <div className="flex-1 rounded-lg overflow-hidden h-64 border-2 border-orange-200">
                  <MapView onMapReady={handleMapReady} className="w-full h-full" />
                </div>
                <div className="w-64 space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <p className="text-xs text-gray-600 mb-1">Rider Status</p>
                    <p className="font-bold text-blue-600">🟢 On the Way</p>
                    <p className="text-xs text-gray-600 mt-1">ETA: 8 minutes</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                    <p className="text-xs text-gray-600 mb-1">Distance</p>
                    <p className="font-bold text-green-600">1.2 km away</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500">
                    <p className="text-xs text-gray-600 mb-1">Rider</p>
                    <p className="font-bold text-purple-600">Rajesh Kumar</p>
                    <p className="text-xs text-gray-600 mt-1">Rating: 4.8/5</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
                    <p className="text-xs text-gray-600 mb-1">Phone</p>
                    <p className="font-bold text-yellow-600">+91 98765 43210</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
