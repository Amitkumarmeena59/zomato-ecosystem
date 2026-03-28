# Zomato Ecosystem - Testing Guide

## Quick Start Testing

### Step 1: Access the Live Application
- **URL**: https://3000-iwu0r72frdiwbcdh5dygt-644907a2.sg1.manus.computer
- The application is already running and connected to the database

### Step 2: Seed Dummy Data (IMPORTANT - Do This First!)

1. **Login as Admin**
   - Click "Login with Manus" on the home page
   - You'll be redirected to Manus OAuth
   - After login, you should have admin access

2. **Navigate to Admin Panel**
   - Go to: `/admin-panel` in the URL bar
   - Or add a navigation link to the home page

3. **Seed Dummy Restaurants**
   - Click "Seed Dummy Restaurants" button
   - This creates 3 test restaurants:
     - Taj Express (Indian)
     - Dragon Palace (Chinese)
     - Burger Barn (American)

4. **Seed Menu Items**
   - For each restaurant, click "Seed Menu"
   - This adds sample menu items with prices

### Step 3: Test Customer Flow

1. **Home Page - Restaurant Discovery**
   - URL: `/`
   - You should see the 3 seeded restaurants
   - Try searching by name
   - Try the "Veg Only" filter (currently shows all restaurants)

2. **Restaurant Detail Page**
   - Click on any restaurant
   - URL: `/restaurant/1` (or 2, 3)
   - You should see menu items
   - Add items to cart (use +/- buttons)
   - View cart total with tax and delivery fee

3. **Checkout**
   - Click "Proceed to Checkout"
   - Enter delivery address (e.g., "123 Main St, Mumbai")
   - Add special instructions (optional)
   - Click "Place Order"
   - You should see success message

4. **Order Tracking**
   - After placing order, you'll see order ID
   - Navigate to `/order/ORD-XXXXX`
   - View order status progression
   - See delivery address and estimated time
   - Click WhatsApp button to chat with support

### Step 4: Test Restaurant Dashboard

1. **Navigate to Restaurant Dashboard**
   - URL: `/restaurant-dashboard`
   - You should see:
     - Total earnings
     - Pending orders count
     - Ready for pickup count

2. **View Orders**
   - Scroll down to see "Recent Orders"
   - Click "Accept" on pending orders
   - Click "Mark as Ready" on confirmed orders

3. **Manage Menu**
   - Click "Add" button in Menu Items section
   - Fill in:
     - Item name
     - Description
     - Price
     - Category
     - Check "Vegetarian" if applicable
   - Click "Add Item"

### Step 5: Test Rider Dashboard

1. **Navigate to Rider Dashboard**
   - URL: `/rider-dashboard`
   - You should see:
     - Duty status (currently offline)
     - Total earnings
     - Deliveries today
     - Rating

2. **Toggle Duty**
   - Click "Go Online" button
   - Button should change to "Go Offline"
   - Your location will be tracked (if geolocation enabled)

3. **View Available Orders**
   - After going online, you'll see "Available Orders"
   - Each order shows:
     - Order ID
     - Distance from current location
     - Delivery fee
     - Pickup and delivery addresses

4. **Accept Order**
   - Click "Accept & Navigate"
   - (In production, this would open Google Maps)

5. **Mark Delivered**
   - Scroll to "Active Deliveries"
   - Click "Mark as Delivered"

### Step 6: Test Admin Panel

1. **Navigate to Admin Panel**
   - URL: `/admin-panel`
   - Three tabs: Restaurants, Payouts, Settings

2. **Restaurants Tab**
   - View all seeded restaurants
   - Click "Seed Menu" to add items
   - Click "Edit Commission" to change commission %
   - Add new restaurant manually (form available)

3. **Payouts Tab**
   - View pending payouts
   - "Process Payout" and "Reject" buttons available
   - Shows bank account and IFSC code

4. **Settings Tab**
   - Configure:
     - Default Commission %
     - Delivery Fee
     - Tax Rate %
   - Click "Save Settings"

## Test Scenarios

