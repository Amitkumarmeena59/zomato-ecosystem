import { useParams } from "wouter";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Phone, MessageCircle, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function OrderTracking() {
  const { orderId } = useParams();
  const [refreshInterval, setRefreshInterval] = useState(3000);

  // Fetch order details
  const { data: order, isLoading } = trpc.orders.getById.useQuery(
    { orderId: orderId || "" } as any,
    { enabled: !!orderId, refetchInterval: refreshInterval }
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-purple-100 text-purple-800";
      case "ready":
        return "bg-indigo-100 text-indigo-800";
      case "picked_up":
        return "bg-orange-100 text-orange-800";
      case "on_the_way":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, " ").toUpperCase();
  };

  const statusSteps = [
    { key: "pending", label: "Order Placed" },
    { key: "confirmed", label: "Confirmed" },
    { key: "preparing", label: "Preparing" },
    { key: "ready", label: "Ready" },
    { key: "picked_up", label: "Picked Up" },
    { key: "on_the_way", label: "On the Way" },
    { key: "delivered", label: "Delivered" },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order?.status);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
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
          <h1 className="text-xl font-bold">Order #{order.orderId}</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card className="p-6">
              <div className="mb-6">
                <div className={`inline-block px-4 py-2 rounded-full font-semibold ${getStatusColor(order.status || '')}`}>
                  {getStatusLabel(order.status || '')}
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-4">
                {statusSteps.map((step, index) => (
                  <div key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                          index <= currentStepIndex
                            ? "bg-orange-500 text-white"
                            : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </div>
                      {index < statusSteps.length - 1 && (
                        <div
                          className={`w-1 h-12 ${
                            index < currentStepIndex ? "bg-orange-500" : "bg-gray-300"
                          }`}
                        ></div>
                      )}
                    </div>
                    <div className="pt-1">
                      <p className={`font-semibold ${index <= currentStepIndex ? "text-gray-900" : "text-gray-500"}`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Order Details */}
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Order Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-semibold">{order.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-semibold capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status</span>
                  <span className="font-semibold capitalize">{order.paymentStatus}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-bold text-lg text-orange-600">₹{order.totalAmount}</span>
                </div>
              </div>
            </Card>

            {/* Items */}
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Items</h2>
              <div className="space-y-3">
                {order.items && typeof order.items === 'string'
                  ? JSON.parse(order.items).map((item: any, index: number) => (
                      <div key={index} className="flex justify-between pb-3 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">Item #{item.itemId}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))
                  : null}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Delivery Address */}
            <Card className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-1">Delivery Address</h3>
                  <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                </div>
              </div>
            </Card>

            {/* Estimated Time */}
            <Card className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <Clock className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-1">Estimated Delivery</h3>
                  <p className="text-sm text-gray-600">
                    {order.estimatedDeliveryTime
                      ? new Date(order.estimatedDeliveryTime).toLocaleTimeString()
                      : "Calculating..."}
                  </p>
                </div>
              </div>
            </Card>

            {/* Support */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">Need Help?</h3>
              <div className="space-y-2">
                <Button className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600">
                  <MessageCircle className="w-4 h-4" />
                  Chat Support
                </Button>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Call Support
                </Button>
              </div>
            </Card>

            {/* WhatsApp Support */}
            <a
              href={`https://wa.me/919876543210?text=I%20need%20help%20with%20my%20order%20${order.orderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg flex items-center justify-center z-50 transition-transform hover:scale-110"
              title="Chat with support on WhatsApp"
            >
              <MessageCircle className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
