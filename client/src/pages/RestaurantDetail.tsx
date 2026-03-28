import { useParams } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Leaf, Plus, Minus, ShoppingCart, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface CartItem {
  itemId: number;
  name: string;
  price: number;
  quantity: number;
}

export default function RestaurantDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const restaurantId = parseInt(id || "0");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Fetch restaurant details
  const { data: restaurant, isLoading: restaurantLoading } = trpc.restaurants.getById.useQuery(
    { id: restaurantId },
    { enabled: restaurantId > 0 }
  );

  // Fetch menu items
  const { data: menuItems = [], isLoading: menuLoading } = trpc.menu.getByRestaurant.useQuery(
    { restaurantId },
    { enabled: restaurantId > 0 }
  );

  // Create order mutation
  const createOrderMutation = trpc.orders.create.useMutation();

  const addToCart = (item: any) => {
    const existing = cart.find((c) => c.itemId === item.id);
    if (existing) {
      setCart(
        cart.map((c) =>
          c.itemId === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart([
        ...cart,
        {
          itemId: item.id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: 1,
        },
      ]);
    }
  };

  const removeFromCart = (itemId: number) => {
    setCart(cart.filter((c) => c.itemId !== itemId));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(
        cart.map((c) =>
          c.itemId === itemId ? { ...c, quantity } : c
        )
      );
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = cartTotal * 0.05;
  const deliveryFee = 30;
  const total = cartTotal + tax + deliveryFee;

  const handleCheckout = async () => {
    if (!deliveryAddress.trim()) {
      alert("Please enter delivery address");
      return;
    }

    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      await createOrderMutation.mutateAsync({
        restaurantId,
        deliveryAddress,
        deliveryLatitude: 19.0760,
        deliveryLongitude: 72.8777,
        items: cart.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: total as any,
        paymentMethod: "cod",
        specialInstructions,
      });

      alert("Order placed successfully!");
      setCart([]);
      setShowCheckout(false);
      setDeliveryAddress("");
      setSpecialInstructions("");
    } catch (error) {
      alert("Failed to place order");
    }
  };

  if (restaurantLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Restaurant not found</p>
          <a href="/" className="text-orange-600 hover:underline">
            Back to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-orange-600 hover:text-orange-700">
            <ArrowLeft className="w-5 h-5" />
            Back
          </a>
          <h1 className="text-xl font-bold">{restaurant.name}</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold mb-2">{restaurant.name}</h2>
              <p className="text-gray-600 mb-4">{restaurant.description}</p>
              <p className="text-sm text-gray-500">{restaurant.cuisineType}</p>
            </div>

            {menuLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-200 h-32 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : menuItems.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500">No menu items available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {menuItems.map((item: any) => (
                  <Card key={item.id} className="p-4 flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        {item.isVegetarian && (
                          <Leaf className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <p className="font-bold text-orange-600">₹{item.price}</p>
                    </div>
                    <Button
                      onClick={() => addToCart(item)}
                      className="bg-orange-500 hover:bg-orange-600"
                      size="sm"
                    >
                      Add
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-5 h-5" />
                <h3 className="font-bold text-lg">Your Cart</h3>
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.itemId} className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-sm text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">₹{item.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-3 space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (5%)</span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span>₹{deliveryFee}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total</span>
                      <span className="text-orange-600">₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowCheckout(true)}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                  >
                    Proceed to Checkout
                  </Button>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Delivery Details</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Delivery Address</label>
                <Input
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your address"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Special Instructions</label>
                <Input
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special requests?"
                  className="w-full"
                />
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium mb-2">Order Summary</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-1">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCheckout(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCheckout}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? "Placing..." : "Place Order"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