### Scenario 1: Complete Order Flow
```
1. Login as Customer
2. Browse restaurants (should see 3 seeded restaurants)
3. Click on "Taj Express"
4. Add "Butter Chicken" and "Biryani" to cart
5. Click "Proceed to Checkout"
6. Enter address: "456 Park Ave, Mumbai"
7. Click "Place Order"
8. Note the order ID
9. Navigate to order tracking page
10. Verify order status shows "Pending"
```

### Scenario 2: Restaurant Order Management
```
1. Login as Restaurant Partner
2. Go to /restaurant-dashboard
3. View pending orders from Scenario 1
4. Click "Accept" on the order
5. Verify status changes to "Confirmed"
6. Click "Mark as Ready"
7. Verify status changes to "Ready"
```

### Scenario 3: Rider Delivery
```
1. Login as Rider
2. Go to /rider-dashboard
3. Click "Go Online"
4. View available orders
5. Click "Accept & Navigate"
6. Scroll to "Active Deliveries"
7. Click "Mark as Delivered"
8. Verify earnings updated
```

### Scenario 4: Admin Management
```
1. Login as Admin
2. Go to /admin-panel
3. Click "Seed Dummy Restaurants" (if not done)
4. For each restaurant, click "Seed Menu"
5. Click "Edit Commission" on a restaurant
6. Change commission from 15% to 20%
7. Verify change saved
```

## Expected Behavior

### ✅ Working Features
- [x] Restaurant list display
- [x] Restaurant detail with menu
- [x] Shopping cart add/remove items
- [x] Checkout with address entry
- [x] Order creation and ID generation
- [x] Order tracking page
- [x] Restaurant dashboard with orders
- [x] Rider duty toggle
- [x] Admin restaurant management
- [x] Dummy data seeding
- [x] WhatsApp support button

### ⚠️ Known Limitations
- Real-time updates require page refresh (WebSocket not yet implemented)
- Veg filter doesn't filter restaurants (would need menu data per restaurant)
- Payment gateway not integrated (COD only for testing)
- Google Maps navigation not integrated (buttons show placeholder)
- Rider available orders are mock data (not connected to backend)
- Push notifications not implemented

## Troubleshooting

### Issue: "No restaurants found" on home page
**Solution**: 
1. Go to `/admin-panel`
2. Click "Seed Dummy Restaurants"
3. Refresh home page

### Issue: Orders not showing in restaurant dashboard
**Solution**:
1. Verify you're logged in as a restaurant user
2. Check that orders were created for the correct restaurant
3. Refresh the page

### Issue: WhatsApp button not working
**Solution**:
1. This is expected - it opens WhatsApp Web
2. Update the phone number in the code to your business number
3. Message format: "I need help with my order [ORDER_ID]"

### Issue: Location not updating on rider dashboard
**Solution**:
1. Check browser geolocation permissions
2. Allow location access when prompted
3. Location updates every 3 seconds when duty is on

## Performance Testing

### Load Testing Checklist
- [ ] Test with 100 concurrent users
- [ ] Test with 1000 concurrent orders
- [ ] Monitor database query performance
- [ ] Check memory usage on server
- [ ] Verify auto-scaling triggers

### Database Queries to Monitor
```sql
-- Slow query log
SELECT * FROM orders WHERE status = 'pending' AND createdAt > DATE_SUB(NOW(), INTERVAL 1 HOUR);

-- Restaurant earnings
SELECT restaurantId, SUM(totalAmount) as earnings FROM orders GROUP BY restaurantId;

-- Rider performance
SELECT riderId, COUNT(*) as deliveries, AVG(rating) as avgRating FROM orders GROUP BY riderId;
```

## Next Steps After Testing

1. **Integrate Payment Gateway**
   - Razorpay API integration
   - UPI payment flow
   - Payment verification

2. **Implement Real-time Features**
   - WebSocket for live order updates
   - Real-time rider location
   - Push notifications

3. **Add Google Maps**
   - Rider navigation
   - Distance calculation
   - Delivery route optimization

4. **Performance Optimization**
   - Redis caching
   - Database indexing
   - Query optimization

5. **Security Hardening**
   - Rate limiting
   - Input validation
   - SQL injection prevention
   - XSS protection

## Support

For issues during testing:
1. Check browser console for errors (F12)
2. Check server logs in `.manus-logs/`
3. Verify database connection
4. Clear browser cache and cookies
5. Try incognito/private window

---

**Happy Testing! 🚀**
